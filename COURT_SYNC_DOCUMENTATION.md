# Court Sync System - AYO API Integration

## ✅ Status: IMPLEMENTED & TESTED

Sistem sinkronisasi otomatis untuk menghubungkan data lapangan dari AYO API ke database lokal.

---

## 📦 Files Created/Modified

1. **Migration**: `database/migrations/2026_02_06_002559_add_ayo_field_id_to_courts_table.php`
2. **Model**: `app/Models/Court.php` - Added `ayo_field_id` to fillable
3. **Service**: `app/Services/CourtSyncService.php` - Main sync logic
4. **Command**: `app/Console/Commands/SyncCourtsFromAyo.php` - CLI command

---

## 🎯 Features

### ✅ Implemented

- [x] Add `ayo_field_id` column to courts table
- [x] Two-way mapping (AYO Field ID ↔ Local Court ID)
- [x] Create new courts from AYO fields
- [x] Update existing courts when data changes
- [x] Skip courts with no changes
- [x] Dry-run mode for preview
- [x] Active fields only filter
- [x] Detailed sync reports
- [x] Error handling & logging
- [x] Transaction support (all or nothing)

---

## 🚀 Usage

### Basic Sync (Active Fields Only)

```bash
php artisan courts:sync
```

Interactive mode dengan confirmation prompt.

### Quick Sync (Skip Confirmation)

```bash
php artisan courts:sync --force
```

### Preview Changes (Dry Run)

```bash
php artisan courts:sync --dry-run
```

Melihat perubahan tanpa menyimpan ke database.

### Sync All Fields (Including Inactive)

```bash
php artisan courts:sync --all
```

### Verbose Mode (Show Details)

```bash
php artisan courts:sync --force -v
```

---

## 📊 Sync Behavior

### 1. Create New Court

**Condition:** Field exists in AYO but not in local DB

**Action:**
- Create new Court record
- Set `ayo_field_id` from AYO field ID
- Map status (ACTIVE → active, INACTIVE → closed)
- Set default `price_per_hour` = 0
- Create default operating hours (Mon-Sun, 08:00-22:00)

**Example:**
```
✨ Created:
   • Court 1 (AYO Field ID: 1002)
```

### 2. Update Existing Court

**Condition:** Field exists in both AYO and local DB, data differs

**Action:**
- Update changed fields only
- Keep manual data (price, image, etc.)
- Log all changes

**Example:**
```
🔄 Updated:
   • Court 1 (Court ID: 5)
      - status: active → closed
      - surface: Artificial Turf → Padel
```

### 3. Skip Unchanged Court

**Condition:** Field exists in both, data identical

**Action:**
- Skip update
- No database changes

**Example:**
```
📊 Summary:
   Skipped: 1
```

---

## 💡 Code Usage

### Service Injection

```php
use App\Services\CourtSyncService;

class BookingController extends Controller
{
    public function __construct(
        protected CourtSyncService $syncService
    ) {}
    
    public function syncCourts()
    {
        $result = $this->syncService->syncFromAyo(
            activeOnly: true,
            dryRun: false
        );
        
        if ($result['success']) {
            $stats = $result['stats'];
            // Process stats...
        }
    }
}
```

### Preview Sync

```php
$preview = $syncService->previewSync(activeOnly: true);

echo "Will create: {$preview['stats']['created']}";
echo "Will update: {$preview['stats']['updated']}";
```

### Check Court Sync Status

```php
// Check if court has AYO field ID
$isSynced = $syncService->isCourtSyncedWithAyo($courtId);

// Get AYO field ID for court
$ayoFieldId = $syncService->getAyoFieldId($courtId);

// Get local court by AYO field ID
$court = $syncService->getCourtByAyoFieldId(1002);
```

---

## 🗺️ Field Mapping

### AYO → Local

| AYO Field | Local Field | Mapping Logic |
|-----------|-------------|---------------|
| `id` | `ayo_field_id` | Direct |
| `name` | `name` | Direct |
| `status` + `is_active` | `status` | ACTIVE + 1 → 'active', else 'closed' |
| `sport_name` | `surface` | Direct (e.g., 'Padel') |
| - | `type` | Default: 'indoor' (manual edit) |
| - | `price_per_hour` | Default: 0 (manual edit) |
| - | `image_path` | null (manual upload) |

---

## 📝 Database Schema

### Courts Table (After Migration)

```sql
CREATE TABLE courts (
    id BIGINT PRIMARY KEY,
    ayo_field_id BIGINT UNIQUE NULL,  -- NEW
    name VARCHAR(255),
    type ENUM('indoor', 'outdoor'),
    surface VARCHAR(255),
    status ENUM('active', 'maintenance', 'closed'),
    price_per_hour DECIMAL(10,2),
    image_path VARCHAR(255) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_ayo_field_id (ayo_field_id)
);
```

---

## 🔄 Sync Process Flow

```
1. Fetch fields from AYO API
   ↓
2. Start DB transaction
   ↓
3. For each AYO field:
   ├─ Check if court exists (by ayo_field_id)
   ├─ If NOT exists → CREATE new court
   ├─ If EXISTS → Check for changes
   │  ├─ Has changes → UPDATE
   │  └─ No changes → SKIP
   └─ Log action
   ↓
4. If dry-run → ROLLBACK
   If normal → COMMIT
   ↓
5. Return stats & changes
```

---

## 📊 Sync Report Example

```
✅ Sync Completed Successfully!

📊 Summary:
   Total AYO Fields: 3
   Created: 1
   Updated: 1
   Skipped: 1

📋 Detailed Changes:

✨ Created:
   • Court 2 (AYO Field ID: 1003)

🔄 Updated:
   • Court 1 (Court ID: 5)
      - status: active → closed
      - surface: Artificial Turf → Padel
```

---

## ⚙️ Auto-Sync Setup

### Schedule Daily Sync

Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule): void
{
    // Sync courts every day at 2 AM
    $schedule->command('courts:sync --force')
        ->dailyAt('02:00')
        ->onSuccess(function () {
            Log::info('Court sync completed successfully');
        })
        ->onFailure(function () {
            Log::error('Court sync failed');
        });
}
```

### Schedule Hourly Sync (Active Only)

```php
$schedule->command('courts:sync --force')
    ->hourly()
    ->runInBackground();
```

---

## 🐛 Debugging

### Check Logs

```bash
tail -f storage/logs/laravel.log | grep "Court Sync"
```

### Test Specific Court

```php
use App\Services\CourtSyncService;

$service = app(CourtSyncService::class);

// Check if court is synced
$isSynced = $service->isCourtSyncedWithAyo(5);

// Get mapping
$ayoFieldId = $service->getAyoFieldId(5); // Returns: 1002
$court = $service->getCourtByAyoFieldId(1002); // Returns: Court #5
```

---

## ⚠️ Important Notes

1. **Unique Constraint**: `ayo_field_id` must be unique (prevents duplicates)
2. **Manual Data Preserved**: Price, image, operating hours tidak di-override
3. **Transaction Safety**: All-or-nothing (jika 1 gagal, semua rollback)
4. **Active Only Default**: By default hanya sync active fields
5. **Dry-run Recommended**: Always test dengan `--dry-run` first

---

## 🎯 Use Cases

### 1. Initial Setup

Sync semua lapangan dari AYO saat first setup:

```bash
php artisan courts:sync --all --force
```

### 2. Regular Updates

Daily sync untuk update status/name changes:

```bash
php artisan courts:sync --force
```

### 3. Before Deployment

Preview changes sebelum production:

```bash
php artisan courts:sync --dry-run --all -v
```

---

## 🔮 Future Enhancements

- [ ] Webhook untuk real-time sync
- [ ] Bi-directional sync (local → AYO)
- [ ] Conflict resolution UI
- [ ] Sync history/audit log
- [ ] Selective field sync
- [ ] Bulk operations via admin UI

---

## ✅ Test Results (Feb 6, 2026)

### Test 1: Dry Run
```bash
php artisan courts:sync --dry-run
```
**Result**: ✅ SUCCESS - Preview 1 court creation

### Test 2: Actual Sync
```bash
php artisan courts:sync --force
```
**Result**: ✅ SUCCESS - Created Court 1 (AYO Field ID: 1002)

### Test 3: Re-sync (Skip)
```bash
php artisan courts:sync --force
```
**Result**: ✅ SUCCESS - Skipped 1 (no changes)

### Database Verification
```sql
SELECT id, name, ayo_field_id FROM courts WHERE ayo_field_id IS NOT NULL;
```
**Result**: ✅ Court #5 with ayo_field_id = 1002

---

**Last Updated**: February 6, 2026  
**Status**: ✅ Production Ready  
**Next**: Implement booking sync & availability check
