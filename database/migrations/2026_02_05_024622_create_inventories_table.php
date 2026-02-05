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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama Barang
            $table->string('image_path')->nullable(); // Foto Barang
            $table->decimal('price', 12, 2)->default(0); // Harga Barang
            $table->integer('quantity')->default(0); // Jumlah
            $table->string('owner_name'); // Nama Owner Barang
            $table->enum('status', ['functional', 'damaged', 'lost', 'maintenance', 'retired'])->default('functional'); // Status Barang
            
            // Additional useful fields
            $table->string('sku')->nullable()->unique(); // SKU/Kode Barang
            $table->text('description')->nullable(); // Deskripsi Barang
            $table->string('location')->nullable(); // Lokasi penyimpanan
            $table->string('category')->nullable(); // Kategori (raket, bola, net, dll)
            $table->date('purchase_date')->nullable(); // Tanggal pembelian
            $table->text('notes')->nullable(); // Catatan tambahan
            
            $table->timestamps(); // created_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
