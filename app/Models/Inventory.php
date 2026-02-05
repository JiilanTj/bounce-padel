<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'name',
        'image_path',
        'price',
        'quantity',
        'owner_name',
        'status',
        'sku',
        'description',
        'location',
        'category',
        'purchase_date',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'purchase_date' => 'date',
    ];
}
