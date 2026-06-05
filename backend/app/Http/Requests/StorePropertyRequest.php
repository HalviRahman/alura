<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManajemen() ?? false;
    }

    public function rules(): array
    {
        return [
            // Property fields
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string', 'max:5000'],
            'harga_penawaran'  => ['required', 'integer', 'min:1'],
            'harga_jual'       => ['nullable', 'integer', 'min:1'],
            'nilai_liquidasi'  => ['nullable', 'integer', 'min:1'],
            'city'             => ['required', 'string', 'max:100'],
            'province'         => ['required', 'string', 'max:100'],
            'type'             => ['required', 'in:Rumah,Apartemen,Ruko,Tanah,Gudang,Perkantoran'],
            'risk'             => ['required', 'in:LOW,MEDIUM,HIGH'],
            'certificate'      => ['required', 'string', 'max:100'],
            'beds'             => ['nullable', 'integer', 'min:0', 'max:50'],
            'baths'            => ['nullable', 'integer', 'min:0', 'max:50'],
            'land_area'        => ['nullable', 'integer', 'min:1'],
            'build_area'       => ['nullable', 'integer', 'min:0'],
            'badge'            => ['nullable', 'string', 'max:50'],
            // Images
            'images'       => ['nullable', 'array', 'max:10'],
            'images.*'     => ['file', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            // SPK fields
            'spk_number'     => ['required', 'string', 'max:100', 'unique:agreements,spk_number'],
            'spk_start_date' => ['required', 'date'],
            'spk_end_date'   => ['required', 'date', 'after:spk_start_date'],
            'bank_name'      => ['nullable', 'string', 'max:100'],
            'spk_notes'      => ['nullable', 'string', 'max:2000'],
            // Asset detail
            'full_address'   => ['nullable', 'string', 'max:500'],
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }

    public function messages(): array
    {
        return [
            'harga_penawaran.required' => 'Harga penawaran properti wajib diisi.',
            'type.in'                  => 'Tipe properti tidak valid.',
            'spk_end_date.after'       => 'Tanggal akhir SPK harus setelah tanggal mulai.',
            'spk_number.unique'        => 'Nomor SPK sudah terdaftar.',
            'images.*.max'             => 'Ukuran gambar maksimal 5MB.',
            'images.*.image'           => 'File harus berupa gambar (jpeg, png, webp).',
        ];
    }
}
