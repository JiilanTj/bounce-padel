<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IngredientStockMovement extends Model
{
    protected $fillable = [
        'ingredient_id',
        'type',
        'reason',
        'quantity',
        'before_stock',
        'after_stock',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'before_stock' => 'decimal:3',
        'after_stock' => 'decimal:3',
    ];

    /**
     * Get the ingredient for this movement.
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * Get the user who created this movement.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get only incoming movements.
     */
    public function scopeIncoming($query)
    {
        return $query->where('type', 'in');
    }

    /**
     * Scope to get only outgoing movements.
     */
    public function scopeOutgoing($query)
    {
        return $query->where('type', 'out');
    }

    /**
     * Scope to filter by reason.
     */
    public function scopeByReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    /**
     * Scope to filter by reference.
     */
    public function scopeForReference($query, $type, $id)
    {
        return $query->where('reference_type', $type)
                    ->where('reference_id', $id);
    }

    /**
     * Get absolute quantity value.
     */
    public function getAbsoluteQuantityAttribute(): float
    {
        return abs($this->quantity);
    }

    /**
     * Check if this is an incoming movement.
     */
    public function isIncoming(): bool
    {
        return $this->type === 'in';
    }

    /**
     * Check if this is an outgoing movement.
     */
    public function isOutgoing(): bool
    {
        return $this->type === 'out';
    }
}
