<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOperatingHoursRequest extends FormRequest
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
            'hours' => ['required', 'array'],
            'hours.*.id' => ['nullable', 'exists:operating_hours,id'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.open_time' => ['required', 'date_format:H:i:s'], // Or H:i depending on frontend input
            'hours.*.close_time' => ['required', 'date_format:H:i:s'],
            'hours.*.is_closed' => ['required', 'boolean'],
        ];
    }
}
