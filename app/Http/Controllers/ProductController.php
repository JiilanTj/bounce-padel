<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category', 'inventoryLogs')->latest()->paginate(10);
        $categories = \App\Models\Category::all(); // Fetch all categories for the form
        return inertia('Products/Index', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $product = Product::create($data);

            // Log initial stock for Buy
            if ($data['stock_buy'] > 0) {
                $product->inventoryLogs()->create([
                    'type' => 'in',
                    'quantity' => $data['stock_buy'],
                    'notes' => 'Initial stock (Buy)',
                ]);
            }

            // Log initial stock for Rent
            if ($data['stock_rent'] > 0) {
                $product->inventoryLogs()->create([
                    'type' => 'in',
                    'quantity' => $data['stock_rent'],
                    'notes' => 'Initial stock (Rent)',
                ]);
            }
        });

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $product) {
            // Calculate differences
            $diffBuy = $data['stock_buy'] - $product->stock_buy;
            $diffRent = $data['stock_rent'] - $product->stock_rent;

            $product->update($data);

            // Log stock changes
            if ($diffBuy !== 0) {
                $product->inventoryLogs()->create([
                    'type' => $diffBuy > 0 ? 'in' : 'out',
                    'quantity' => abs($diffBuy),
                    'notes' => 'Manual adjustment (Buy)',
                ]);
            }

            if ($diffRent !== 0) {
                $product->inventoryLogs()->create([
                    'type' => $diffRent > 0 ? 'in' : 'out',
                    'quantity' => abs($diffRent),
                    'notes' => 'Manual adjustment (Rent)',
                ]);
            }
        });

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
