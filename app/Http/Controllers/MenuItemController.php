<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Models\MenuItem;

class MenuItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = MenuItem::query()->with('menu');

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

        return inertia('MenuItems/Index', [
            'menuItems' => $menuItems,
            'menus' => $menus,
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
        MenuItem::create($request->validated());
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
        $menuItem->update($request->validated());
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
