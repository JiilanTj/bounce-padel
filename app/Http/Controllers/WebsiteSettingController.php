<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WebsiteSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class WebsiteSettingController extends Controller
{
    /**
     * Display website settings form.
     */
    public function edit(): Response
    {
        $settings = WebsiteSetting::first();

        return Inertia::render('WebsiteSettings/Edit', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update website settings.
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
            'home_image_header' => 'nullable|image|max:5120',
            'opening_hours' => 'nullable|string|max:255',
            'operating_days' => 'nullable|string|max:255',
            'holiday_notes' => 'nullable|string',
        ]);

        $settings = WebsiteSetting::first();

        // Handle home_image_header upload to R2
        if ($request->hasFile('home_image_header')) {
            $file = $request->file('home_image_header');
            $filename = 'home-header-' . time() . '.' . $file->getClientOriginalExtension();
            
            // Upload to R2
            $path = $file->storePubliclyAs('website-settings', $filename, 'r2');
            $data['home_image_header'] = Storage::disk('r2')->url($path);
            
            // Delete old image if exists
            if ($settings && $settings->home_image_header) {
                $oldPath = parse_url($settings->home_image_header, PHP_URL_PATH);
                if ($oldPath) {
                    Storage::disk('r2')->delete(ltrim($oldPath, '/'));
                }
            }
        } else {
            // Keep existing image if no new upload
            unset($data['home_image_header']);
        }

        if ($settings) {
            $settings->update($data);
        } else {
            WebsiteSetting::create($data);
        }

        return redirect()->route('website-settings.edit')->with('success', 'Website settings updated successfully.');
    }
}
