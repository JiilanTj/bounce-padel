<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourtRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:courts,name,' . $this->court->id],
            'type' => ['required', 'in:indoor,outdoor'],
            'surface' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,maintenance,closed'],
            'price_per_hour' => ['required', 'numeric', 'min:0'],
            'operating_hours' => ['nullable', 'array'],
            'image' => ['nullable', 'image', 'max:8192'],
        ];
    }
}
