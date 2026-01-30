<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourtRequest;
use App\Http\Requests\UpdateCourtRequest;
use App\Models\Court;
use Illuminate\Support\Facades\Storage;

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
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Using 'r2' disk configured in filesystems.php
            $path = $request->file('image')->store('courts', 'r2');
            // Store FULL URL as requested
            $data['image_path'] = Storage::disk('r2')->url($path);
        }

        $court = Court::create($data);

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
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($court->image_path) {
                // Parse path from URL if needed, or if it is already a path
                $oldPath = str_replace(env('R2_PUBLIC_URL') . '/', '', $court->image_path);
                // Also handle case where it might be a partial path from before migration
                // Usually Storage::delete handles missing files gracefully or we wrap in try-catch
                if (Storage::disk('r2')->exists($oldPath)) {
                     Storage::disk('r2')->delete($oldPath);
                }
            }
            $path = $request->file('image')->store('courts', 'r2');
            $data['image_path'] = Storage::disk('r2')->url($path);
        }

        $court->update($data);
        return redirect()->back()->with('success', 'Court updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Court $court)
    {
        if ($court->image_path) {
            $oldPath = str_replace(env('R2_PUBLIC_URL') . '/', '', $court->image_path);
            if (Storage::disk('r2')->exists($oldPath)) {
                Storage::disk('r2')->delete($oldPath);
            }
        }
        
        $court->delete();
        return redirect()->back()->with('success', 'Court deleted successfully.');
    }
}
