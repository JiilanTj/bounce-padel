# 🎯 AYO API - Quick Reference

## ✅ Integration Status: LIVE & TESTED

---

## 🔥 Quick Commands

```bash
# Get all bookings
php artisan ayo:test

# Get venue fields
php artisan ayo:test --fields

# Get active fields only
php artisan ayo:test --fields --active-only

# Sync courts from AYO
php artisan courts:sync --force

# Preview sync (dry-run)
php artisan courts:sync --dry-run

# Today's bookings
php artisan ayo:test --date=$(date +%Y-%m-%d)

# Specific date
php artisan ayo:test --date=2026-01-31

# With details
php artisan ayo:test --date=2026-01-31 -v
```

---

## 💡 Code Snippets

### Controller Example
```php
use App\Services\AyoApiService;

class BookingController extends Controller
{
    public function checkAvailability(AyoApiService $ayoService, Request $request)
    {
        $result = $ayoService->getBookingsByDate($request->date);
        
        if ($result['success']) {
            $ayoBookings = $result['data']['data'];
            // Process bookings...
        }
    }
}
```

### Service Example
```php
use App\Services\AyoApiService;

class AvailabilityService
{
    public function __construct(
        protected AyoApiService $ayoService
    ) {}
    
    public function getAvailableSlots(string $date, int $courtId)
    {
        // Get AYO bookings
        $ayoResult = $this->ayoService->getBookingsByDate($date);
        
        // Get local bookings
        $localBookings = Booking::whereDate('date', $date)
            ->where('court_id', $courtId)
            ->get();
        
        // Merge and calculate available slots
        // ...
    }
}
```

### Sync Fields Example
```php
use App\Services\AyoApiService;

class CourtSyncService
{
    public function syncFromAyo(AyoApiService $ayoService)
    {
        // Get active fields from AYO
        $result = $ayoService->getActiveFields();
        
        if ($result['success']) {
            foreach ($result['data']['data'] as $field) {
                // Update or create local court
                Court::updateOrCreate(
                    ['ayo_field_id' => $field['id']],
                    [
                        'name' => $field['name'],
                        'sport_type' => $field['sport_name'],
                        'status' => $field['status'] === 'ACTIVE' ? 'active' : 'inactive',
                    ]
                );
            }
        }
    }
}
```

---

## 📊 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | int | Booking ID (internal) |
| booking_id | string | Booking reference (BK/xxx/xxx/xxx) |
| field_id | int | Court/Field ID |
| field_name | string | Court name |
| date | string | Booking date (YYYY-MM-DD) |
| start_time | string | Start time (HH:MM:SS) |
| end_time | string | End time (HH:MM:SS) |
| total_price | int | Price in IDR |
| status | string | SUCCESS, PENDING, FINISHED, CANCELLED |
| user_id | int | AYO user ID |
| booker_name | string | Customer name |
| booker_phone | string | Phone number |
| booker_email | string | Email |
| booking_source | string | order / reservation |
| note | string\|null | Booking notes |
| created_at | string | ISO 8601 timestamp |

---

## 🔐 Signature Logic

```php
// 1. Build payload (sorted)
$payload = ['date' => '2026-01-31', 'token' => 'xxx'];

// 2. Convert to query string
$query = http_build_query($payload);
// Result: "date=2026-01-31&token=xxx"

// 3. Generate signature
$signature = hash_hmac('sha512', $query, $privateKey);

// 4. Add to payload
$payload['signature'] = $signature;
```

---

## ⚡ Available Methods

### Bookings

| Method | Parameters | Description |
|--------|------------|-------------|
| `getBookings()` | `array $filters = []` | Get all bookings with optional filters |
| `getBookingsByDate()` | `string $date` | Get bookings for specific date |
| `getBookingsByDateRange()` | `string $start, string $end` | Get bookings in date range |
| `getBookingById()` | `string $bookingId` | Get specific booking |
| `getBookingsByField()` | `string $fieldName` | Get bookings by court name |
| `getBookingsByStatus()` | `string $status` | Get bookings by status |

### Fields/Courts

| Method | Parameters | Description |
|--------|------------|-------------|
| `getFields()` | - | Get all venue fields |
| `getActiveFields()` | - | Get only active fields |

---

## 🎨 Status Values

- `SUCCESS` - Booking confirmed & paid
- `PENDING` - Awaiting confirmation
- `FINISHED` - Completed
- `CANCELLED` - Cancelled by user/system

---

## 📝 Test Data (Sandbox)

```
Venue: goilM13uFh
Court: Court 1 (ID: 1002)
Date: 2026-01-31
Bookings: 2 slots
```

---

## 🔍 Debugging

```bash
# Watch logs in real-time
tail -f storage/logs/laravel.log | grep "AYO API"

# Check last 100 lines
tail -n 100 storage/logs/laravel.log | grep "AYO"
```

---

## ⚠️ Production Checklist

- [ ] Update `AYO_BASE_URL` to production URL
- [ ] Update credentials (API key, private key, venue code)
- [ ] Setup Redis for caching
- [ ] Implement rate limiting
- [ ] Add response signature verification
- [ ] Setup error monitoring (Sentry/Bugsnag)
- [ ] Add webhook handler for real-time updates

---

**Last Updated**: Feb 6, 2026  
**Status**: ✅ Working in Sandbox  
**Next**: Implement availability sync & booking creation
