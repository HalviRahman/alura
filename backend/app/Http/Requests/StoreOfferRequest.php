<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Anyone can submit an offer (public endpoint)
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id'     => ['required', 'integer', 'exists:properties,id'],
            'applicant_name'  => ['required', 'string', 'max:255'],
            'applicant_email' => ['required', 'email', 'max:255'],
            'applicant_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9\+\-\s\(\)]{8,20}$/'],
            'offer_price'     => ['required', 'integer', 'min:0'],
            // referral_code is OPTIONAL — server will validate existence
            'referral_code'   => ['nullable', 'string', 'max:60'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.exists'      => 'Properti tidak ditemukan.',
            'applicant_phone.regex'   => 'Format nomor telepon tidak valid.',
            'offer_price.min'         => 'Harga penawaran tidak boleh negatif.',
        ];
    }
}
