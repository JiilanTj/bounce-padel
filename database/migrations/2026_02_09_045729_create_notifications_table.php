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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // order_created, order_updated, etc.
            $table->string('title');
            $table->text('message')->nullable();
            $table->json('data')->nullable(); // Store additional data (order_id, customer_name, etc.)
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index(['user_id', 'read_at']);
            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
