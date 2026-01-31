<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\WebsiteSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSettingController extends Controller
{
    /**
     * Display the website settings form.
     */
    public function edit(): Response
    {
        $settings = WebsiteSetting::first();

        return Inertia::render('WebsiteSettings/Edit', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the website settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:255',
            'location_link' => 'nullable|string',
            'facebook_link' => 'nullable|url|max:255',
            'instagram_link' => 'nullable|url|max:255',
            'twitter_link' => 'nullable|url|max:255',
        ]);

        $settings = WebsiteSetting::first();

        if ($settings) {
            $settings->update($data);
        } else {
            WebsiteSetting::create($data);
        }

        return redirect()->route('website-settings.edit')->with('success', 'Website settings updated successfully.');
    }
}
