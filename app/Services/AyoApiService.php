<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AyoApiService
{
    protected string $apiKey;
    protected string $privateKey;
    protected string $venueCode;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.ayo.api_key');
        $this->privateKey = config('services.ayo.private_key');
        $this->venueCode = config('services.ayo.venue_code');
        $this->baseUrl = config('services.ayo.base_url');
    }

    /**
     * Generate HMAC SHA512 signature for AYO API
     * 
     * Important Rules:
     * 1. 'signature' field TIDAK boleh ikut dihitung
     * 2. Semua field payload HARUS ikut signature
     * 3. Key harus di-sort ASC (A–Z)
     * 4. Payload harus di-encode sebagai URL Query String
     *
     * @param array $payload
     * @return string
     */
    protected function generateSignature(array $payload): string
    {
        // 1. Remove signature if exists
        unset($payload['signature']);

        // 2. Sort keys alphabetically (ASC)
        ksort($payload);

        // 3. Convert to query string (URL encoded)
        $queryString = http_build_query($payload);

        // 4. Generate HMAC SHA512
        $signature = hash_hmac('sha512', $queryString, $this->privateKey);

        Log::info('AYO API Signature Generated', [
            'payload' => $payload,
            'query_string' => $queryString,
            'signature' => $signature,
        ]);

        return $signature;
    }

    /**
     * Get list of bookings from AYO API
     *
     * @param array $filters Optional filters
     * @return array
     */
    public function getBookings(array $filters = []): array
    {
        // Build payload
        $payload = array_merge([
            'token' => $this->apiKey,
        ], $filters);

        // Generate signature
        $signature = $this->generateSignature($payload);

        // Add signature to payload
        $payload['signature'] = $signature;

        // Build URL
        $url = "{$this->baseUrl}/list-bookings/{$this->venueCode}";

        Log::info('AYO API Request', [
            'url' => $url,
            'payload' => $payload,
        ]);

        try {
            // Make request
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->get($url, $payload);

            // Log response
            Log::info('AYO API Response', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            // Check if request was successful
            if ($response->successful()) {
                $data = $response->json();

                // Verify response signature if provided
                if (isset($data['signature'])) {
                    // TODO: Verify response signature if needed
                    // For now, we just log it
                    Log::info('AYO API Response Signature', [
                        'signature' => $data['signature'],
                    ]);
                }

                return [
                    'success' => true,
                    'data' => $data,
                    'status_code' => $response->status(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json(),
                'status_code' => $response->status(),
            ];

        } catch (\Exception $e) {
            Log::error('AYO API Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status_code' => 500,
            ];
        }
    }

    /**
     * Get bookings for specific date
     *
     * @param string $date Format: YYYY-MM-DD
     * @return array
     */
    public function getBookingsByDate(string $date): array
    {
        return $this->getBookings(['date' => $date]);
    }

    /**
     * Get bookings for date range
     *
     * @param string $startDate Format: YYYY-MM-DD
     * @param string $endDate Format: YYYY-MM-DD
     * @return array
     */
    public function getBookingsByDateRange(string $startDate, string $endDate): array
    {
        return $this->getBookings([
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    /**
     * Get booking by ID
     *
     * @param string $bookingId
     * @return array
     */
    public function getBookingById(string $bookingId): array
    {
        return $this->getBookings(['booking_id' => $bookingId]);
    }

    /**
     * Get bookings by field name
     *
     * @param string $fieldName
     * @return array
     */
    public function getBookingsByField(string $fieldName): array
    {
        return $this->getBookings(['field_name' => $fieldName]);
    }

    /**
     * Get bookings by status
     *
     * @param string $status SUCCESS, PENDING, CANCELLED, FINISHED
     * @return array
     */
    public function getBookingsByStatus(string $status): array
    {
        return $this->getBookings(['status' => $status]);
    }

    /**
     * Get list of active fields/courts from AYO API
     *
     * @return array
     */
    public function getFields(): array
    {
        // Build payload (minimal - hanya token)
        $payload = [
            'token' => $this->apiKey,
        ];

        // Generate signature
        $signature = $this->generateSignature($payload);

        // Add signature to payload
        $payload['signature'] = $signature;

        // Build URL (no venue_code needed for this endpoint)
        $url = "{$this->baseUrl}/list-fields";

        Log::info('AYO API Get Fields Request', [
            'url' => $url,
            'payload' => $payload,
        ]);

        try {
            // Make request
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->get($url, $payload);

            // Log response
            Log::info('AYO API Get Fields Response', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            // Check if request was successful
            if ($response->successful()) {
                $data = $response->json();

                // Verify response signature if provided
                if (isset($data['signature'])) {
                    Log::info('AYO API Fields Response Signature', [
                        'signature' => $data['signature'],
                    ]);
                }

                return [
                    'success' => true,
                    'data' => $data,
                    'status_code' => $response->status(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json(),
                'status_code' => $response->status(),
            ];

        } catch (\Exception $e) {
            Log::error('AYO API Get Fields Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status_code' => 500,
            ];
        }
    }

    /**
     * Get active fields only
     *
     * @return array
     */
    public function getActiveFields(): array
    {
        $result = $this->getFields();

        if ($result['success'] && isset($result['data']['data'])) {
            // Filter only active fields
            $activeFields = array_filter($result['data']['data'], function ($field) {
                return $field['status'] === 'ACTIVE' && $field['is_active'] == 1;
            });

            $result['data']['data'] = array_values($activeFields);
        }

        return $result;
    }
}

