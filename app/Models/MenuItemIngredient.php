<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItemIngredient extends Model
{
    protected $fillable = [
        'menu_item_id',
        'ingredient_id',
        'quantity',
        'unit',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    /**
     * Get the menu item that owns this recipe item.
     */
    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    /**
     * Get the ingredient for this recipe item.
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * Get the cost for this recipe item (quantity * unit_price).
     */
    public function getCostAttribute(): float
    {
        if (!$this->ingredient) {
            return 0;
        }

        return $this->quantity * $this->ingredient->unit_price;
    }
}
