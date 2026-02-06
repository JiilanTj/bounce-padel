<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingSyncService
{
    protected AyoApiService $ayoApi;

    public function __construct(AyoApiService $ayoApi)
    {
        $this->ayoApi = $ayoApi;
    }

    /**
     * Sync bookings from AYO API to local database
     * 
     * @param array $filters Optional filters (date, status, field_id)
     * @return array Sync results
     */
    public function syncFromAyo(array $filters = []): array
    {
        $results = [
            'success' => false,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [],
            'bookings' => [],
        ];

        try {
            // Fetch bookings from AYO API
            $response = $this->ayoApi->getBookings($filters);

            if (!isset($response['success']) || !$response['success']) {
                $results['errors'][] = 'Failed to fetch bookings from AYO API';
                return $results;
            }

            // Extract bookings from response
            $responseData = $response['data'] ?? [];
            $ayoBookings = $responseData['bookings'] ?? $responseData['data'] ?? [];
            
            // Ensure we have an array and filter out invalid entries
            if (!is_array($ayoBookings)) {
                $ayoBookings = [];
            }
            
            // Filter out non-array items
            $ayoBookings = array_filter($ayoBookings, function($item) {
                return is_array($item) && isset($item['id']);
            });

            DB::beginTransaction();

            foreach ($ayoBookings as $ayoBooking) {
                try {
                    $syncResult = $this->syncBooking($ayoBooking);
                    
                    if ($syncResult['action'] === 'created') {
                        $results['created']++;
                        $results['bookings'][] = $syncResult['booking'];
                    } elseif ($syncResult['action'] === 'updated') {
                        $results['updated']++;
                        $results['bookings'][] = $syncResult['booking'];
                    } else {
                        $results['skipped']++;
                    }
                } catch (\Exception $e) {
                    $results['errors'][] = "Booking {$ayoBooking['id']}: " . $e->getMessage();
                    Log::error('Booking sync error', [
                        'ayo_booking' => $ayoBooking,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            DB::commit();
            $results['success'] = true;

        } catch (\Exception $e) {
            DB::rollBack();
            $results['errors'][] = $e->getMessage();
            Log::error('BookingSyncService error', ['error' => $e->getMessage()]);
        }

        return $results;
    }

    /**
     * Sync individual booking from AYO data
     */
    protected function syncBooking(array $ayoBooking): array
    {
        // Map AYO field_id to local court
        $court = Court::where('ayo_field_id', $ayoBooking['field_id'])->first();
        
        if (!$court) {
            throw new \Exception("Court with ayo_field_id {$ayoBooking['field_id']} not found");
        }

        // Find or create user based on customer info
        $user = $this->findOrCreateUser($ayoBooking['customer']);

        // Parse booking times
        $startTime = Carbon::parse($ayoBooking['booking_date'] . ' ' . $ayoBooking['start_time']);
        $endTime = Carbon::parse($ayoBooking['booking_date'] . ' ' . $ayoBooking['end_time']);

        // Map AYO status to local status
        $status = $this->mapAyoStatus($ayoBooking['status']);

        // Calculate total price (if not provided by AYO)
        $totalPrice = $ayoBooking['total_price'] ?? $this->calculatePrice($court, $startTime, $endTime);

        // Check if booking already exists (by AYO booking_id or by time slot)
        $existingBooking = Booking::where('court_id', $court->id)
            ->where('start_time', $startTime)
            ->where('end_time', $endTime)
            ->first();

        $bookingData = [
            'user_id' => $user->id,
            'court_id' => $court->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $status,
            'total_price' => $totalPrice,
            'notes' => $this->buildNotes($ayoBooking),
        ];

        if ($existingBooking) {
            // Check if update is needed
            $needsUpdate = false;
            foreach (['status', 'total_price'] as $field) {
                if ($existingBooking->$field != $bookingData[$field]) {
                    $needsUpdate = true;
                    break;
                }
            }

            if ($needsUpdate) {
                $existingBooking->update($bookingData);
                Log::info('Booking updated from AYO', [
                    'booking_id' => $existingBooking->id,
                    'ayo_booking_id' => $ayoBooking['id'],
                ]);
                return ['action' => 'updated', 'booking' => $existingBooking->fresh()];
            } else {
                return ['action' => 'skipped', 'booking' => $existingBooking];
            }
        } else {
            // Create new booking
            $booking = Booking::create($bookingData);
            Log::info('Booking created from AYO', [
                'booking_id' => $booking->id,
                'ayo_booking_id' => $ayoBooking['id'],
            ]);
            return ['action' => 'created', 'booking' => $booking];
        }
    }

    /**
     * Find or create user from AYO customer data
     */
    protected function findOrCreateUser(array $customer): User
    {
        // Try to find by email first
        $user = User::where('email', $customer['email'])->first();

        if (!$user) {
            // Create new user from AYO customer data
            $user = User::create([
                'name' => $customer['name'],
                'email' => $customer['email'],
                'phone' => $customer['phone'] ?? null,
                'password' => bcrypt(uniqid()), // Random password
                'role' => 'user',
            ]);

            Log::info('User created from AYO customer', [
                'user_id' => $user->id,
                'email' => $customer['email'],
            ]);
        }

        return $user;
    }

    /**
     * Map AYO booking status to local status
     */
    protected function mapAyoStatus(string $ayoStatus): string
    {
        $statusMap = [
            'PENDING' => 'pending',
            'CONFIRMED' => 'confirmed',
            'PAID' => 'paid',
            'CANCELLED' => 'cancelled',
            'FINISHED' => 'completed',
            'NO_SHOW' => 'no_show',
        ];

        return $statusMap[$ayoStatus] ?? 'pending';
    }

    /**
     * Calculate booking price based on court and duration
     */
    protected function calculatePrice(Court $court, Carbon $startTime, Carbon $endTime): float
    {
        $hours = $startTime->diffInHours($endTime);
        
        // Round up if there are remaining minutes
        if ($startTime->diffInMinutes($endTime) % 60 > 0) {
            $hours++;
        }

        return $hours * $court->price_per_hour;
    }

    /**
     * Build notes from AYO booking data
     */
    protected function buildNotes(array $ayoBooking): string
    {
        $notes = "Synced from AYO Booking API\n";
        $notes .= "AYO Booking ID: {$ayoBooking['id']}\n";
        
        if (isset($ayoBooking['notes']) && !empty($ayoBooking['notes'])) {
            $notes .= "Customer Notes: {$ayoBooking['notes']}";
        }

        return $notes;
    }
}
