<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IngredientController extends Controller
{
    public function index(Request $request)
    {
        $query = Ingredient::with('category');

        // Search by name or SKU
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by category
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by low stock
        if ($request->low_stock) {
            $query->lowStock();
        }

        // Filter by storage location
        if ($request->storage_location) {
            $query->inStorage($request->storage_location);
        }

        // Order by
        $orderBy = $request->order_by ?? 'name';
        $orderDir = $request->order_dir ?? 'asc';
        $query->orderBy($orderBy, $orderDir);

        // Paginate
        $perPage = $request->per_page ?? 15;
        $ingredients = $query->paginate($perPage);

        // Stats
        $stats = [
            'total' => Ingredient::count(),
            'active' => Ingredient::active()->count(),
            'low_stock' => Ingredient::lowStock()->count(),
            'total_value' => Ingredient::selectRaw('SUM(current_stock * unit_price) as value')
                ->value('value') ?? 0,
        ];

        // Categories
        $categories = Category::orderBy('name')->get();

        // Check if expecting JSON response (API calls)
        if ($request->wantsJson()) {
            return response()->json($ingredients);
        }

        return Inertia::render('Ingredients/Index', [
            'ingredients' => $ingredients,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'storage_location' => $request->storage_location,
                'low_stock' => $request->low_stock,
                'is_active' => $request->is_active,
                'sort_by' => $orderBy,
                'sort_order' => $orderDir,
            ],
            'stats' => $stats,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:ingredients,sku',
            'description' => 'nullable|string',
            'unit' => 'required|in:kg,gram,liter,ml,pcs,butir,lusin,ikat,pack,botol',
            'unit_type' => 'required|in:weight,volume,quantity',
            'current_stock' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_contact' => 'nullable|string|max:255',
            'expiry_days' => 'nullable|integer|min:0',
            'storage_location' => 'required|in:dry,chiller,freezer,shelf',
            'is_active' => 'boolean',
        ]);

        $ingredient = Ingredient::create($validated);

        // Create opening balance movement if stock is provided
        if (!empty($validated['current_stock']) && $validated['current_stock'] > 0) {
            $ingredient->addStock($validated['current_stock'], 'opening_balance', [
                'notes' => 'Opening balance',
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json($ingredient->load('category'), 201);
        }

        return redirect()->back()->with('success', 'Ingredient created successfully');
    }

    public function show(Ingredient $ingredient)
    {
        if (request()->wantsJson()) {
            return response()->json($ingredient->load('category', 'stockMovements.creator'));
        }

        return redirect()->route('ingredients.index');
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('ingredients')->ignore($ingredient->id),
            ],
            'description' => 'nullable|string',
            'unit' => 'sometimes|required|in:kg,gram,liter,ml,pcs,butir,lusin,ikat,pack,botol',
            'unit_type' => 'sometimes|required|in:weight,volume,quantity',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_contact' => 'nullable|string|max:255',
            'expiry_days' => 'nullable|integer|min:0',
            'storage_location' => 'sometimes|required|in:dry,chiller,freezer,shelf',
            'is_active' => 'boolean',
        ]);

        $ingredient->update($validated);

        if ($request->wantsJson()) {
            return response()->json($ingredient->load('category'));
        }

        return redirect()->back()->with('success', 'Ingredient updated successfully');
    }

    public function destroy(Ingredient $ingredient)
    {
        $ingredient->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Ingredient deleted successfully']);
        }

        return redirect()->back()->with('success', 'Ingredient deleted successfully');
    }

    public function getLowStock()
    {
        $ingredients = Ingredient::with('category')
            ->lowStock()
            ->active()
            ->orderBy('current_stock', 'asc')
            ->get();

        return response()->json($ingredients);
    }

    public function getStats()
    {
        $total = Ingredient::count();
        $active = Ingredient::active()->count();
        $lowStock = Ingredient::lowStock()->count();
        $totalValue = Ingredient::selectRaw('SUM(current_stock * unit_price) as value')
            ->value('value') ?? 0;

        return response()->json([
            'total' => $total,
            'active' => $active,
            'low_stock' => $lowStock,
            'total_value' => (float) $totalValue,
        ]);
    }
}
