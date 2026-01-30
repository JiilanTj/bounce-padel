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
        $query = Court::query()->with('operatingHours');

        // Search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('surface', 'like', '%' . request('search') . '%');
        }

        // Status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Type filter
        if (request('type')) {
            $query->where('type', request('type'));
        }

        // Sorting
        $sortBy = request('sort_by', 'created_at');
        $sortOrder = request('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $courts = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => Court::count(),
            'active' => Court::where('status', 'active')->count(),
            'maintenance' => Court::where('status', 'maintenance')->count(),
            'closed' => Court::where('status', 'closed')->count(),
        ];

        return inertia('Courts/Index', [
            'courts' => $courts,
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
                'type' => request('type'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
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
