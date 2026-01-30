<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Category::query()->withCount(['products', 'menuItems']);

        // Search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        // Type filter
        if (request('type')) {
            $query->where('type', request('type'));
        }

        // Sorting
        $sortBy = request('sort_by', 'created_at');
        $sortOrder = request('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $categories = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => Category::count(),
            'product_categories' => Category::where('type', 'product')->count(),
            'menu_categories' => Category::where('type', 'menu')->count(),
        ];

        return inertia('Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => request('search'),
                'type' => request('type'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);

        Category::create($data);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        // typically modal
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        if ($category->name !== $data['name']) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $category->update($data);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
