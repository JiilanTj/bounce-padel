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
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();

            // Basic Info
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();

            // Unit & Measurement
            $table->enum('unit', ['kg', 'gram', 'liter', 'ml', 'pcs', 'butir', 'lusin', 'ikat', 'pack', 'botol'])->default('pcs');
            $table->enum('unit_type', ['weight', 'volume', 'quantity'])->default('quantity');

            // Stock
            $table->decimal('current_stock', 10, 3)->default(0);
            $table->decimal('min_stock', 10, 3)->default(0);
            $table->decimal('max_stock', 10, 3)->nullable();

            // Pricing
            $table->decimal('unit_price', 12, 2)->default(0);

            // Supplier Info
            $table->string('supplier_name')->nullable();
            $table->string('supplier_contact')->nullable();

            // Expiry & Storage
            $table->integer('expiry_days')->nullable();
            $table->enum('storage_location', ['dry', 'chiller', 'freezer', 'shelf'])->default('dry');

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('name');
            $table->index('category_id');
            $table->index('unit');
            $table->index('storage_location');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
