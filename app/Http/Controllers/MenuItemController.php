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
        // Usually filtered by menu, but for master list:
        $menuItems = MenuItem::with('menu')->latest()->paginate(10);
        return inertia('MenuItems/Index', [
            'menuItems' => $menuItems
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
