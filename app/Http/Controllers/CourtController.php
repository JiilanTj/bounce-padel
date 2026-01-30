<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourtRequest;
use App\Http\Requests\UpdateCourtRequest;
use App\Models\Court;

class CourtController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $courts = Court::with('operatingHours')->latest()->paginate(10);
        return inertia('Courts/Index', [
            'courts' => $courts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourtRequest $request)
    {
        $court = Court::create($request->validated());

        // Initialize default operating hours (Monday to Sunday)
        $operatingHours = [];
        for ($i = 0; $i < 7; $i++) {
            $operatingHours[] = [
                'day_of_week' => $i,
                'open_time' => '08:00',
                'close_time' => '22:00',
                'is_closed' => false,
            ];
        }
        $court->operatingHours()->createMany($operatingHours);

        return redirect()->back()->with('success', 'Court created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Court $court)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Court $court)
    {
        // Typically handled via modal in Index, but if separate page:
        // return inertia('Courts/Edit', ['court' => $court]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourtRequest $request, Court $court)
    {
        $court->update($request->validated());
        return redirect()->back()->with('success', 'Court updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Court $court)
    {
        $court->delete();
        return redirect()->back()->with('success', 'Court deleted successfully.');
    }
}
