<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductSaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.item'])
            ->where('type', 'pos')
            ->whereHas('items', function ($q) {
                $q->where('item_type', 'App\Models\Product');
            })
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Search by customer name
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $sales = $query->paginate(15)->withQueryString();

        return Inertia::render('ProductSales/Index', [
            'sales' => $sales,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'date' => $request->date,
            ],
        ]);
    }

    public function create()
    {
        $products = Product::where('stock_buy', '>', 0)
            ->with('category')
            ->get();
        
        $categories = Category::all();

        return Inertia::render('ProductSales/Create', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Find or create user
            $user = User::firstOrCreate(
                ['email' => $validated['customer_email']],
                [
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone'],
                    'password' => bcrypt(str()->random(16)),
                    'role' => 'user',
                ]
            );

            // Update phone if changed
            if ($user->phone !== $validated['customer_phone']) {
                $user->update(['phone' => $validated['customer_phone']]);
            }

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'type' => 'pos',
                'status' => 'paid',
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            // Add order items
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check stock
                if ($product->stock_buy < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$product->name}");
                }

                $subtotal = $product->price_buy * $item['quantity'];
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'item_type' => 'App\Models\Product',
                    'item_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price_buy,
                    'subtotal' => $subtotal,
                    'notes' => $item['notes'] ?? null,
                ]);

                // Reduce stock
                $product->decrement('stock_buy', $item['quantity']);
            }

            // Update order total
            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            return redirect()->route('product-sales.index')
                ->with('success', 'Product sale created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Order $product_sale)
    {
        $product_sale->load(['user', 'items.item']);

        return Inertia::render('ProductSales/Show', [
            'sale' => $product_sale,
        ]);
    }

    public function destroy(Order $product_sale)
    {
        if (auth()->user()->role === 'kasir') {
            abort(403, 'Cashiers are not allowed to delete product sales.');
        }

        DB::beginTransaction();
        try {
            // Restore stock for each item
            foreach ($product_sale->items as $item) {
                if ($item->item_type === 'App\Models\Product') {
                    $item->item->increment('stock_buy', $item->quantity);
                }
            }

            $product_sale->delete();

            DB::commit();

            return redirect()->route('product-sales.index')
                ->with('success', 'Product sale deleted and stock restored!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
