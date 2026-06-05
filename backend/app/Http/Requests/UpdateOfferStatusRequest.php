<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOfferStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManajemen() ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:Pending,Follow Up,Reviewed,Final,Gugur'],
            'notes'  => ['nullable', 'string', 'max:2000'],
        ];
    }
}
