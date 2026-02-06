<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Menu;
use App\Models\Category;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class POSController extends Controller
{
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

        DB::transaction(function () use ($request) {
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
        });

        return redirect()->back()->with('success', 'Pesanan berhasil dibuat');
    }
}
