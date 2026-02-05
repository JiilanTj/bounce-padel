<?php

namespace App\Http\Controllers;

use App\Models\Court;
use App\Models\WebsiteSetting;
use Illuminate\Http\Request;

class PublicCourtController extends Controller
{
    /**
     * Display a listing of active courts for public
     */
    public function index(Request $request)
    {
        $query = Court::query()->where('status', 'active');

        // Search
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('surface', 'like', '%' . $request->search . '%');
        }

        // Type filter
        if ($request->type) {
            $query->where('type', $request->type);
        }

        $courts = $query->orderBy('name', 'asc')->get();
        $settings = WebsiteSetting::first();

        return inertia('Public/Courts', [
            'courts' => $courts,
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
            ],
            'settings' => $settings,
        ]);
    }

    /**
     * Display the specified court
     */
    public function show(Court $court)
    {
        // Load operating hours
        $court->load('operatingHours');
        $settings = WebsiteSetting::first();

        return inertia('Public/CourtDetail', [
            'court' => $court,
            'settings' => $settings,
        ]);
    }
}
