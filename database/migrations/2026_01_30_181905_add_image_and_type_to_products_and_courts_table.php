<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courts', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('price_per_hour');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('stock_rent');
            $table->enum('type', ['sale', 'rent'])->default('sale')->after('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courts', function (Blueprint $table) {
            $table->dropColumn('image_path');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'type']);
        });
    }
};
