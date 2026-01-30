<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Booking;
use App\Models\OperatingHour;

class Court extends Model
{
    protected $fillable = [
        'name',
        'type', // indoor, outdoor
        'surface',
        'status', // active, maintenance, closed
        'price_per_hour',
        'image_path',
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
    ];

    public function operatingHours()
    {
        return $this->hasMany(OperatingHour::class);
    }
}
