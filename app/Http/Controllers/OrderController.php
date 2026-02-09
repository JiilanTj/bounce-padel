<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Order::query()
            ->with(['table', 'items.item', 'user'])
            ->whereIn('type', ['dining', 'pos']);

        // Search
        if (request('search')) {
            $query->where(function ($q) {
                $q->where('customer_name', 'like', '%' . request('search') . '%')
                  ->orWhereHas('table', function ($tq) {
                      $tq->where('number', 'like', '%' . request('search') . '%');
                  });
            });
        }

        // Status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Sorting
        $sortBy = request('sort_by', 'created_at');
        $sortOrder = request('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $orders = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total' => Order::whereIn('type', ['dining', 'pos'])->count(),
            'new' => Order::whereIn('type', ['dining', 'pos'])->where('status', 'new')->count(),
            'processing' => Order::whereIn('type', ['dining', 'pos'])->where('status', 'processing')->count(),
            'ready' => Order::whereIn('type', ['dining', 'pos'])->where('status', 'ready')->count(),
            'total_revenue' => Order::whereIn('type', ['dining', 'pos'])->where('status', 'completed')->sum('total_amount'),
        ];

        return inertia('Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Get stats for polling (lightweight endpoint)
     */
    public function stats()
    {
        return response()->json([
            'new' => Order::whereIn('type', ['dining', 'pos'])->where('status', 'new')->count(),
            'total' => Order::whereIn('type', ['dining', 'pos'])->count(),
        ]);
    }

    /**
     * Store a newly created order from cafe resto
     */
    public function store(Request $request)
    {
        $request->validate([
            'table_id' => 'required|exists:tables,id',
            'customer_name' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $order = null;

        DB::transaction(function () use ($request, &$order) {
            $totalAmount = collect($request->items)->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });

            $order = Order::create([
                'user_id' => auth()->id(), // null for guest users
                'table_id' => $request->table_id,
                'customer_name' => $request->customer_name,
                'type' => 'dining',
                'status' => 'new',
                'total_amount' => $totalAmount,
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'item_type' => MenuItem::class,
                    'item_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }
        });

        // Create notifications ONLY for cashier users
        if ($order) {
            $table = Table::find($request->table_id);
            $itemsCount = collect($request->items)->sum('quantity');

            // Get all cashier users only (NOT owner, NOT admin)
            $cashierIds = User::where('role', 'kasir')->pluck('id');

            foreach ($cashierIds as $cashierId) {
                Notification::create([
                    'user_id' => $cashierId, // Specific user, not broadcast
                    'type' => 'order_created',
                    'title' => "Order baru dari {$request->customer_name}",
                    'message' => "Meja {$table->number} • {$itemsCount} item",
                    'data' => [
                        'order_id' => $order->id,
                        'customer_name' => $request->customer_name,
                        'table_number' => $table->number,
                        'order_type' => 'dining',
                        'total_amount' => $order->total_amount,
                        'items_count' => $itemsCount,
                    ],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat',
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:new,processing,ready,delivered,completed,cancelled,paid',
        ]);

        $order->update([
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Status pesanan berhasil diubah');
    }
}
