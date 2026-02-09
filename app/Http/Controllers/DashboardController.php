<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Total Revenue (Lifetime)
        $orderRevenue = Order::whereIn('status', ['paid', 'completed'])->sum('total_amount');
        $bookingRevenue = Booking::whereIn('status', ['confirmed', 'completed'])->sum('total_price');
        $totalRevenue = $orderRevenue + $bookingRevenue;

        // Revenue Trend (This Month vs Last Month)
        $currentMonthOrders = Order::whereIn('status', ['paid', 'completed'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');
        $currentMonthBookings = Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');
        $currentMonthRevenue = $currentMonthOrders + $currentMonthBookings;

        $lastMonthOrders = Order::whereIn('status', ['paid', 'completed'])
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('total_amount');
        $lastMonthBookings = Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('total_price');
        $lastMonthRevenue = $lastMonthOrders + $lastMonthBookings;

        $revenueChange = $this->calculateGrowth($currentMonthRevenue, $lastMonthRevenue);

        // 2. Active Bookings (Snapshot - no trend for now)
        $activeBookings = Booking::where('start_time', '>', now())
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        // 3. New Members (Last 30 Days)
        $newMembers = User::where('role', 'user')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        // Members Trend (This Month vs Last Month)
        $currentMonthMembers = User::where('role', 'user')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $lastMonthMembers = User::where('role', 'user')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        
        $membersChange = $this->calculateGrowth($currentMonthMembers, $lastMonthMembers);

        // 4. Today's Sales
        $todayOrderRevenue = Order::whereIn('status', ['paid', 'completed'])
            ->whereDate('created_at', today())
            ->sum('total_amount');
        
        $todayBookingRevenue = Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereDate('created_at', today())
            ->sum('total_price');

        $todaySales = $todayOrderRevenue + $todayBookingRevenue;

        // Sales Trend (Today vs Yesterday)
        $yesterdayOrderRevenue = Order::whereIn('status', ['paid', 'completed'])
            ->whereDate('created_at', today()->subDay())
            ->sum('total_amount');
        
        $yesterdayBookingRevenue = Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereDate('created_at', today()->subDay())
            ->sum('total_price');

        $yesterdaySales = $yesterdayOrderRevenue + $yesterdayBookingRevenue;

        $salesChange = $this->calculateGrowth($todaySales, $yesterdaySales);


        // 5. Recent Activity
        $recentBookings = Booking::with('user', 'court')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => 'booking-' . $booking->id,
                    'type' => 'booking',
                    'title' => 'New booking from ' . ($booking->user->name ?? 'Guest'),
                    'subtitle' => ($booking->court->name ?? 'Unknown Court') . ' • ' . $booking->created_at->diffForHumans(),
                    'status' => $booking->status,
                    'amount' => $booking->total_price,
                    'created_at' => $booking->created_at,
                ];
            });

        $recentOrders = Order::with('user')
            ->where('total_amount', '>', 0) // Filter out empty orders
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => 'order-' . $order->id,
                    'type' => 'order',
                    'title' => 'Order #' . $order->id . ' from ' . ($order->user->name ?? $order->customer_name ?? 'Guest'),
                    'subtitle' => ucfirst($order->type) . ' • ' . $order->created_at->diffForHumans(),
                    'status' => $order->status,
                    'amount' => $order->total_amount,
                    'created_at' => $order->created_at,
                ];
            });

        $recentUsers = User::where('role', 'user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => 'user-' . $user->id,
                    'type' => 'user',
                    'title' => 'New member registration',
                    'subtitle' => $user->name . ' • ' . $user->created_at->diffForHumans(),
                    'status' => 'new',
                    'amount' => null,
                    'created_at' => $user->created_at,
                ];
            });

        // Merge and sort
        $recentActivity = $recentBookings->concat($recentOrders)->concat($recentUsers)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_revenue' => $totalRevenue,
                'active_bookings' => $activeBookings,
                'new_members' => $newMembers,
                'today_sales' => $todaySales,
                'revenue_change' => $revenueChange,
                'members_change' => $membersChange,
                'today_sales_change' => $salesChange,
            ],
            'recent_activity' => $recentActivity,
        ]);
    }

    private function calculateGrowth($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
