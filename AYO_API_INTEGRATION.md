# AYO API Integration - Usage Guide

## ✅ Status: TESTED & WORKING

API berhasil terkoneksi dengan sandbox AYO dan signature generation berfungsi dengan sempurna.

---

## 📦 Files Created

1. **Config**: `config/services.php` - Ayo API configuration
2. **Service**: `app/Services/AyoApiService.php` - Main API client
3. **Command**: `app/Console/Commands/TestAyoApi.php` - Test command

---

## 🔧 Configuration

Configuration sudah setup di `.env`:

```env
AYO_API_KEY=
AYO_PRIVATE_KEY=
AYO_VENUE_CODE=
AYO_BASE_URL=
```

Dan di-load melalui `config/services.php`:

```php
'ayo' => [
    'api_key' => env('AYO_API_KEY'),
    'private_key' => env('AYO_PRIVATE_KEY'),
    'venue_code' => env('AYO_VENUE_CODE'),
    'base_url' => env('AYO_BASE_URL'),
],
```

---

## 🚀 Testing via Artisan Command

### Get Bookings Tests

#### Basic Test (All Bookings)
```bash
php artisan ayo:test
```

### Filter by Date
```bash
php artisan ayo:test --date=2026-01-31
```

### Filter by Date Range
```bash
php artisan ayo:test --start-date=2026-01-01 --end-date=2026-01-31
```

### Filter by Status
```bash
php artisan ayo:test --status=FINISHED
# Options: SUCCESS, PENDING, CANCELLED, FINISHED
```

### Filter by Field Name
```bash
php artisan ayo:test --field-name="Court 1"
```

### Filter by Booking ID
```bash
php artisan ayo:test --booking-id="BK/1183/260130/0000001"
```

### Verbose Mode (Show Full JSON Response)
```bash
php artisan ayo:test -v
php artisan ayo:test --date=2026-01-31 -v
```

### Combined Filters
```bash
php artisan ayo:test --date=2026-01-31 --status=FINISHED --field-name="Court 1" -v
```

### Get Venue Fields Tests

#### Get All Fields
```bash
php artisan ayo:test --fields
```

#### Get Active Fields Only
```bash
php artisan ayo:test --fields --active-only
```

#### Verbose Mode (Show Full JSON)
```bash
php artisan ayo:test --fields -v
```

---

## 💻 Usage in Code

### Basic Usage

```php
use App\Services\AyoApiService;

// Inject via constructor
public function __construct(protected AyoApiService $ayoService)
{
}

// Or resolve manually
$ayoService = app(AyoApiService::class);
```

### Get All Bookings

```php
$result = $ayoService->getBookings();

if ($result['success']) {
    $bookings = $result['data']['data'];
    foreach ($bookings as $booking) {
        echo $booking['booking_id'];
    }
}
```

### Get Bookings by Date

```php
$result = $ayoService->getBookingsByDate('2026-01-31');
```

### Get Bookings by Date Range

```php
$result = $ayoService->getBookingsByDateRange('2026-01-01', '2026-01-31');
```

### Get Booking by ID

```php
$result = $ayoService->getBookingById('BK/1183/260130/0000001');
```

### Get Bookings by Field

```php
$result = $ayoService->getBookingsByField('Court 1');
```

### Get Bookings by Status

```php
$result = $ayoService->getBookingsByStatus('FINISHED');
```

### Custom Filters

```php
$result = $ayoService->getBookings([
    'date' => '2026-01-31',
    'field_name' => 'Court 1',
    'status' => 'FINISHED',
]);
```

### Get Venue Fields

```php
// Get all fields
$result = $ayoService->getFields();

if ($result['success']) {
    $fields = $result['data']['data'];
    foreach ($fields as $field) {
        echo "Field ID: {$field['id']}\n";
        echo "Name: {$field['name']}\n";
        echo "Sport: {$field['sport_name']}\n";
    }
}
```

### Get Active Fields Only

```php
// Get only active fields
$result = $ayoService->getActiveFields();
```

---

## 📊 Response Structure

### Bookings Response

#### Success Response

```php
[
    'success' => true,
    'status_code' => 200,
    'data' => [
        'error' => false,
        'status_code' => 200,
        'data' => [
            [
                'id' => 6288,
                'order_detail_id' => 6288,
                'booking_id' => 'BK/1183/260130/0000001',
                'field_id' => 1002,
                'field_name' => 'Court 1',
                'date' => '2026-01-31',
                'start_time' => '06:00:00',
                'end_time' => '07:00:00',
                'total_price' => 350000,
                'status' => 'FINISHED',
                'user_id' => 83751,
                'booker_name' => 'Thomas',
                'booker_phone' => '6284718278181',
                'booker_email' => 'tms.ucic@gmail.com',
                'booking_source' => 'order',
                'note' => null,
                'created_at' => '2026-01-30T01:47:36.000000Z'
            ],
            // ... more bookings
        ],
        'signature' => 'RESPONSE_SIGNATURE'
    ]
]
```

### Error Response

```php
[
    'success' => false,
    'status_code' => 400,
    'error' => [
        'message' => 'Error message',
        // ... error details
    ]
]
```

---

## 🔐 Signature Generation

Service sudah handle signature generation secara otomatis dengan aturan:

1. ✅ Remove `signature` field dari payload
2. ✅ Sort keys alphabetically (ASC)
3. ✅ Convert to URL query string
4. ✅ Generate HMAC SHA512 dengan private key

**Contoh:**

```php
// Payload
['token' => 'xxx', 'date' => '2026-01-31']

// After sort
['date' => '2026-01-31', 'token' => 'xxx']

// Query string
'date=2026-01-31&token=xxx'

// Signature
hash_hmac('sha512', $queryString, $privateKey)
```

---

## 📝 Test Results (Feb 6, 2026)

### ✅ Test 1: All Bookings
```bash
php artisan ayo:test
```
**Result**: ✅ SUCCESS - Found 2 bookings

### ✅ Test 2: Filter by Date
```bash
php artisan ayo:test --date=2026-01-31
```
**Result**: ✅ SUCCESS - Found 2 bookings

### ✅ Test 3: Filter by Status
```bash
php artisan ayo:test --status=FINISHED
```
**Result**: ✅ SUCCESS - Found 2 bookings

### ✅ Test 4: Old Date (No Data)
```bash
php artisan ayo:test --date=2023-02-06
```
**Result**: ✅ SUCCESS - No bookings found (expected)

### ✅ Test 5: Get Venue Fields
```bash
php artisan ayo:test --fields
```
**Result**: ✅ SUCCESS - Found 1 field (Court 1)

**Field Data:**
- ID: 1002
- Name: Court 1
- Sport: Padel
- Status: ACTIVE
- is_active: 1
- is_permanent_active: 1

### ✅ Test 6: Get Active Fields Only
```bash
php artisan ayo:test --fields --active-only
```
**Result**: ✅ SUCCESS - Found 1 active field

---

## 🎯 Next Steps

1. **Sync Logic**: Buat service untuk sync bookings dari AYO ke local database
2. **Availability Check**: Implement availability check yang merge local + AYO bookings
3. **Webhook**: Setup webhook untuk real-time updates dari AYO
4. **Caching**: Cache hasil query untuk performa
5. **Lock Mechanism**: Implement lock untuk prevent double booking

---

## 🐛 Debugging

Semua request & response di-log ke Laravel log:

```bash
tail -f storage/logs/laravel.log
```

Log includes:
- Request payload
- Generated signature
- Query string
- Response data
- Errors (if any)

---

## ⚠️ Important Notes

1. **Sandbox Environment**: Saat ini menggunakan sandbox. Untuk production, ganti `AYO_BASE_URL`
2. **Signature Validation**: Response signature belum di-verify (bisa ditambahkan kalau perlu)
3. **Rate Limiting**: Belum ada rate limiting, pertimbangkan untuk production
4. **Error Handling**: Sudah ada basic error handling, bisa diperluas sesuai kebutuhan

---

## 📚 References

- Documentation: `ayo_documentaion.md`
- Service: `app/Services/AyoApiService.php`
- Command: `app/Console/Commands/TestAyoApi.php`
- Config: `config/services.php`
