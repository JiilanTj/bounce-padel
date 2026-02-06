Siap. Ini gue bikinin **dokumentasi versi “waras & siap dipakai tim dev”** — runut dari **signature → request → response**, khusus untuk **GET List Bookings AYO**.
Bisa langsung kamu copy ke **internal docs / Notion / README**.

---

# AYO Third-Party API

## Get Bookings — Signature & Request Flow Documentation

---

## 1. Overview

Endpoint **Get Bookings** digunakan untuk mengambil data booking dari platform AYO dengan status:

* `SUCCESS`
* `FINISHED`
* `PENDING`
* `CANCELLED`

Walaupun menggunakan **HTTP GET**, endpoint ini **MENGHARUSKAN request body JSON** yang ditandatangani menggunakan **HMAC SHA512 signature**.

---

## 2. Authentication Requirements

Untuk mengakses API ini, dibutuhkan:

| Key              | Description                                   |
| ---------------- | --------------------------------------------- |
| Venue Code       | Kode unik venue (10 karakter), dipakai di URL |
| API Token        | Token autentikasi                             |
| Venue Secret Key | Digunakan untuk generate signature            |
| Signature        | HMAC SHA512 dari payload                      |

---

## 3. Endpoint Specification

```
GET /api/v2/third-party/list-bookings/{venue_code}
```

**Base URL**

```
https://api.ayo.co.id
```

---

## 4. Request Headers

| Header       | Value            |
| ------------ | ---------------- |
| Accept       | application/json |
| Content-Type | application/json |

---

## 5. Request Body (Payload)

### Mandatory Fields

| Field     | Required | Description           |
| --------- | -------- | --------------------- |
| token     | Yes      | API token             |
| signature | Yes      | HMAC SHA512 signature |

### Optional Filter Fields

| Field          | Description                 |
| -------------- | --------------------------- |
| booking_id     | Booking ID dari AYO         |
| field_name     | Nama lapangan               |
| date           | Format: YYYY-MM-DD          |
| start_time     | HH:MM:SS                    |
| end_time       | HH:MM:SS                    |
| booking_source | `orders` / `reservation`    |
| start_date     | Filter range (start)        |
| end_date       | Filter range (end)          |
| status         | `SUCCESS`, `CANCELLED`, dll |

---

## 6. Signature Generation Flow

### ⚠️ Important Rules

* `signature` **TIDAK boleh ikut dihitung**
* Semua field payload **HARUS ikut signature**
* Key harus di-sort **ASC (A–Z)**
* Payload harus di-encode sebagai **URL Query String**

---

### 6.1 Example Payload (Before Signature)

```json
{
  "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl",
  "date": "2023-02-06"
}
```

---

### 6.2 Sort Payload Keys (ASC)

```json
{
  "date": "2023-02-06",
  "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl"
}
```

---

### 6.3 Convert to Query String (URL Encoded)

```
date=2023-02-06&token=3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl
```

---

### 6.4 Generate Signature (HMAC SHA512)

#### PHP Example

```php
$data = "date=2023-02-06&token=3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl";
$secretKey = "VENUE_SECRET_KEY";

$signature = hash_hmac('sha512', $data, $secretKey);
```

---

#### Node.js Example

```js
const crypto = require("crypto");

const data = "date=2023-02-06&token=...";
const secretKey = "VENUE_SECRET_KEY";

const signature = crypto
  .createHmac("sha512", secretKey)
  .update(data)
  .digest("hex");
```

---

## 7. Final Request Payload

```json
{
  "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl",
  "date": "2023-02-06",
  "signature": "GENERATED_SIGNATURE"
}
```

---

## 8. Example Request (cURL)

```bash
curl --request GET \
'https://api.ayo.co.id/api/v2/third-party/list-bookings/BptdYPUeMr' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{
  "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl",
  "date": "2023-02-06",
  "signature": "GENERATED_SIGNATURE"
}'
```

---

## 9. Example Response

```json
{
  "error": false,
  "status_code": 200,
  "data": [
    {
      "booking_id": "MN/0042/230125/0000028",
      "field_name": "Lapangan Utama",
      "date": "2023-02-06",
      "start_time": "06:00:00",
      "end_time": "08:00:00",
      "status": "SUCCESS"
    }
  ],
  "signature": "RESPONSE_SIGNATURE"
}
```

---

## 10. Common Mistakes & Troubleshooting

| Issue             | Cause                                   |
| ----------------- | --------------------------------------- |
| Invalid Signature | Key tidak di-sort                       |
| Invalid Signature | Payload beda dengan yang ditandatangani |
| Invalid Signature | URL encoding salah                      |
| 401 / 403         | Token salah                             |
| Empty data        | Filter tidak match                      |

---

## 11. Mental Model (WAJIB DIPEGANG)

> **“Apa pun yang dikirim ke API, harus ikut dihitung ke signature.”**

---

# Get Venue Fields — API Documentation

---

## 1. Overview

Endpoint **Get Venue Fields** digunakan untuk mengambil data lapangan (courts/fields) yang aktif di sistem AYO.

Endpoint ini berguna untuk:
* Sinkronisasi data lapangan
* Mapping local courts dengan AYO field_id
* Validasi ketersediaan lapangan

---

## 2. Authentication Requirements

Sama seperti endpoint lain, dibutuhkan:

| Key              | Description                      |
| ---------------- | -------------------------------- |
| API Token        | Token autentikasi                |
| Venue Secret Key | Untuk generate signature         |
| Signature        | HMAC SHA512 dari payload minimal |

---

## 3. Endpoint Specification

```
GET /api/v2/third-party/list-fields
```

**Base URL**

```
https://api.ayo.co.id
```

**⚠️ Note:** Endpoint ini **TIDAK memerlukan** `{venue_code}` di URL, berbeda dengan `list-bookings`.

---

## 4. Request Headers

| Header       | Value            |
| ------------ | ---------------- |
| Accept       | application/json |
| Content-Type | application/json |

---

## 5. Request Body (Payload)

### Mandatory Fields Only

| Field     | Required | Description           |
| --------- | -------- | --------------------- |
| token     | Yes      | API token             |
| signature | Yes      | HMAC SHA512 signature |

**⚠️ Important:** Endpoint ini **TIDAK menerima filter apapun**. Selalu return semua active fields.

---

## 6. Signature Generation

Karena hanya ada 2 field (`token` dan `signature`), signature generation lebih sederhana:

### 6.1 Payload (Before Signature)

```json
{
  "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl"
}
```

### 6.2 Convert to Query String

```
token=3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl
```

### 6.3 Generate Signature (HMAC SHA512)

```php
$data = "token=3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl";
$secretKey = "VENUE_SECRET_KEY";

$signature = hash_hmac('sha512', $data, $secretKey);
```

---

## 7. Final Request Payload

```json
{
  "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl",
  "signature": "d78f3ed192026799060b68b4531d327110a44b3829382a50e21ee8acc749fba1201cd42c4fa8fc867b8008cf2debf0902c319dba0dcab08bc1dc0b3ea2c05666"
}
```

---

## 8. Example Request (cURL)

```bash
curl --location --request GET \
'https://api.ayo.co.id/api/v2/third-party/list-fields' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{
    "token": "3qUFjksFEG8U5Xi5aXF2lY2WT8jYRDYCFerLmHjWILrawiVpeyjm0OV6tQrl",
    "signature": "d78f3ed192026799060b68b4531d327110a44b3829382a50e21ee8acc749fba1201cd42c4fa8fc867b8008cf2debf0902c319dba0dcab08bc1dc0b3ea2c05666"
}'
```

---

## 9. Example Response

```json
{
    "error": false,
    "status_code": 200,
    "data": [
        {
            "id": 931,
            "name": "Main Court",
            "status": "ACTIVE",
            "is_active": 1,
            "is_permanent_active": 1,
            "sport_name": "Padel"
        },
        {
            "id": 932,
            "name": "Secondary Court",
            "status": "ACTIVE",
            "is_active": 1,
            "is_permanent_active": 1,
            "sport_name": "Padel"
        }
    ],
    "signature": "12693899b76102291beafb4cdb86af4e338212bbf69769f8fceef53d0d88730e8b5b144f5b9bedae228dde97ad1d666e7a8ce7bd69554b35daa2e2aaba745b2e"
}
```

---

## 10. Response Fields

| Field               | Type   | Description                          |
| ------------------- | ------ | ------------------------------------ |
| id                  | int    | Field ID (untuk mapping)             |
| name                | string | Nama lapangan                        |
| status              | string | Status lapangan (ACTIVE, INACTIVE)   |
| is_active           | int    | 1 = aktif, 0 = tidak aktif           |
| is_permanent_active | int    | 1 = permanent aktif, 0 = tidak       |
| sport_name          | string | Jenis olahraga (Padel, Futsal, etc.) |

---

## 11. Use Cases

### A. Sinkronisasi Courts

```php
// Get fields dari AYO
$result = $ayoService->getFields();

foreach ($result['data']['data'] as $field) {
    // Cek apakah court sudah ada di local
    $court = Court::where('ayo_field_id', $field['id'])->first();
    
    if (!$court) {
        // Buat court baru
        Court::create([
            'name' => $field['name'],
            'ayo_field_id' => $field['id'],
            'status' => $field['status'] === 'ACTIVE' ? 'active' : 'inactive',
            'sport_type' => $field['sport_name'],
        ]);
    }
}
```

### B. Mapping untuk Booking

```php
// Ketika user booking, map local court_id ke AYO field_id
$court = Court::find($request->court_id);
$ayoFieldId = $court->ayo_field_id;

// Gunakan $ayoFieldId untuk create booking di AYO
```

---

## 12. HTTP Status Codes

| HTTP Code | Error Message                 | Description                                                     |
| --------- | ----------------------------- | --------------------------------------------------------------- |
| 200       | Success                       | Request berhasil                                                |
| 401       | Unauthenticated               | Token, signature, atau private key tidak ada                    |
| 401       | Invalid Signature             | Signature tidak valid untuk body request                        |
| 401       | Unauthenticated: Invalid token | Token tidak valid atau sistem tidak bisa verify                |
| 500       | Server Error                  | Error di server saat memproses request                          |

---

## 13. Important Notes

1. **No Filters**: Endpoint ini tidak menerima filter. Selalu return semua active fields.
2. **No Venue Code in URL**: Berbeda dengan `list-bookings`, endpoint ini tidak perlu venue_code di URL.
3. **Field Mapping**: Simpan `field.id` dari response untuk mapping dengan local courts.
4. **Status Check**: Field dengan `status: "ACTIVE"` dan `is_active: 1` adalah field yang tersedia.
5. **Sport Type**: Gunakan `sport_name` untuk filter lapangan berdasarkan jenis olahraga.

---

# HTTP Status Codes Reference

Berlaku untuk **semua endpoint** AYO API:

| HTTP Code | Error Message                  | Description                                  |
| --------- | ------------------------------ | -------------------------------------------- |
| 200       | Success                        | Request berhasil                             |
| 401       | Unauthenticated                | Token/signature/private key tidak ada        |
| 401       | Invalid Signature              | Signature tidak valid                        |
| 401       | Unauthenticated: Invalid token | Token tidak valid atau tidak bisa di-verify  |
| 500       | Server Error                   | Error di server saat memproses request       |

---

# Summary - AYO API Endpoints

| Endpoint         | Method | URL Path                                        | Filter Support | Venue Code in URL |
| ---------------- | ------ | ----------------------------------------------- | -------------- | ----------------- |
| Get Bookings     | GET    | `/api/v2/third-party/list-bookings/{venue_code}` | ✅ Yes         | ✅ Yes            |
| Get Venue Fields | GET    | `/api/v2/third-party/list-fields`                | ❌ No          | ❌ No             |

---

**Last Updated:** February 6, 2026  
**Status:** Documented & Ready for Implementation
