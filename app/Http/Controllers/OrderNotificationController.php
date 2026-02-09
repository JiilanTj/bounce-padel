<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderNotificationController extends Controller
{
    /**
     * SSE endpoint for real-time order notifications
     * Only accessible by cashier role
     */
    public function stream(Request $request): StreamedResponse
    {
        // Only allow cashier and owner roles
        $user = Auth::user();
        if ($user->role !== 'kasir' && $user->role !== 'owner') {
            abort(403, 'Unauthorized');
        }

        // Get the last order ID from the request (for initial connection)
        $lastOrderId = (int) $request->input('last_order_id', 0);

        // Close the session to prevent blocking other requests
        Session::save();

        return response()->stream(function () use ($lastOrderId) {
            // Set headers for SSE
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no'); // Disable Nginx buffering

            // Disable PHP time limit for long-running connection
            set_time_limit(0);

            // Send initial stats
            $stats = [
                'event' => 'initial',
                'data' => [
                    'new_count' => Order::whereIn('type', ['dining', 'pos'])
                        ->where('status', 'new')
                        ->count(),
                    'last_order_id' => Order::whereIn('type', ['dining', 'pos'])
                        ->max('id') ?? 0,
                ],
            ];
            $this->sendSSE($stats['event'], $stats['data']);

            // Check for new orders every 2 seconds
            $lastCheckedId = $lastOrderId;
            $iterations = 0;
            $maxIterations = 3600; // Max 2 hours (3600 * 2 seconds)

            while ($iterations < $maxIterations) {
                // Check if connection is aborted
                if (connection_aborted()) {
                    break;
                }

                // Get new orders
                $newOrders = Order::whereIn('type', ['dining', 'pos'])
                    ->where('id', '>', $lastCheckedId)
                    ->with(['table', 'items.item'])
                    ->get();

                if ($newOrders->isNotEmpty()) {
                    foreach ($newOrders as $order) {
                        // Send notification for new order
                        $this->sendSSE('new_order', [
                            'order_id' => $order->id,
                            'customer_name' => $order->customer_name,
                            'table_number' => $order->table?->number,
                            'type' => $order->type,
                            'total_amount' => $order->total_amount,
                            'items_count' => $order->items->sum('quantity'),
                            'created_at' => $order->created_at->toISOString(),
                        ]);

                        $lastCheckedId = $order->id;
                    }
                }

                // Send keepalive to prevent timeout
                echo ": keepalive\n\n";
                ob_flush();
                flush();

                // Sleep for 2 seconds
                sleep(2);
                $iterations++;
            }
        }, 200);
    }

    /**
     * Send SSE message
     */
    private function sendSSE(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data) . "\n\n";
        ob_flush();
        flush();
    }
}
