<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * PropertyResource — strips lat/lng for user/agent roles.
 * Only 'manajemen' receives asset_detail coordinates.
 */
class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isManajemen = $user?->isManajemen();

        return [
            'id'               => $this->id,
            'uuid'             => $this->uuid,
            'title'            => $this->title,
            'description'      => $this->description,
            'harga_penawaran'  => $this->harga_penawaran,
            'harga_jual'       => $this->harga_jual,
            'nilai_liquidasi'  => $this->nilai_liquidasi,
            'city'             => $this->city,
            'province'     => $this->province,
            'type'         => $this->type,
            'risk'         => $this->risk,
            'certificate'  => $this->certificate,
            'listing_id'   => $this->listing_id,
            'beds'         => $this->beds,
            'baths'        => $this->baths,
            'land_area'    => $this->land_area,
            'build_area'   => $this->build_area,
            'badge'        => $this->badge,
            'is_published' => $this->is_published,
            'images'       => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => $img->url)->values()
            ),
            'spk' => $this->whenLoaded('agreement', fn () => [
                'spk_number'    => $this->agreement->spk_number,
                'start_date'    => $this->agreement->start_date?->toDateString(),
                'end_date'      => $this->agreement->end_date?->toDateString(),
                'days_remaining'=> $this->agreement->daysRemaining(),
                'status'        => $this->agreement->spk_status,
                'bank_name'     => $this->when($isManajemen, $this->agreement->bank_name),
            ]),
            // PROTEKSI: asset_detail (lat/lng) hanya untuk manajemen
            'asset_detail' => $this->when(
                $isManajemen,
                fn () => $this->whenLoaded('assetDetail', fn () => [
                    'latitude'     => $this->assetDetail?->latitude,
                    'longitude'    => $this->assetDetail?->longitude,
                    'full_address' => $this->assetDetail?->full_address,
                ])
            ),
            'created_at' => $this->created_at?->toDateString(),
        ];
    }
}
