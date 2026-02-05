<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Inventory;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Inventory::query();

        // Search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('sku', 'like', '%' . request('search') . '%')
                  ->orWhere('owner_name', 'like', '%' . request('search') . '%');
        }

        // Status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Category filter
        if (request('category')) {
            $query->where('category', request('category'));
        }

        // Sorting
        $sortBy = request('sort_by', 'created_at');
        $sortOrder = request('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $inventories = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => Inventory::count(),
            'functional' => Inventory::where('status', 'functional')->count(),
            'damaged' => Inventory::where('status', 'damaged')->count(),
            'lost' => Inventory::where('status', 'lost')->count(),
            'maintenance' => Inventory::where('status', 'maintenance')->count(),
            'total_value' => Inventory::where('status', 'functional')->sum(\Illuminate\Support\Facades\DB::raw('price * quantity')),
        ];

        return inertia('Inventories/Index', [
            'inventories' => $inventories,
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
                'category' => request('category'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('inventories', 'r2');
            $data['image_path'] = Storage::disk('r2')->url($path);
        }

        Inventory::create($data);

        return redirect()->back()->with('success', 'Inventory item created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($inventory->image_path) {
                $oldPath = str_replace(Storage::disk('r2')->url(''), '', $inventory->image_path);
                Storage::disk('r2')->delete($oldPath);
            }

            $path = $request->file('image')->store('inventories', 'r2');
            $data['image_path'] = Storage::disk('r2')->url($path);
        }

        $inventory->update($data);

        return redirect()->back()->with('success', 'Inventory item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        // Delete image if exists
        if ($inventory->image_path) {
            $path = str_replace(Storage::disk('r2')->url(''), '', $inventory->image_path);
            Storage::disk('r2')->delete($path);
        }

        $inventory->delete();

        return redirect()->back()->with('success', 'Inventory item deleted successfully.');
    }
}
