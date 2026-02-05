<?php

namespace App\Http\Controllers;

use App\Models\WebsiteSetting;

class PublicContactController extends Controller
{
    /**
     * Display contact page for public
     */
    public function index()
    {
        $settings = WebsiteSetting::first();

        return inertia('Public/Contact', [
            'settings' => $settings,
        ]);
    }
}