<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\WebsiteSetting;
use Illuminate\Http\Request;

class PublicFacilityController extends Controller
{
    /**
     * Display a listing of active facilities for public
     */
    public function index(Request $request)
    {
        $query = Facility::query()->where('status', 'active');

        // Only show active facilities to public
        $facilities = $query->ordered()->get();
        $settings = WebsiteSetting::first();

        return inertia('Public/Facilities', [
            'facilities' => $facilities,
            'settings' => $settings,
        ]);
    }
}
