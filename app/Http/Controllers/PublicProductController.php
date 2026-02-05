<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\WebsiteSetting;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    /**
     * Display rental products for public
     */
    public function rental(Request $request)
    {
        $query = Product::query()
            ->where('type', 'rent')
            ->where('stock_rent', '>', 0)
            ->with('category');

        // Search
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('name', 'asc')->get();
        $settings = WebsiteSetting::first();

        // Get categories that have rental products
        $categories = Product::where('type', 'rent')
            ->where('stock_rent', '>', 0)
            ->with('category')
            ->get()
            ->pluck('category')
            ->unique('id')
            ->values();

        return inertia('Public/Rental', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
            ],
            'settings' => $settings,
        ]);
    }

    /**
     * Display store products for public
     */
    public function store(Request $request)
    {
        $query = Product::query()
            ->where('type', 'sale')
            ->where('stock_buy', '>', 0)
            ->with('category');

        // Search
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('name', 'asc')->get();
        $settings = WebsiteSetting::first();

        // Get categories that have store products
        $categories = Product::where('type', 'sale')
            ->where('stock_buy', '>', 0)
            ->with('category')
            ->get()
            ->pluck('category')
            ->unique('id')
            ->values();

        return inertia('Public/Store', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
            ],
            'settings' => $settings,
        ]);
    }
}