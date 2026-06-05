<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OfferResource;
use App\Http\Resources\PropertyResource;
use App\Models\Offer;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    /**
     * GET /api/agent/properties
     * Daftar properti aktif yang bisa di-referral oleh agen.
     */
    public function properties(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $properties = Property::with(['images', 'agreement'])
            ->published()
            ->latest()
            ->paginate(12);

        return PropertyResource::collection($properties);
    }

    /**
     * GET /api/agent/stats
     * Statistik performa agen berdasarkan kode referral mereka.
     */
    public function stats(Request $request): JsonResponse
    {
        $user         = $request->user();
        $referralCode = $user->referral_code;

        $baseQuery = Offer::where('referral_code', $referralCode);

        $total    = (clone $baseQuery)->count();
        $final    = (clone $baseQuery)->where('status', Offer::STATUS_FINAL)->count();
        $followUp = (clone $baseQuery)->where('status', Offer::STATUS_FOLLOW_UP)->count();
        $pending  = (clone $baseQuery)->where('status', Offer::STATUS_PENDING)->count();
        $gugur    = (clone $baseQuery)->where('status', Offer::STATUS_GUGUR)->count();

        $recentLeads = (clone $baseQuery)
            ->with(['property'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'referral_code' => $referralCode,
            'stats' => [
                'total_leads' => $total,
                'final'       => $final,
                'follow_up'   => $followUp,
                'pending'     => $pending,
                'gugur'       => $gugur,
            ],
            'recent_leads' => OfferResource::collection($recentLeads),
        ]);
    }
}
