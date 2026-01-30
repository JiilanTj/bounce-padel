<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [];
        
        // Create 15 tables with varying capacities
        for ($i = 1; $i <= 15; $i++) {
            $capacity = match(true) {
                $i <= 8 => 2,  // Tables 1-8: 2 persons
                $i <= 12 => 4, // Tables 9-12: 4 persons
                default => 6,  // Tables 13-15: 6 persons
            };
            
            $tables[] = [
                'number' => 'T' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'capacity' => $capacity,
                'status' => 'available',
                'qr_code' => 'QR-TABLE-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('tables')->insert($tables);
    }
}
