<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->uuid,
            'uuid'            => $this->uuid,
            'property'        => $this->whenLoaded('property', fn () => [
                'id'         => $this->property->id,
                'title'      => $this->property->title,
                'listing_id' => $this->property->listing_id,
                'city'       => $this->property->city,
            ]),
            'applicant_name'    => $this->applicant_name,
            'applicant_nik'     => $this->applicant_nik,
            'applicant_address' => $this->applicant_address,
            'applicant_email'   => $this->applicant_email,
            'applicant_phone'   => $this->applicant_phone,
            'offer_price'       => $this->offer_price,
            'referral_code'     => $this->referral_code,
            'status'            => $this->status,
            'notes'             => $this->notes,
            'pdf_url'         => $this->when(
                $this->pdf_path,
                fn () => url('/api/offers/' . $this->uuid . '/pdf')
            ),
            'agent'           => $this->whenLoaded('agent', fn () => [
                'id'   => $this->agent?->id,
                'name' => $this->agent?->name,
            ]),
            'created_at'      => $this->created_at?->toDateTimeString(),
        ];
    }
}
