<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Table;
use App\Models\OrderItem;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'table_id',
        'status',
        'total_amount',
        'type',
        'return_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
