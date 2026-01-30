<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperatingHour extends Model
{
    protected $fillable = [
        'court_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];

    public function court()
    {
        return $this->belongsTo(Court::class);
    }
}
