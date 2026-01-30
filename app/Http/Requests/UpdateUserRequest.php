<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $targetUser = $this->route('user');

        if (!in_array($user->role, ['owner', 'admin'])) {
            return false;
        }

        // Prevent updating yourself
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Owner cannot update other Owners
        if ($user->role === 'owner' && $targetUser->role === 'owner') {
            return false;
        }

        // Admin cannot update Owner
        if ($user->role === 'admin' && $targetUser->role === 'owner') {
            return false;
        }

        // Check if user can assign the requested role
        $requestedRole = $this->input('role');
        
        // Owner cannot assign Owner role
        if ($user->role === 'owner' && $requestedRole === 'owner') {
            return false;
        }

        // Admin cannot assign Owner role
        if ($user->role === 'admin' && $requestedRole === 'owner') {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'role' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['user', 'kasir', 'pelayan', 'admin', 'owner']),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            'role.required' => 'Role wajib dipilih.',
            'role.in' => 'Role yang dipilih tidak valid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama',
            'email' => 'email',
            'password' => 'password',
            'role' => 'role',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk mengupdate user ini.');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If password is empty, remove it from validation
        if ($this->has('password') && empty($this->password)) {
            $this->merge(['password' => null]);
        }
    }
}
