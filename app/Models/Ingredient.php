<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'sku',
        'description',
        'unit',
        'unit_type',
        'current_stock',
        'min_stock',
        'max_stock',
        'unit_price',
        'supplier_name',
        'supplier_contact',
        'expiry_days',
        'storage_location',
        'is_active',
    ];

    protected $casts = [
        'current_stock' => 'decimal:3',
        'min_stock' => 'decimal:3',
        'max_stock' => 'decimal:3',
        'unit_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'is_low_stock',
    ];

    /**
     * Get the category that owns the ingredient.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all menu items that use this ingredient.
     */
    public function menuItemIngredients(): HasMany
    {
        return $this->hasMany(MenuItemIngredient::class);
    }

    /**
     * Get all stock movements for this ingredient.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(IngredientStockMovement::class);
    }

    /**
     * Check if stock is below minimum.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->current_stock <= $this->min_stock;
    }

    /**
     * Scope to get only active ingredients.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only low stock ingredients.
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'min_stock');
    }

    /**
     * Scope to filter by storage location.
     */
    public function scopeInStorage($query, $location)
    {
        return $query->where('storage_location', $location);
    }

    /**
     * Add stock to this ingredient.
     */
    public function addStock(float $quantity, string $reason, array $options = []): IngredientStockMovement
    {
        return \DB::transaction(function () use ($quantity, $reason, $options) {
            $beforeStock = $this->current_stock;
            $afterStock = $beforeStock + $quantity;

            $this->update(['current_stock' => $afterStock]);

            return $this->stockMovements()->create([
                'type' => 'in',
                'reason' => $reason,
                'quantity' => $quantity,
                'before_stock' => $beforeStock,
                'after_stock' => $afterStock,
                'reference_type' => $options['reference_type'] ?? null,
                'reference_id' => $options['reference_id'] ?? null,
                'notes' => $options['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);
        });
    }

    /**
     * Deduct stock from this ingredient.
     */
    public function deductStock(float $quantity, string $reason, array $options = []): IngredientStockMovement
    {
        return \DB::transaction(function () use ($quantity, $reason, $options) {
            $beforeStock = $this->current_stock;
            $afterStock = $beforeStock - $quantity;

            if ($afterStock < 0) {
                throw new \Exception("Insufficient stock. Available: {$beforeStock}, Required: {$quantity}");
            }

            $this->update(['current_stock' => $afterStock]);

            return $this->stockMovements()->create([
                'type' => 'out',
                'reason' => $reason,
                'quantity' => -$quantity,
                'before_stock' => $beforeStock,
                'after_stock' => $afterStock,
                'reference_type' => $options['reference_type'] ?? null,
                'reference_id' => $options['reference_id'] ?? null,
                'notes' => $options['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);
        });
    }

    /**
     * Get current stock formatted with unit.
     */
    public function getFormattedStockAttribute(): string
    {
        return number_format($this->current_stock, 3) . ' ' . $this->unit;
    }

    /**
     * Check if ingredient is running low (below 20% of min stock).
     */
    public function isRunningLow(): bool
    {
        if ($this->min_stock == 0) {
            return $this->current_stock == 0;
        }

        $percentage = ($this->current_stock / $this->min_stock) * 100;
        return $percentage <= 20;
    }
}
