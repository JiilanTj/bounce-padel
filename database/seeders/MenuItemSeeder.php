<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch categories by slug for easier assignment
        $categories = DB::table('categories')->where('type', 'menu')->pluck('id', 'slug');

        $menuItems = [
            // All Day Menu (menu_id: 1) - Beverages
            [
                'menu_id' => 1,
                'category_id' => $categories['beverages'],
                'name' => 'Espresso',
                'description' => 'Strong Italian coffee',
                'price' => 25000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 1,
                'category_id' => $categories['beverages'],
                'name' => 'Cappuccino',
                'description' => 'Espresso with steamed milk foam',
                'price' => 35000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 1,
                'category_id' => $categories['beverages'],
                'name' => 'Iced Latte',
                'description' => 'Cold espresso with milk',
                'price' => 38000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 1,
                'category_id' => $categories['beverages'],
                'name' => 'Fresh Orange Juice',
                'description' => 'Freshly squeezed orange juice',
                'price' => 30000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 1,
                'category_id' => $categories['beverages'],
                'name' => 'Mineral Water',
                'description' => 'Bottled mineral water',
                'price' => 10000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 1,
                'category_id' => $categories['beverages'],
                'name' => 'Isotonic Drink',
                'description' => 'Sports drink for hydration',
                'price' => 15000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Breakfast Menu (menu_id: 2)
            [
                'menu_id' => 2,
                'category_id' => $categories['main-course'],
                'name' => 'American Breakfast',
                'description' => 'Eggs, bacon, sausage, toast, and hash browns',
                'price' => 65000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 2,
                'category_id' => $categories['desserts'],
                'name' => 'Pancakes',
                'description' => 'Fluffy pancakes with maple syrup and butter',
                'price' => 45000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 2,
                'category_id' => $categories['main-course'],
                'name' => 'Nasi Goreng',
                'description' => 'Indonesian fried rice with egg',
                'price' => 40000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Lunch & Dinner (menu_id: 3)
            [
                'menu_id' => 3,
                'category_id' => $categories['main-course'],
                'name' => 'Grilled Chicken Steak',
                'description' => 'Grilled chicken with vegetables and mashed potato',
                'price' => 75000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 3,
                'category_id' => $categories['main-course'],
                'name' => 'Beef Burger',
                'description' => 'Juicy beef patty with cheese, lettuce, and fries',
                'price' => 65000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 3,
                'category_id' => $categories['main-course'],
                'name' => 'Spaghetti Carbonara',
                'description' => 'Creamy pasta with bacon and parmesan',
                'price' => 60000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 3,
                'category_id' => $categories['main-course'],
                'name' => 'Caesar Salad',
                'description' => 'Fresh romaine with caesar dressing and croutons',
                'price' => 45000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 3,
                'category_id' => $categories['snacks'],
                'name' => 'French Fries',
                'description' => 'Crispy golden fries',
                'price' => 25000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 3,
                'category_id' => $categories['snacks'],
                'name' => 'Chicken Wings',
                'description' => 'Spicy buffalo wings with ranch dip',
                'price' => 50000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => 3,
                'category_id' => $categories['desserts'],
                'name' => 'Ice Cream Sundae',
                'description' => 'Vanilla ice cream with chocolate sauce and toppings',
                'price' => 35000,
                'image_url' => null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('menu_items')->insert($menuItems);
    }
}
