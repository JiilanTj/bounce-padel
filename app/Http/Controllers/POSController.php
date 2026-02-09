<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Menu;
use App\Models\Category;
use App\Models\Table;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class POSController extends Controller
{
    /**
     * Deduct ingredients stock for menu items
     */
    private function deductIngredientsStock(Order $order): void
    {
        foreach ($order->items as $orderItem) {
            if ($orderItem->item_type === MenuItem::class) {
                $menuItem = MenuItem::find($orderItem->item_id);
                if ($menuItem) {
                    foreach ($menuItem->ingredients as $ingredient) {
                        $quantityNeeded = $ingredient->pivot->quantity * $orderItem->quantity;
                        try {
                            $ingredient->deductStock($quantityNeeded, 'sale', [
                                'reference_type' => 'order',
                                'reference_id' => $order->id,
                                'notes' => "Order #{$order->id} - {$menuItem->name} x{$orderItem->quantity}",
                            ]);
                        } catch (\Exception $e) {
                            // Log warning but don't fail the order
                            // Stock will go negative but we can track it
                            \Log::warning("Stock deduction failed: " . $e->getMessage());
                        }
                    }
                }
            }
        }
    }

    /**
     * Display POS interface
     */
    public function index()
    {
        $menus = Menu::with(['items.category'])
            ->where('is_active', true)
            ->get();

        $categories = Category::orderBy('name')->get();
        $tables = Table::orderBy('number')->get();

        return inertia('POS/Index', [
            'menus' => $menus,
            'categories' => $categories,
            'tables' => $tables,
        ]);
    }

    /**
     * Store a newly created order from POS
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
                'user_id' => auth()->id(),
                'table_id' => $request->table_id,
                'customer_name' => $request->customer_name,
                'type' => 'pos',
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

            // Auto deduct ingredients stock
            $this->deductIngredientsStock($order);
        });

        // Create notifications ONLY for other cashier users
        if ($order) {
            $table = Table::find($request->table_id);
            $itemsCount = collect($request->items)->sum('quantity');
            $currentUserId = auth()->id();

            // Get all cashier users EXCEPT the current user
            $cashierIds = User::where('role', 'kasir')
                ->where('id', '!=', $currentUserId)
                ->pluck('id');

            foreach ($cashierIds as $cashierId) {
                Notification::create([
                    'user_id' => $cashierId, // Specific user, not broadcast
                    'type' => 'order_created',
                    'title' => "Order baru dari {$request->customer_name}",
                    'message' => "Meja {$table->number} • {$itemsCount} item • POS",
                    'data' => [
                        'order_id' => $order->id,
                        'customer_name' => $request->customer_name,
                        'table_number' => $table->number,
                        'order_type' => 'pos',
                        'total_amount' => $order->total_amount,
                        'items_count' => $itemsCount,
                    ],
                ]);
            }
        }

        return redirect()->back()->with('success', 'Pesanan berhasil dibuat');
    }
}
