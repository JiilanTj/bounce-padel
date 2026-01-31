<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteSetting extends Model
{
    protected $fillable = [
        'phone_number',
        'email',
        'location',
        'location_link',
        'facebook_link',
        'instagram_link',
        'twitter_link',
    ];
}
