<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\MenuItemIngredient;
use Illuminate\Http\Request;

class MenuItemRecipeController extends Controller
{
    public function index(Request $request, MenuItem $menuItem)
    {
        $ingredients = $menuItem->ingredients()->with('category')->get();

        // Calculate total cost
        $totalCost = $ingredients->sum(function ($ingredient) {
            return $ingredient->pivot->quantity * $ingredient->unit_price;
        });

        return response()->json([
            'menu_item' => $menuItem,
            'ingredients' => $ingredients,
            'total_cost' => $totalCost,
        ]);
    }

    public function store(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'ingredients' => 'required|array',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.001',
            'ingredients.*.unit' => 'nullable|string|max:50',
        ]);

        // Sync ingredients
        $syncData = [];
        foreach ($validated['ingredients'] as $item) {
            $syncData[$item['ingredient_id']] = [
                'quantity' => $item['quantity'],
                'unit' => $item['unit'] ?? null,
            ];
        }

        $menuItem->ingredients()->sync($syncData);

        // Reload with fresh data
        $ingredients = $menuItem->ingredients()->with('category')->get();

        $totalCost = $ingredients->sum(function ($ingredient) {
            return $ingredient->pivot->quantity * $ingredient->unit_price;
        });

        return response()->json([
            'message' => 'Recipe updated successfully',
            'menu_item' => $menuItem->load('category'),
            'ingredients' => $ingredients,
            'total_cost' => $totalCost,
        ]);
    }

    public function addIngredient(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'nullable|string|max:50',
        ]);

        // Check if ingredient already exists
        $existing = $menuItem->ingredients()->where('ingredient_id', $validated['ingredient_id'])->first();

        if ($existing) {
            // Update quantity
            $menuItem->ingredients()->updateExistingPivot($validated['ingredient_id'], [
                'quantity' => $existing->pivot->quantity + $validated['quantity'],
                'unit' => $validated['unit'] ?? $existing->pivot->unit,
            ]);
        } else {
            // Attach new ingredient
            $menuItem->ingredients()->attach($validated['ingredient_id'], [
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'] ?? null,
            ]);
        }

        $ingredients = $menuItem->ingredients()->with('category')->get();
        $totalCost = $ingredients->sum(function ($ingredient) {
            return $ingredient->pivot->quantity * $ingredient->unit_price;
        });

        return response()->json([
            'message' => 'Ingredient added to recipe',
            'ingredients' => $ingredients,
            'total_cost' => $totalCost,
        ]);
    }

    public function updateIngredient(Request $request, MenuItem $menuItem, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'nullable|string|max:50',
        ]);

        // Check if ingredient is in recipe
        if (!$menuItem->ingredients()->where('ingredient_id', $ingredient->id)->exists()) {
            return response()->json([
                'message' => 'Ingredient not found in recipe',
            ], 404);
        }

        $menuItem->ingredients()->updateExistingPivot($ingredient->id, [
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'] ?? null,
        ]);

        $ingredients = $menuItem->ingredients()->with('category')->get();
        $totalCost = $ingredients->sum(function ($item) {
            return $item->pivot->quantity * $item->unit_price;
        });

        return response()->json([
            'message' => 'Ingredient updated',
            'ingredients' => $ingredients,
            'total_cost' => $totalCost,
        ]);
    }

    public function removeIngredient(MenuItem $menuItem, Ingredient $ingredient)
    {
        $menuItem->ingredients()->detach($ingredient->id);

        $ingredients = $menuItem->ingredients()->with('category')->get();
        $totalCost = $ingredients->sum(function ($item) {
            return $item->pivot->quantity * $item->unit_price;
        });

        return response()->json([
            'message' => 'Ingredient removed from recipe',
            'ingredients' => $ingredients,
            'total_cost' => $totalCost,
        ]);
    }

    public function getAvailableIngredients(Request $request)
    {
        $query = Ingredient::active()->with('category');

        // Search
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

        // Filter by storage location
        if ($request->storage_location) {
            $query->where('storage_location', $request->storage_location);
        }

        $ingredients = $query->orderBy('name')->get();

        return response()->json($ingredients);
    }

    public function calculateCost(MenuItem $menuItem)
    {
        $ingredients = $menuItem->ingredients()->with('category')->get();

        $totalCost = 0;
        $ingredientCosts = [];

        foreach ($ingredients as $ingredient) {
            $cost = $ingredient->pivot->quantity * $ingredient->unit_price;
            $totalCost += $cost;

            $ingredientCosts[] = [
                'ingredient_id' => $ingredient->id,
                'ingredient_name' => $ingredient->name,
                'quantity' => $ingredient->pivot->quantity,
                'unit' => $ingredient->pivot->unit ?? $ingredient->unit,
                'unit_price' => $ingredient->unit_price,
                'cost' => $cost,
            ];
        }

        return response()->json([
            'menu_item' => $menuItem,
            'total_cost' => $totalCost,
            'menu_item_price' => $menuItem->price,
            'profit' => $menuItem->price - $totalCost,
            'profit_margin' => $menuItem->price > 0 ? (($menuItem->price - $totalCost) / $menuItem->price) * 100 : 0,
            'ingredients' => $ingredientCosts,
        ]);
    }

    public function checkStockAvailability(MenuItem $menuItem, Request $request)
    {
        $quantity = $request->quantity ?? 1;
        $ingredients = $menuItem->ingredients()->get();

        $issues = [];
        $canMake = true;

        foreach ($ingredients as $ingredient) {
            $required = $ingredient->pivot->quantity * $quantity;
            $available = $ingredient->current_stock;

            if ($required > $available) {
                $canMake = false;
                $issues[] = [
                    'ingredient' => $ingredient->name,
                    'required' => $required,
                    'available' => $available,
                    'shortage' => $required - $available,
                ];
            }
        }

        return response()->json([
            'can_make' => $canMake,
            'quantity' => $quantity,
            'issues' => $issues,
        ]);
    }
}
