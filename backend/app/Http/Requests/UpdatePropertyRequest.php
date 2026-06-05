<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManajemen() ?? false;
    }

    public function rules(): array
    {
        $propertyId = $this->route('property');

        return [
            'title'            => ['sometimes', 'string', 'max:255'],
            'description'      => ['nullable', 'string', 'max:5000'],
            'harga_penawaran'  => ['sometimes', 'integer', 'min:1'],
            'harga_jual'       => ['nullable', 'integer', 'min:1'],
            'nilai_liquidasi'  => ['nullable', 'integer', 'min:1'],
            'city'             => ['sometimes', 'string', 'max:100'],
            'province'         => ['sometimes', 'string', 'max:100'],
            'type'             => ['sometimes', 'in:Rumah,Apartemen,Ruko,Tanah,Gudang,Perkantoran'],
            'risk'             => ['sometimes', 'in:LOW,MEDIUM,HIGH'],
            'certificate'      => ['sometimes', 'string', 'max:100'],
            'beds'             => ['nullable', 'integer', 'min:0'],
            'baths'            => ['nullable', 'integer', 'min:0'],
            'land_area'        => ['nullable', 'integer', 'min:1'],
            'build_area'       => ['nullable', 'integer', 'min:0'],
            'badge'            => ['nullable', 'string', 'max:50'],
            'is_published'     => ['sometimes', 'boolean'],
            'spk_end_date'     => ['sometimes', 'date'],
            'bank_name'        => ['nullable', 'string', 'max:100'],
        ];
    }
}
