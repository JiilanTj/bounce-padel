# User Management System Documentation

## Overview

Sistem User Management yang lengkap dengan authorization berbasis role. Hanya Owner dan Admin yang dapat mengelola user, dengan batasan tertentu untuk menjaga keamanan sistem.

## Authorization Rules

### Owner
- ✅ Dapat membuat user dengan role: `admin`, `pelayan`, `kasir`, `user`
- ❌ **TIDAK** dapat membuat user dengan role `owner` (mencegah multiple owners)
- ✅ Dapat mengupdate user apapun kecuali diri sendiri
- ✅ Dapat menghapus user apapun kecuali Owner lain dan diri sendiri

### Admin
- ✅ Dapat membuat user dengan role: `admin`, `pelayan`, `kasir`, `user`
- ❌ **TIDAK** dapat membuat user dengan role `owner`
- ✅ Dapat mengupdate user apapun kecuali Owner dan diri sendiri
- ✅ Dapat menghapus user apapun kecuali Owner dan diri sendiri

### Role Lain (Kasir, Pelayan, User)
- ❌ **403 Forbidden** - Tidak memiliki akses ke user management

## API Endpoints

### List Users
```
GET /users
```
**Query Parameters:**
- `search` - Search by name or email
- `role` - Filter by role
- `sort_by` - Sort column (name, email, role, created_at, updated_at)
- `sort_order` - Sort direction (asc, desc)
- `per_page` - Items per page (max 100)

**Authorization:** Owner, Admin

### Create User
```
GET /users/create
POST /users
```
**Authorization:** Owner, Admin

**Request Body (POST):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "kasir"
}
```

**Validation:**
- `name`: required, string, max:255
- `email`: required, email, unique
- `password`: required, min:8, confirmed
- `role`: required, in:user,kasir,pelayan,admin,owner

### Show User
```
GET /users/{id}
```
**Authorization:** Owner, Admin

### Edit User
```
GET /users/{id}/edit
PUT/PATCH /users/{id}
```
**Authorization:** Owner, Admin (with restrictions)

**Request Body (PUT/PATCH):**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123",  // optional
  "password_confirmation": "newpassword123",  // optional
  "role": "admin"  // optional
}
```

**Note:** Password hanya diupdate jika diisi. Jika kosong, password tidak berubah.

### Delete User
```
DELETE /users/{id}
```
**Authorization:** Owner, Admin (with restrictions)

## Files Created

### Controllers
- `app/Http/Controllers/UserController.php` - Main controller dengan CRUD lengkap

### Requests (Validation)
- `app/Http/Requests/StoreUserRequest.php` - Validation untuk create user
- `app/Http/Requests/UpdateUserRequest.php` - Validation untuk update user

### Policies
- `app/Policies/UserPolicy.php` - Authorization policy dengan rules lengkap

### Providers
- `app/Providers/AuthServiceProvider.php` - Register UserPolicy

### Routes
- Added to `routes/web.php`:
  ```php
  Route::middleware('role:owner,admin')->group(function () {
      Route::resource('users', \App\Http\Controllers\UserController::class);
  });
  ```

## Security Features

1. **Role-based Authorization** - Hanya Owner dan Admin yang bisa akses
2. **Self-protection** - User tidak bisa update/delete diri sendiri
3. **Owner Protection** - Owner tidak bisa dibuat oleh siapapun (termasuk Owner lain)
4. **Request Validation** - Comprehensive validation dengan custom messages (Bahasa Indonesia)
5. **Policy-based Authorization** - Menggunakan Laravel Policy untuk granular control
6. **Password Hashing** - Password otomatis di-hash menggunakan bcrypt
7. **Email Uniqueness** - Email harus unique di database

## Usage Examples

### Create User (Owner/Admin)
```php
// Via API/Form
POST /users
{
  "name": "Kasir Baru",
  "email": "kasir@bounce.com",
  "password": "securepassword123",
  "password_confirmation": "securepassword123",
  "role": "kasir"
}
```

### Update User (Owner/Admin)
```php
// Update name and email only
PUT /users/1
{
  "name": "Kasir Updated",
  "email": "kasir.updated@bounce.com"
}

// Update with password
PUT /users/1
{
  "name": "Kasir Updated",
  "email": "kasir.updated@bounce.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "role": "admin"
}
```

### Search & Filter
```php
// Search users
GET /users?search=john

// Filter by role
GET /users?role=kasir

// Sort
GET /users?sort_by=name&sort_order=asc

// Combined
GET /users?search=john&role=kasir&sort_by=created_at&sort_order=desc&per_page=20
```

## Next Steps

Frontend pages perlu dibuat:
1. `resources/js/Pages/Users/Index.tsx` - List users dengan search & filter
2. `resources/js/Pages/Users/Create.tsx` - Form create user
3. `resources/js/Pages/Users/Edit.tsx` - Form edit user
4. `resources/js/Pages/Users/Show.tsx` - Detail user

## Testing

Untuk test backend:
```bash
# Test create user (as Owner/Admin)
php artisan tinker
$user = User::where('role', 'owner')->first();
Auth::login($user);

# Test authorization
$response = $this->get('/users');
$response->assertStatus(200);

# Test create user
$response = $this->post('/users', [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'password123',
    'password_confirmation' => 'password123',
    'role' => 'kasir'
]);
```

## Notes

- Semua error messages dalam Bahasa Indonesia
- Password minimal 8 karakter
- Email harus unique
- Role validation menggunakan enum
- Pagination default 15 items per page, max 100
- Search menggunakan LIKE query untuk name dan email
- Sorting support untuk: name, email, role, created_at, updated_at
