<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Models\Notification;
use App\Services\BookingSyncService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    protected BookingSyncService $bookingSyncService;

    public function __construct(BookingSyncService $bookingSyncService)
    {
        $this->bookingSyncService = $bookingSyncService;
    }

    public function index(Request $request)
    {
        // Sync bookings from AYO API
        $syncFilters = [];
        if ($request->filled('date')) {
            $syncFilters['date'] = $request->date;
        }
        
        // Perform sync in background (non-blocking)
        try {
            $syncResult = $this->bookingSyncService->syncFromAyo($syncFilters);
            
            // Flash sync results
            if ($syncResult['success']) {
                $message = "Synced from AYO: ";
                $message .= "{$syncResult['created']} created, ";
                $message .= "{$syncResult['updated']} updated, ";
                $message .= "{$syncResult['skipped']} unchanged";
                
                if (!empty($syncResult['errors'])) {
                    session()->flash('warning', $message . " (with some errors)");
                } else {
                    session()->flash('success', $message);
                }
            }
        } catch (\Exception $e) {
            // Don't block the page if sync fails
            session()->flash('warning', 'Could not sync with AYO API: ' . $e->getMessage());
        }

        $query = Booking::with(['user', 'court'])
            ->orderBy('start_time', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->filled('date')) {
            $date = Carbon::parse($request->date);
            $query->whereDate('start_time', $date);
        }

        // Filter by court
        if ($request->filled('court_id')) {
            $query->where('court_id', $request->court_id);
        }

        // Search by user name
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $bookings = $query->paginate(15)->withQueryString();

        // Get all courts with operating hours
        $courts = Court::with('operatingHours')->get();

        // Get today's bookings for availability overview (with user info)
        $todayDate = $request->filled('date') ? Carbon::parse($request->date) : Carbon::today();
        $todayBookings = Booking::with('user')
            ->whereDate('start_time', $todayDate)
            ->whereIn('status', ['pending', 'confirmed', 'paid'])
            ->get(['id', 'user_id', 'court_id', 'start_time', 'end_time', 'status', 'total_price']);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'courts' => $courts,
            'todayBookings' => $todayBookings,
            'overviewDate' => $todayDate->format('Y-m-d'),
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'date' => $request->date,
                'court_id' => $request->court_id,
            ],
        ]);
    }

    public function history(Request $request)
    {
        // Show all bookings, ordered by latest first
        $query = Booking::with(['user', 'court'])
            ->orderBy('start_time', 'desc');

        // Search by customer name
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->filled('date')) {
            $date = Carbon::parse($request->date);
            $query->whereDate('start_time', $date);
        }

        $bookings = $query->paginate(20)->withQueryString();

        return Inertia::render('Bookings/History', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'date' => $request->date,
            ],
        ]);
    }

    public function create()
    {
        $courts = Court::where('status', 'active')->get();
 
        return Inertia::render('Bookings/Create', [
            'courts' => $courts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'court_id' => 'required|exists:courts,id',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'notes' => 'nullable|string',
        ]);

        // Check availability
        $conflict = $this->checkAvailability(
            $validated['court_id'],
            $validated['start_time'],
            $validated['end_time']
        );

        if ($conflict) {
            return back()->withErrors([
                'time' => 'Court is not available for the selected time slot. There is a conflict with an existing booking.'
            ]);
        }

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $validated['customer_email']],
            [
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'],
                'password' => bcrypt(str()->random(16)), // Random password
                'role' => 'user',
            ]
        );

        // Update phone if user exists but phone changed
        if ($user->phone !== $validated['customer_phone']) {
            $user->update(['phone' => $validated['customer_phone']]);
        }

        // Calculate price
        $court = Court::findOrFail($validated['court_id']);
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $hours = $start->diffInHours($end);
        
        // If minutes exist, round up to nearest hour
        if ($start->diffInMinutes($end) % 60 > 0) {
            $hours += 1;
        }

        $totalPrice = $hours * $court->price_per_hour;

        $booking = Booking::create([
            'user_id' => $user->id,
            'court_id' => $validated['court_id'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'total_price' => $totalPrice,
            'notes' => $validated['notes'] ?? null,
            'status' => 'confirmed', // Kasir creates confirmed bookings
        ]);

        // Create notifications for cashiers
        $cashierIds = User::where('role', 'kasir')->pluck('id');
        
        foreach ($cashierIds as $cashierId) {
            Notification::create([
                'user_id' => $cashierId,
                'type' => 'booking_created',
                'title' => "Booking baru dari {$validated['customer_name']}",
                'message' => "{$court->name} • " . Carbon::parse($validated['start_time'])->format('d M H:i'),
                'data' => [
                    'booking_id' => $booking->id,
                    'customer_name' => $validated['customer_name'],
                    'court_name' => $court->name,
                    'date' => Carbon::parse($validated['start_time'])->format('Y-m-d'),
                    'time' => Carbon::parse($validated['start_time'])->format('H:i') . ' - ' . Carbon::parse($validated['end_time'])->format('H:i'),
                    'total_price' => $totalPrice,
                ],
            ]);
        }

        return redirect()->route('bookings.index')
            ->with('success', 'Booking created successfully!');
    }

    public function edit(Booking $booking)
    {
        $booking->load(['user', 'court']);
        $courts = Court::where('status', 'active')->get();

        return Inertia::render('Bookings/Edit', [
            'booking' => $booking,
            'courts' => $courts,
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'court_id' => 'required|exists:courts,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'required|in:pending,confirmed,paid,cancelled,completed,no_show',
            'notes' => 'required|string',
        ]);

        // Find or create user (same as store)
        $user = User::firstOrCreate(
            ['email' => $validated['customer_email']],
            [
                'name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'],
                'password' => bcrypt(str()->random(16)),
                'role' => 'user',
            ]
        );

        // Update phone if user exists but phone changed
        if ($user->phone !== $validated['customer_phone']) {
            $user->update(['phone' => $validated['customer_phone']]);
        }

        // Check availability (excluding current booking)
        $conflict = $this->checkAvailability(
            $validated['court_id'],
            $validated['start_time'],
            $validated['end_time'],
            $booking->id
        );

        if ($conflict) {
            return back()->withErrors([
                'time' => 'Court is not available for the selected time slot.'
            ]);
        }

        // Recalculate price if time or court changed
        $court = Court::findOrFail($validated['court_id']);
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $hours = $start->diffInHours($end);
        
        if ($start->diffInMinutes($end) % 60 > 0) {
            $hours += 1;
        }

        $totalPrice = $hours * $court->price_per_hour;

        $booking->update([
            'user_id' => $user->id,
            'court_id' => $validated['court_id'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'total_price' => $totalPrice,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('bookings.index')
            ->with('success', 'Booking updated successfully!');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('bookings.index')
            ->with('success', 'Booking deleted successfully!');
    }

    /**
     * Check court availability for a given time slot
     */
    public function checkAvailability(
        int $courtId,
        string $startTime,
        string $endTime,
        ?int $excludeBookingId = null
    ): bool {
        $query = Booking::where('court_id', $courtId)
            ->whereIn('status', ['pending', 'confirmed', 'paid'])
            ->where(function ($q) use ($startTime, $endTime) {
                // Check for any overlap
                $q->where(function ($overlap) use ($startTime, $endTime) {
                    // New booking starts during existing booking
                    $overlap->where('start_time', '<=', $startTime)
                        ->where('end_time', '>', $startTime);
                })->orWhere(function ($overlap) use ($startTime, $endTime) {
                    // New booking ends during existing booking
                    $overlap->where('start_time', '<', $endTime)
                        ->where('end_time', '>=', $endTime);
                })->orWhere(function ($overlap) use ($startTime, $endTime) {
                    // New booking completely contains existing booking
                    $overlap->where('start_time', '>=', $startTime)
                        ->where('end_time', '<=', $endTime);
                });
            });

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->exists();
    }

    /**
     * Get available time slots for a court on a specific date
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'court_id' => 'required|exists:courts,id',
            'date' => 'required|date',
        ]);

        $court = Court::with('operatingHours')->findOrFail($request->court_id);
        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek; // 0 (Sunday) to 6 (Saturday)

        // Get operating hours for this day
        $operatingHour = $court->operatingHours()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_closed', false)
            ->first();

        if (!$operatingHour) {
            return response()->json([
                'available' => false,
                'message' => 'Court is closed on this day',
                'slots' => [],
            ]);
        }

        // Get all bookings for this court on this date
        $bookings = Booking::where('court_id', $request->court_id)
            ->whereIn('status', ['pending', 'confirmed', 'paid'])
            ->whereDate('start_time', $date)
            ->get(['start_time', 'end_time']);

        // Generate hourly slots
        $openTime = Carbon::parse($date->format('Y-m-d') . ' ' . $operatingHour->open_time);
        $closeTime = Carbon::parse($date->format('Y-m-d') . ' ' . $operatingHour->close_time);
        
        $slots = [];
        $currentSlot = $openTime->copy();

        while ($currentSlot->lt($closeTime)) {
            $slotEnd = $currentSlot->copy()->addHour();
            
            // Check if this slot is available
            $isAvailable = true;
            foreach ($bookings as $booking) {
                $bookingStart = Carbon::parse($booking->start_time);
                $bookingEnd = Carbon::parse($booking->end_time);

                // Check for overlap
                if (
                    ($currentSlot->gte($bookingStart) && $currentSlot->lt($bookingEnd)) ||
                    ($slotEnd->gt($bookingStart) && $slotEnd->lte($bookingEnd)) ||
                    ($currentSlot->lte($bookingStart) && $slotEnd->gte($bookingEnd))
                ) {
                    $isAvailable = false;
                    break;
                }
            }

            $slots[] = [
                'start_time' => $currentSlot->format('H:i'),
                'end_time' => $slotEnd->format('H:i'),
                'available' => $isAvailable,
            ];

            $currentSlot->addHour();
        }

        return response()->json([
            'available' => true,
            'operating_hours' => [
                'open' => $operatingHour->open_time,
                'close' => $operatingHour->close_time,
            ],
            'slots' => $slots,
        ]);
    }
}
