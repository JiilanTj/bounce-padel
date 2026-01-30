<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Product Categories
            [
                'name' => 'Padel Equipment',
                'slug' => 'padel-equipment',
                'type' => 'product',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Apparel',
                'slug' => 'apparel',
                'type' => 'product',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'type' => 'product',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Menu Categories
            [
                'name' => 'Beverages',
                'slug' => 'beverages',
                'type' => 'menu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Main Course',
                'slug' => 'main-course',
                'type' => 'menu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Snacks',
                'slug' => 'snacks',
                'type' => 'menu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Desserts',
                'slug' => 'desserts',
                'type' => 'menu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('categories')->insert($categories);
    }
}
