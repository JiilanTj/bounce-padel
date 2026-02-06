<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
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
            ->with(['table', 'items.menuItem', 'user'])
            ->where('type', 'dining');

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
            'total' => Order::where('type', 'dining')->count(),
            'new' => Order::where('type', 'dining')->where('status', 'new')->count(),
            'processing' => Order::where('type', 'dining')->where('status', 'processing')->count(),
            'ready' => Order::where('type', 'dining')->where('status', 'ready')->count(),
            'total_revenue' => Order::where('type', 'dining')->where('status', 'completed')->sum('total_amount'),
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

        DB::transaction(function () use ($request) {
            $totalAmount = collect($request->items)->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });

            $order = Order::create([
                'table_id' => $request->table_id,
                'customer_name' => $request->customer_name,
                'type' => 'dining',
                'status' => 'new',
                'total_amount' => $totalAmount,
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }
        });

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
