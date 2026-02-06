<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Category;
use App\Models\WebsiteSetting;
use Inertia\Inertia;

class PublicMenuController extends Controller
{
    public function index()
    {
        $menus = Menu::where('is_active', true)
            ->with(['items' => function ($query) {
                $query->where('is_available', true)
                    ->with('category')
                    ->orderBy('name');
            }])
            ->get();

        // Get unique categories from menu items
        $categoryIds = $menus->flatMap(function ($menu) {
            return $menu->items->pluck('category_id');
        })->unique()->filter();

        $categories = Category::whereIn('id', $categoryIds)->get();

        return Inertia::render('Public/CafeResto', [
            'menus' => $menus,
            'categories' => $categories,
            'settings' => WebsiteSetting::first(),
        ]);
    }
}
