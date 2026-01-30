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
        $query = Product::query()->with('category');

        // Search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('sku', 'like', '%' . request('search') . '%');
        }

        // Category filter
        if (request('category_id')) {
            $query->where('category_id', request('category_id'));
        }

        // Sorting
        $sortBy = request('sort_by', 'created_at');
        $sortOrder = request('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => Product::count(),
            'low_stock_buy' => Product::where('stock_buy', '<', 5)->count(),
            'low_stock_rent' => Product::where('stock_rent', '<', 5)->count(),
            'total_value' => Product::sum(\Illuminate\Support\Facades\DB::raw('(stock_buy * price_buy) + (stock_rent * price_rent)')),
        ];

        $categories = \App\Models\Category::where('type', 'product')->get();

        return inertia('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => request('search'),
                'category_id' => request('category_id'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
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
