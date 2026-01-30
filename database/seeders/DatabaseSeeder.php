<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'owner@bounce.com'],
            [
                'name' => 'Owner Bounce',
                'role' => 'owner',
                'password' => bcrypt('password'),
            ]
        );

        // Seed categories, tables, menus, and menu items
        $this->call([
            CategorySeeder::class,
            TableSeeder::class,
            MenuSeeder::class,
            MenuItemSeeder::class,
        ]);
    }
}
