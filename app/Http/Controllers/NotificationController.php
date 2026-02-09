<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct()
    {
        // Only allow kasir role to access notifications
        $this->middleware('role:kasir');
    }

    /**
     * Get notifications for the authenticated user.
     * Returns both unread and read notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Get notifications for this user only (no broadcast)
        $query = Notification::query()
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filter by read status if requested
        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->unread();
        }

        $notifications = $query->limit(50)->get();

        // Get counts
        $unreadCount = Notification::query()
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            })
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread count for the authenticated user.
     * Lightweight endpoint for polling.
     */
    public function count(): JsonResponse
    {
        $user = auth()->user();

        $unreadCount = Notification::query()
            ->where('user_id', $user->id)
            ->unread()
            ->count();

        return response()->json([
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        // Check if user owns this notification or it's a broadcast notification
        $user = auth()->user();
        if ($notification->user_id !== null && $notification->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $result = $notification->markAsRead();

        \Log::info('Mark notification as read', [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'result' => $result,
            'read_at' => $notification->fresh()->read_at,
        ]);

        return response()->json([
            'success' => true,
            'read_at' => $notification->fresh()->read_at,
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = auth()->user();

        $affected = Notification::query()
            ->where('user_id', $user->id)
            ->unread()
            ->update(['read_at' => now()]);

        \Log::info('Mark all notifications as read', [
            'user_id' => $user->id,
            'affected_rows' => $affected,
        ]);

        return response()->json([
            'success' => true,
            'affected' => $affected,
        ]);
    }

    /**
     * Delete all read notifications for the authenticated user.
     */
    public function deleteRead(): JsonResponse
    {
        $user = auth()->user();

        Notification::query()
            ->where('user_id', $user->id)
            ->read()
            ->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
