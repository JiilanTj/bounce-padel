<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOperatingHoursRequest;
use App\Models\Court;
use App\Models\OperatingHour;
use Illuminate\Http\Request;

class OperatingHourController extends Controller
{
    /**
     * Update the operating hours for a specific court.
     */
    public function update(UpdateOperatingHoursRequest $request, Court $court)
    {
        foreach ($request->hours as $hourData) {
            // Find by day_of_week for this court, assuming 7 records exist
            $court->operatingHours()
                ->where('day_of_week', $hourData['day_of_week'])
                ->update([
                    'open_time' => $hourData['open_time'],
                    'close_time' => $hourData['close_time'],
                    'is_closed' => $hourData['is_closed'],
                ]);
        }

        return redirect()->back()->with('success', 'Operating hours updated successfully.');
    }
}
