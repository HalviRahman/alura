<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OfferResource;
use App\Http\Resources\PropertyResource;
use App\Models\Agreement;
use App\Models\Offer;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * GET /api/admin/dashboard
     * Ringkasan data untuk admin command center.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $totalOffers  = Offer::count();
        $totalValue   = Offer::where('status', '!=', Offer::STATUS_GUGUR)->sum('offer_price');
        $pendingCount = Offer::where('status', Offer::STATUS_PENDING)->count();
        $finalCount   = Offer::where('status', Offer::STATUS_FINAL)->count();

        $recentOffers = Offer::with(['property', 'agent'])
            ->latest()
            ->take(10)
            ->get();

        $agentStats = User::where('role', 'agent')
            ->withCount(['offers as total_leads'])
            ->get()
            ->map(fn ($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'referral_code' => $u->referral_code,
                'total_leads'   => $u->total_leads,
            ]);

        return response()->json([
            'summary' => [
                'total_offers'  => $totalOffers,
                'total_value'   => $totalValue,
                'pending_count' => $pendingCount,
                'final_count'   => $finalCount,
            ],
            'recent_offers' => OfferResource::collection($recentOffers),
            'agent_stats'   => $agentStats,
        ]);
    }

    /**
     * GET /api/admin/spk-alerts
     * Properti dengan SPK yang akan atau sudah expired, urut dari paling kritis.
     */
    public function spkAlerts(Request $request): JsonResponse
    {
        $agreements = Agreement::with([
                'property' => fn ($q) => $q->withTrashed()->with('images'),
            ])
            ->whereHas('property', fn ($q) => $q->withTrashed())
            ->orderBy('end_date', 'asc')
            ->get()
            ->map(fn ($agr) => [
                'property_id'    => $agr->property_id,
                'property_uuid'  => $agr->property?->uuid,
                'title'          => $agr->property?->title,
                'listing_id'     => $agr->property?->listing_id,
                'spk_number'     => $agr->spk_number,
                'end_date'       => $agr->end_date?->toDateString(),
                'days_remaining' => $agr->daysRemaining(),
                'spk_status'     => $agr->spk_status,
                'image'          => $agr->property?->images?->first()?->url,
            ]);

        $critical = $agreements->where('spk_status', 'critical')->values();
        $warning  = $agreements->where('spk_status', 'warning')->values();
        $active   = $agreements->where('spk_status', 'active')->values();
        $expired  = $agreements->where('spk_status', 'expired')->values();

        return response()->json([
            'critical' => $critical,
            'warning'  => $warning,
            'active'   => $active,
            'expired'  => $expired,
        ]);
    }

    /**
     * GET /api/admin/stats
     * Statistik umum platform.
     */
    public function stats(Request $request): JsonResponse
    {
        $byStatus = Offer::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $byType = Property::where('is_published', true)
            ->select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->pluck('total', 'type');

        return response()->json([
            'offers_by_status'   => $byStatus,
            'properties_by_type' => $byType,
            'total_agents'       => User::where('role', 'agent')->count(),
            'total_properties'   => Property::where('is_published', true)->count(),
        ]);
    }

    /**
     * GET /api/admin/analytics
     * Data analitik lengkap: tren bulanan, performa agen, ringkasan properti.
     */
    public function analytics(Request $request): JsonResponse
    {
        // Tren penawaran 6 bulan terakhir
        $driver = DB::connection()->getDriverName();
        $dateExpression = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at) as month"
            : "DATE_FORMAT(created_at, '%Y-%m') as month";

        $monthlyOffers = Offer::selectRaw("{$dateExpression}, COUNT(*) as total, SUM(offer_price) as total_value")
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Distribusi penawaran by status
        $offersByStatus = Offer::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Distribusi properti by tipe
        $propertiesByType = Property::selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        // Distribusi properti by risiko
        $propertiesByRisk = Property::selectRaw('risk, COUNT(*) as total, AVG(harga_penawaran) as avg_price')
            ->groupBy('risk')
            ->get()
            ->map(fn ($r) => [
                'risk'      => $r->risk,
                'total'     => $r->total,
                'avg_price' => (int) $r->avg_price,
            ]);

        // Top agen by leads
        $topAgents = User::where('role', 'agent')
            ->withCount(['offers as total_leads'])
            ->withCount(['offers as final_leads' => fn ($q) => $q->where('status', 'Final')])
            ->orderByDesc('total_leads')
            ->limit(10)
            ->get()
            ->map(fn ($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'referral_code' => $u->referral_code,
                'total_leads'   => $u->total_leads,
                'final_leads'   => $u->final_leads,
                'conversion'    => $u->total_leads > 0
                    ? round(($u->final_leads / $u->total_leads) * 100, 1)
                    : 0,
            ]);

        // Summary cards
        $summary = [
            'total_properties'        => Property::count(),
            'published_properties'    => Property::where('is_published', true)->count(),
            'total_offers'            => Offer::count(),
            'total_offer_value'       => (int) Offer::where('status', '!=', 'Gugur')->sum('offer_price'),
            'conversion_rate'         => Offer::count() > 0
                ? round((Offer::where('status', 'Final')->count() / Offer::count()) * 100, 1)
                : 0,
            'total_agents'            => User::where('role', 'agent')->count(),
            'spk_expiring_soon'       => \App\Models\Agreement::whereDate('end_date', '>=', now())
                ->whereDate('end_date', '<=', now()->addDays(30))->count(),
        ];

        return response()->json([
            'summary'            => $summary,
            'monthly_offers'     => $monthlyOffers,
            'offers_by_status'   => $offersByStatus,
            'properties_by_type' => $propertiesByType,
            'properties_by_risk' => $propertiesByRisk,
            'top_agents'         => $topAgents,
        ]);
    }

    /**
     * GET /api/admin/reports
     * Laporan offers dengan filter date range, export CSV.
     */
    public function reports(Request $request): mixed
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date'],
            'status'    => ['nullable', 'in:Pending,Follow Up,Reviewed,Final,Gugur'],
            'format'    => ['nullable', 'in:json,csv'],
        ]);

        $query = Offer::with(['property', 'agent'])
            ->latest();

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->input('format') === 'csv') {
            $offers = $query->get();
            $rows   = [];
            $rows[] = ['Tanggal','Pemohon','Email','Phone','Properti','Listing ID','Harga Penawaran','Kode Referral','Agen','Status'];

            foreach ($offers as $o) {
                $rows[] = [
                    $o->created_at->format('d/m/Y H:i'),
                    $o->applicant_name,
                    $o->applicant_email,
                    $o->applicant_phone,
                    $o->property?->title ?? '-',
                    $o->property?->listing_id ?? '-',
                    $o->offer_price,
                    $o->referral_code ?? '-',
                    $o->agent?->name ?? '-',
                    $o->status,
                ];
            }

            $csv      = implode("\n", array_map(fn ($r) => implode(',', array_map(fn ($c) => '"' . str_replace('"', '""', (string) $c) . '"', $r)), $rows));
            $filename = 'laporan-penawaran-' . now()->format('Ymd') . '.csv';

            return response($csv, 200, [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        }

        // JSON paginated
        $offers = $query->paginate(20);

        $summaryQuery = clone $query->getQuery();
        $totalValue   = Offer::with([])->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to,   fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->when($request->status,    fn ($q) => $q->where('status', $request->status))
            ->where('status', '!=', 'Gugur')->sum('offer_price');

        return response()->json([
            'data' => \App\Http\Resources\OfferResource::collection($offers->items()),
            'meta' => [
                'current_page' => $offers->currentPage(),
                'last_page'    => $offers->lastPage(),
                'per_page'     => $offers->perPage(),
                'total'        => $offers->total(),
                'total_value'  => (int) $totalValue,
            ],
        ]);
    }

    /**
     * GET /api/admin/map-locations
     * Titik lokasi seluruh properti untuk peta distribusi.
     */
    public function mapLocations(): JsonResponse
    {
        $properties = Property::with(['assetDetail', 'images', 'agreement'])
            ->whereHas('assetDetail', fn ($q) => $q->whereNotNull('latitude')->whereNotNull('longitude'))
            ->get()
            ->map(fn (Property $p) => [
                'id'            => $p->id,
                'uuid'          => $p->uuid,
                'title'         => $p->title,
                'listing_id'    => $p->listing_id,
                'city'          => $p->city,
                'province'      => $p->province,
                'type'          => $p->type,
                'risk'          => $p->risk,
                'price'         => $p->harga_penawaran,
                'is_published'  => $p->is_published,
                'latitude'      => $p->assetDetail->latitude,
                'longitude'     => $p->assetDetail->longitude,
                'image'         => $p->images->first()?->url,
                'spk_status'    => $p->agreement?->spk_status,
                'days_remaining'=> $p->agreement?->daysRemaining(),
            ]);

        return response()->json($properties);
    }
}
