<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\MenuItem;

class Menu extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    public function items()
    {
        return $this->hasMany(MenuItem::class);
    }
}
