<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku,' . $this->product->id],
            'description' => ['nullable', 'string'],
            'price_buy' => ['nullable', 'numeric', 'min:0'],
            'price_rent' => ['nullable', 'numeric', 'min:0'],
            // Stock updates might be allowed here or ignored, but validating them ensures integrity if sent
            'stock_buy' => ['required', 'integer', 'min:0'],
            'stock_rent' => ['required', 'integer', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
