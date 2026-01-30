<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_id',
        'name',
        'description',
        'price',
        'image_url',
        'is_available',
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function orderItems()
    {
        return $this->morphMany(OrderItem::class, 'item');
    }
}
