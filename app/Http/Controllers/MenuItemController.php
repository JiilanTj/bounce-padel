<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = MenuItem::query()->with(['menu', 'category']);

        // Search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('description', 'like', '%' . request('search') . '%');
        }

        // Menu filter
        if (request('menu_id')) {
            $query->where('menu_id', request('menu_id'));
        }

        // Sorting
        $sortBy = request('sort_by', 'created_at');
        $sortOrder = request('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $menuItems = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => MenuItem::count(),
            'by_menu' => MenuItem::selectRaw('menu_id, count(*) as count')
                ->groupBy('menu_id')
                ->pluck('count', 'menu_id')
                ->toArray(),
            'avg_price' => MenuItem::avg('price'),
        ];

        $menus = \App\Models\Menu::all();
        $categories = \App\Models\Category::where('type', 'menu')->get();

        return inertia('MenuItems/Index', [
            'menuItems' => $menuItems,
            'menus' => $menus,
            'categories' => $categories,
            'filters' => [
                'search' => request('search'),
                'menu_id' => request('menu_id'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMenuItemRequest $request)
    {
        $data = $request->validated();
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menu-items', 'r2');
            $data['image_url'] = Storage::disk('r2')->url($path);
        }

        MenuItem::create($data);
        return redirect()->back()->with('success', 'Menu Item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MenuItem $menuItem)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MenuItem $menuItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($menuItem->image_url) {
                $oldPath = str_replace(env('R2_PUBLIC_URL') . '/', '', $menuItem->image_url);
                if (Storage::disk('r2')->exists($oldPath)) {
                    Storage::disk('r2')->delete($oldPath);
                }
            }
            $path = $request->file('image')->store('menu-items', 'r2');
            $data['image_url'] = Storage::disk('r2')->url($path);
        }

        $menuItem->update($data);
        return redirect()->back()->with('success', 'Menu Item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();
        return redirect()->back()->with('success', 'Menu Item deleted successfully.');
    }
}
