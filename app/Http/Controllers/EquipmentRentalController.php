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

class EquipmentRentalController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.item'])
            ->where('type', 'pos')
            ->whereHas('items', function ($q) {
                // Use whereHasMorph to specifically check Product items and avoid querying MenuItems
                // Filter by price_rent > 0 to identify rental products, regardless of current stock level
                $q->whereHasMorph('item', [\App\Models\Product::class], function ($q2) {
                    $q2->where('price_rent', '>', 0);
                });
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

        $rentals = $query->paginate(15)->withQueryString();

        return Inertia::render('EquipmentRentals/Index', [
            'rentals' => $rentals,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'date' => $request->date,
            ],
        ]);
    }

    public function create()
    {
        $products = Product::where('stock_rent', '>', 0)
            ->with('category')
            ->get();
        
        $categories = Category::all();

        return Inertia::render('EquipmentRentals/Create', [
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
            'rental_duration' => 'required|integer|min:1', // hours
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
                'status' => 'processing', // Rental is ongoing
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            // Add order items
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check stock
                if ($product->stock_rent < $item['quantity']) {
                    throw new \Exception("Insufficient rental stock for {$product->name}");
                }

                // Calculate rental price (price_rent is per hour)
                $subtotal = $product->price_rent * $item['quantity'] * $validated['rental_duration'];
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'item_type' => 'App\Models\Product',
                    'item_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price_rent * $validated['rental_duration'],
                    'subtotal' => $subtotal,
                    'notes' => "Rental: {$validated['rental_duration']} hours" . ($item['notes'] ?? ''),
                ]);

                // Reduce rental stock
                $product->decrement('stock_rent', $item['quantity']);
            }

            // Update order total
            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            return redirect()->route('equipment-rentals.index')
                ->with('success', 'Equipment rental created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Order $equipment_rental)
    {
        $equipment_rental->load(['user', 'items.item']);

        return Inertia::render('EquipmentRentals/Show', [
            'rental' => $equipment_rental,
        ]);
    }

    public function update(Request $request, Order $equipment_rental)
    {
        // Complete rental - return equipment
        $validated = $request->validate([
            'status' => 'required|in:completed,cancelled',
            'return_notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            // If completing or cancelling, restore stock
            if (in_array($validated['status'], ['completed', 'cancelled'])) {
                foreach ($equipment_rental->items as $item) {
                    if ($item->item_type === 'App\Models\Product') {
                        $item->item->increment('stock_rent', $item->quantity);
                    }
                }
            }

            $equipment_rental->update([
                'status' => $validated['status'],
                'return_notes' => $validated['return_notes'] ?? null,
            ]);

            DB::commit();

            return redirect()->route('equipment-rentals.index')
                ->with('success', 'Rental status updated and equipment returned!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Order $equipment_rental)
    {
        DB::beginTransaction();
        try {
            // Restore stock for each item
            foreach ($equipment_rental->items as $item) {
                if ($item->item_type === 'App\Models\Product') {
                    $item->item->increment('stock_rent', $item->quantity);
                }
            }

            $equipment_rental->delete();

            DB::commit();

            return redirect()->route('equipment-rentals.index')
                ->with('success', 'Rental deleted and equipment returned!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
