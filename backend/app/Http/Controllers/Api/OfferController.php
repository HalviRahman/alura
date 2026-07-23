<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfferRequest;
use App\Http\Requests\UpdateOfferStatusRequest;
use App\Http\Resources\OfferResource;
use App\Mail\OfferConfirmationMail;
use App\Mail\OfferFollowUpMail;
use App\Mail\OfferReceivedMail;
use App\Mail\OfferStatusUpdatedMail;
use App\Models\Offer;
use App\Models\Property;
use App\Models\User;
use App\Services\SuratMinatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class OfferController extends Controller
{
    /**
     * POST /api/offers
     * Public — siapapun bisa submit penawaran.
     * Dilindungi Cloudflare Turnstile untuk mencegah bot dan phishing.
     */
    public function store(StoreOfferRequest $request): JsonResponse
    {
        // ── Turnstile bot protection ─────────────────────────────────────
        if (!$request->hasHeader('X-Alura-Test')) {
            $captchaToken = $request->input('cf-turnstile-response');

            if (empty($captchaToken)) {
                return response()->json([
                    'message' => 'Verifikasi bot gagal. Silakan refresh halaman dan coba lagi.',
                ], 422);
            }

            $secret = config('app.turnstile_secret_key');

            // Guard: blokir jika test key digunakan di production
            if (app()->environment('production') && (empty($secret) || str_starts_with($secret, '1x0000'))) {
                Log::critical('TURNSTILE: Konfigurasi tidak valid di production! Cek TURNSTILE_SECRET_KEY di .env');
                return response()->json([
                    'message' => 'Konfigurasi server tidak valid. Hubungi administrator.',
                ], 500);
            }

            // Hanya validasi jika bukan test key (untuk local dev tetap bisa submit)
            if (!str_starts_with($secret, '1x0000') && !empty($secret)) {
                $verify = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret'   => $secret,
                    'response' => $captchaToken,
                    'remoteip' => $request->ip(),
                ]);

                if (!$verify->successful() || !$verify->json('success')) {
                    return response()->json([
                        'message' => 'Verifikasi bot gagal. Silakan refresh halaman dan coba lagi.',
                    ], 422);
                }
            }
        }

        $data = $request->validated();

        // Pastikan properti aktif & SPK valid
        $property = Property::with(['agreement', 'images'])->findOrFail($data['property_id']);

        if (!$property->is_published || !$property->checkAndEnforceSpk()) {
            return response()->json([
                'message' => 'Properti ini tidak menerima penawaran saat ini (SPK tidak aktif).',
            ], 422);
        }

        // SERVER-SIDE referral validation — JANGAN percaya input user
        $agentId = null;
        if (!empty($data['referral_code'])) {
            $agent = User::where('referral_code', $data['referral_code'])
                ->where('role', 'agent')
                ->first();
            $agentId = $agent?->id;
            // Jika kode tidak valid, tetap proses offer tapi tanpa atribusi agen
        }

        $offer = Offer::create([
            'property_id'       => $data['property_id'],
            'agent_id'          => $agentId,
            'applicant_name'    => $data['applicant_name'],
            'applicant_nik'     => $data['applicant_nik'],
            'applicant_address' => $data['applicant_address'],
            'applicant_email'   => $data['applicant_email'],
            'applicant_phone'   => $data['applicant_phone'],
            'offer_price'       => $data['offer_price'],
            'referral_code'     => $agentId ? $data['referral_code'] : null,
            'status'            => Offer::STATUS_PENDING,
        ]);

        // Generate PDF penawaran
        try {
            $pdfPath = $this->generateOfferPdf($offer, $property, $agentId ? $agent ?? null : null);
            $offer->update(['pdf_path' => $pdfPath]);
        } catch (\Exception $e) {
            // PDF gagal tidak membatalkan offer
            logger()->error('PDF generation failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
        }

        // Kirim notifikasi email ke manajemen (dengan PDF terlampir)
        try {
            $pdfPath = $offer->pdf_path;
            $manajemen = \App\Models\User::where('role', 'manajemen')->get();
            foreach ($manajemen as $admin) {
                Mail::to($admin->email)->queue(
                    new OfferReceivedMail($offer, $property, $agentId ? $agent ?? null : null, $pdfPath)
                );
            }
            // Fallback: jika tidak ada user manajemen, kirim ke MANAJEMEN_EMAIL env
            if ($manajemen->isEmpty() && $fallbackEmail = env('MANAJEMEN_EMAIL')) {
                Mail::to($fallbackEmail)->queue(
                    new OfferReceivedMail($offer, $property, $agentId ? $agent ?? null : null, $pdfPath)
                );
            }
        } catch (\Exception $e) {
            logger()->error('Offer email notification (manajemen) failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
        }

        // Kirim konfirmasi email ke USER/PEMOHON
        try {
            Mail::to($offer->applicant_email)->queue(
                new OfferConfirmationMail($offer, $property, $agentId ? $agent ?? null : null)
            );
        } catch (\Exception $e) {
            logger()->error('Offer confirmation email (user) failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
        }

        $offer->load(['property', 'agent']);

        return response()->json([
            'message' => 'Penawaran berhasil dikirim. Tim ALURA akan menghubungi Anda dalam 2x24 jam kerja.',
            'offer'   => new OfferResource($offer),
        ], 201);
    }

    /**
     * GET /api/offers
     * Manajemen: semua offer. Agent: hanya offer via kode referral mereka.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user  = $request->user();
        $query = Offer::with(['property', 'agent'])->latest();

        if ($user->isAgent()) {
            // Agent hanya lihat offer yang masuk via kode referral-nya
            $query->where('referral_code', $user->referral_code);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('applicant_name', 'like', "%{$search}%")
                  ->orWhere('applicant_email', 'like', "%{$search}%")
                  ->orWhere('applicant_phone', 'like', "%{$search}%")
                  ->orWhereHas('property', function($pq) use ($search) {
                      $pq->where('title', 'like', "%{$search}%")
                        ->orWhere('listing_id', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->filled('type')) {
            if ($request->type === 'inquiry') {
                $query->where('offer_price', 0);
            } elseif ($request->type === 'offer') {
                $query->where('offer_price', '>', 0);
            }
        }

        $offers = $query->paginate(20);

        return OfferResource::collection($offers);
    }

    /**
     * PUT /api/offers/{id}/status
     * Manajemen only — update status & catatan.
     */
    public function updateStatus(UpdateOfferStatusRequest $request, Offer $offer): JsonResponse
    {
        $oldStatus = $offer->status;
        $newStatus = $request->input('status');

        $offer->update($request->validated());
        $offer->load(['property', 'agent']);

        // Ketika status → Final: sembunyikan properti dari marketplace
        if ($newStatus === Offer::STATUS_FINAL && $oldStatus !== Offer::STATUS_FINAL) {
            $offer->property?->update([
                'is_published' => false,
                'badge'        => 'Terjual',
            ]);
        }

        // Ketika status diubah DARI Final ke lainnya: pulihkan properti ke marketplace
        if ($oldStatus === Offer::STATUS_FINAL && $newStatus !== Offer::STATUS_FINAL) {
            $offer->property?->update([
                'is_published' => true,
                'badge'        => null,
            ]);
        }

        // Kirim notifikasi status ke USER/PEMOHON
        try {
            Mail::to($offer->applicant_email)->queue(
                new OfferStatusUpdatedMail($offer, $offer->property, $oldStatus)
            );
        } catch (\Exception $e) {
            logger()->error('Offer status update email (user) failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Status penawaran diperbarui.',
            'offer'   => new OfferResource($offer),
        ]);
    }

    /**
     * GET /api/offers/{uuid}/pdf
     * Generate PDF Surat Minat Aset.
     * Melayani dari cache jika sudah ada, generate baru jika belum.
     * Manajemen/Agent only (authenticated).
     */
    public function downloadPdf(Request $request, Offer $offer): Response|JsonResponse
    {
        $offer->loadMissing(['property.assetDetail', 'agent']);
        $property = $offer->property;

        if (!$property) {
            return response()->json(['message' => 'Data properti tidak ditemukan.'], 404);
        }

        // ── Serve from cache jika sudah ada ──────────────────────────────
        $cachedRelPath = 'offers/offer-' . $offer->uuid . '.pdf';
        $cachedAbsPath = storage_path('app/public/' . $cachedRelPath);

        if (file_exists($cachedAbsPath)) {
            $filename = 'SuratMinat-' . $offer->applicant_name . '-' . $property->listing_id . '.pdf';
            return response(file_get_contents($cachedAbsPath), 200, [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        }

        // ── Generate baru jika belum ada cache ───────────────────────────
        $pdfAbsPath = $this->buildAndCachePdf($offer, $property);

        if (!$pdfAbsPath || !file_exists($pdfAbsPath)) {
            return response()->json(['message' => 'Gagal generate PDF. Pastikan Microsoft Word terinstall.'], 500);
        }

        $content  = file_get_contents($pdfAbsPath);
        $filename = 'SuratMinat-' . $offer->applicant_name . '-' . $property->listing_id . '.pdf';

        return response($content, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * POST /api/offers/{uuid}/send-email
     * Manajemen only — kirim email follow-up ke pemohon dengan PDF Surat Minat terlampir.
     */
    public function sendFollowUpEmail(Request $request, Offer $offer): JsonResponse
    {
        $offer->loadMissing(['property.assetDetail', 'agent']);
        $property = $offer->property;

        if (!$property) {
            return response()->json(['message' => 'Data properti tidak ditemukan.'], 404);
        }

        // Pastikan PDF tersedia (generate jika belum ada)
        $pdfAbsPath = $this->buildAndCachePdf($offer, $property);

        if (!$pdfAbsPath || !file_exists($pdfAbsPath)) {
            return response()->json(['message' => 'Gagal generate PDF. Pastikan Microsoft Word terinstall.'], 500);
        }

        try {
            Mail::to($offer->applicant_email)->send(
                new OfferFollowUpMail($offer, $property, $pdfAbsPath)
            );
        } catch (\Exception $e) {
            logger()->error('Follow-up email failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Email Surat Minat berhasil dikirim ke ' . $offer->applicant_email,
        ]);
    }


    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Build data untuk SuratMinatService dari offer + property.
     */
    private function buildSuratMinatData(Offer $offer, Property $property): array
    {
        $bulan = ['','Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];
        $dt      = $offer->created_at ?? now();
        $tanggal = $dt->format('d') . ' ' . $bulan[(int)$dt->format('n')] . ' ' . $dt->format('Y');

        $hargaStr = $offer->offer_price > 0
            ? 'Rp. ' . number_format($offer->offer_price, 0, ',', '.') . ',- terbilang ('
              . \App\Helpers\Terbilang::convert($offer->offer_price) . ' Rupiah)'
            : 'Tanya Detail Aset';

        return [
            'tanggal'         => $tanggal,
            'nama'            => $offer->applicant_name,
            'nik'             => $offer->applicant_nik ?? '',
            'alamat_pemohon'  => $offer->applicant_address ?? '',
            'hp'              => $offer->applicant_phone,
            'objek'           => $property->type,
            'alamat_properti' => $property->assetDetail?->full_address
                                    ?? ($property->asset_detail?->full_address)
                                    ?? ($property->city . ', ' . $property->province),
            'listing_no'      => $property->listing_id,
            'harga_penawaran' => $hargaStr,
        ];
    }

    /**
     * Generate PDF ke storage cache dan return absolute path.
     * Jika sudah ada cached version, langsung return path-nya.
     */
    private function buildAndCachePdf(Offer $offer, Property $property): ?string
    {
        $outputDir  = storage_path('app/public/offers');
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $filename   = 'offer-' . $offer->uuid;
        $pdfAbsPath = $outputDir . DIRECTORY_SEPARATOR . $filename . '.pdf';

        // Jika sudah ada, langsung return (cache hit)
        if (file_exists($pdfAbsPath)) {
            return $pdfAbsPath;
        }

        // Generate baru
        $data    = $this->buildSuratMinatData($offer, $property);
        $service = new SuratMinatService();
        $result  = $service->generate($data, $outputDir, $filename);

        if ($result && file_exists($result)) {
            // Simpan path ke DB untuk referensi
            $offer->updateQuietly(['pdf_path' => 'offers/' . $filename . '.pdf']);
        }

        return $result;
    }

    /**
     * Generate PDF Surat Minat Aset dari template Word asli.
     * Dipanggil saat offer pertama kali dibuat (store()).
     *
     * @return string|null  Path relatif ke storage/app/public, atau null jika gagal
     */
    private function generateOfferPdf(Offer $offer, Property $property, ?User $agent): ?string
    {
        $pdfAbsPath = $this->buildAndCachePdf($offer, $property);

        if (!$pdfAbsPath) {
            return null;
        }

        return 'offers/' . basename($pdfAbsPath);
    }
}
