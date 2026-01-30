<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTableRequest extends FormRequest
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
            'number' => ['required', 'string', 'max:50', 'unique:tables,number,' . $this->table->id],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,occupied,reserved'],
        ];
    }
}
