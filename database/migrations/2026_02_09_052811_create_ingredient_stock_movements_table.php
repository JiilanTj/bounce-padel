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
        // Check if table doesn't exist before creating
        if (!Schema::hasTable('ingredient_stock_movements')) {
            Schema::create('ingredient_stock_movements', function (Blueprint $table) {
                $table->id();

                $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');

                // Movement Info
                $table->enum('type', ['in', 'out'])->default('in');
                $table->enum('reason', ['purchase', 'sale', 'return', 'damage', 'expired', 'adjustment', 'opening_balance'])->default('purchase');

                // Quantity
                $table->decimal('quantity', 10, 3)->default(0); // + for in, - for out
                $table->decimal('before_stock', 10, 3)->default(0);
                $table->decimal('after_stock', 10, 3)->default(0);

                // Reference
                $table->string('reference_type')->nullable(); // 'order', 'purchase', 'manual_adjustment'
                $table->unsignedBigInteger('reference_id')->nullable();

                // Additional Info
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained()->nullOnDelete();

                $table->timestamps();

                // Indexes
                $table->index('ingredient_id');
                $table->index('type');
                $table->index('reason');
                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredient_stock_movements');
    }
};
