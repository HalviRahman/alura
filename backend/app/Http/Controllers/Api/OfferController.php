<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfferRequest;
use App\Http\Requests\UpdateOfferStatusRequest;
use App\Http\Resources\OfferResource;
use App\Mail\OfferReceivedMail;
use App\Models\Offer;
use App\Models\Property;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class OfferController extends Controller
{
    /**
     * POST /api/offers
     * Public — siapapun bisa submit penawaran.
     */
    public function store(StoreOfferRequest $request): JsonResponse
    {
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
            'property_id'     => $data['property_id'],
            'agent_id'        => $agentId,
            'applicant_name'  => $data['applicant_name'],
            'applicant_email' => $data['applicant_email'],
            'applicant_phone' => $data['applicant_phone'],
            'offer_price'     => $data['offer_price'],
            'referral_code'   => $agentId ? $data['referral_code'] : null,
            'status'          => Offer::STATUS_PENDING,
        ]);

        // Generate PDF penawaran
        try {
            $pdfPath = $this->generateOfferPdf($offer, $property, $agentId ? $agent ?? null : null);
            $offer->update(['pdf_path' => $pdfPath]);
        } catch (\Exception $e) {
            // PDF gagal tidak membatalkan offer
            logger()->error('PDF generation failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
        }

        // Kirim notifikasi email ke manajemen
        try {
            $manajemen = \App\Models\User::where('role', 'manajemen')->get();
            foreach ($manajemen as $admin) {
                Mail::to($admin->email)->queue(
                    new OfferReceivedMail($offer, $property, $agentId ? $agent ?? null : null)
                );
            }
        } catch (\Exception $e) {
            logger()->error('Offer email notification failed', ['offer_id' => $offer->id, 'error' => $e->getMessage()]);
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

        return response()->json([
            'message' => 'Status penawaran diperbarui.',
            'offer'   => new OfferResource($offer),
        ]);
    }

    /**
     * GET /api/offers/{uuid}/pdf
     * Download PDF penawaran — publik via UUID (aman karena UUID tidak tertebak).
     */
    public function downloadPdf(Request $request, Offer $offer): Response|JsonResponse
    {
        if (!$offer->pdf_path || !Storage::disk('public')->exists($offer->pdf_path)) {
            return response()->json(['message' => 'PDF tidak tersedia.'], 404);
        }

        $content  = Storage::disk('public')->get($offer->pdf_path);
        $filename = "penawaran-{$offer->uuid}-{$offer->applicant_name}.pdf";

        return response($content, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function generateOfferPdf(Offer $offer, Property $property, ?User $agent): string
    {
        $pdf  = Pdf::loadView('pdf.offer', compact('offer', 'property', 'agent'));
        $path = "offers/offer-{$offer->uuid}.pdf";
        Storage::disk('public')->put($path, $pdf->output());
        return $path;
    }
}
