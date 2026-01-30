<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Booking;
use App\Models\OperatingHour;

class Court extends Model
{
    protected $fillable = [
        'name',
        'type',
        'surface',
        'status',
        'price_per_hour',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function operatingHours()
    {
        return $this->hasMany(OperatingHour::class);
    }
}
