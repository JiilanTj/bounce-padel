<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\IngredientStockMovement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IngredientStockController extends Controller
{
    public function movements(Request $request)
    {
        $query = IngredientStockMovement::with('ingredient.category', 'creator');

        // Filter by ingredient
        if ($request->ingredient_id) {
            $query->where('ingredient_id', $request->ingredient_id);
        }

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by reason
        if ($request->reason) {
            $query->where('reason', $request->reason);
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        // Paginate
        $perPage = $request->per_page ?? 15;
        $movements = $query->paginate($perPage);

        return response()->json($movements);
    }

    public function addStock(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'reason' => 'required|in:purchase,return,adjustment,opening_balance',
            'reference_type' => 'nullable|string|max:255',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        $movement = $ingredient->addStock(
            $validated['quantity'],
            $validated['reason'],
            [
                'reference_type' => $validated['reference_type'] ?? null,
                'reference_id' => $validated['reference_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Stock added successfully',
            'movement' => $movement->load('ingredient'),
        ]);
    }

    public function deductStock(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'reason' => 'required|in:sale,damage,expired,adjustment',
            'reference_type' => 'nullable|string|max:255',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        try {
            $movement = $ingredient->deductStock(
                $validated['quantity'],
                $validated['reason'],
                [
                    'reference_type' => $validated['reference_type'] ?? null,
                    'reference_id' => $validated['reference_id'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            return response()->json([
                'message' => 'Stock deducted successfully',
                'movement' => $movement->load('ingredient'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function adjustStock(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'new_stock' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $currentStock = $ingredient->current_stock;
        $newStock = $validated['new_stock'];
        $difference = $newStock - $currentStock;

        if ($difference == 0) {
            return response()->json([
                'message' => 'No adjustment needed',
            ]);
        }

        if ($difference > 0) {
            $movement = $ingredient->addStock($difference, 'adjustment', [
                'notes' => $validated['notes'] ?? "Stock adjustment from {$currentStock} to {$newStock}",
            ]);
        } else {
            try {
                $movement = $ingredient->deductStock(abs($difference), 'adjustment', [
                    'notes' => $validated['notes'] ?? "Stock adjustment from {$currentStock} to {$newStock}",
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }
        }

        return response()->json([
            'message' => 'Stock adjusted successfully',
            'movement' => $movement->load('ingredient'),
        ]);
    }

    public function getHistory(Ingredient $ingredient, Request $request)
    {
        $query = $ingredient->stockMovements()->with('creator');

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by reason
        if ($request->reason) {
            $query->where('reason', $request->reason);
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        // Paginate
        $perPage = $request->per_page ?? 15;
        $movements = $query->paginate($perPage);

        return response()->json($movements);
    }

    public function getStats()
    {
        $totalIn = IngredientStockMovement::where('type', 'in')->sum('quantity');
        $totalOut = abs(IngredientStockMovement::where('type', 'out')->sum('quantity'));

        $recentMovements = IngredientStockMovement::with('ingredient')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'total_in' => (float) $totalIn,
            'total_out' => (float) $totalOut,
            'net_movement' => (float) ($totalIn - $totalOut),
            'recent_movements' => $recentMovements,
        ]);
    }
}
