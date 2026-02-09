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
        Schema::create('menu_item_ingredients', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('menu_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');

            // Recipe Data
            $table->decimal('quantity', 10, 3)->nullable(); // Amount needed
            $table->string('unit')->nullable(); // Optional unit override

            $table->timestamps();

            // Unique Constraint (one ingredient only once per menu item)
            $table->unique(['menu_item_id', 'ingredient_id']);

            // Indexes
            $table->index('menu_item_id');
            $table->index('ingredient_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_item_ingredients');
    }
};
