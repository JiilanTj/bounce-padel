<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFacilityRequest;
use App\Http\Requests\UpdateFacilityRequest;
use App\Models\Facility;
use Illuminate\Support\Facades\Storage;

class FacilityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Facility::query();

        // Search
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('description', 'like', '%' . request('search') . '%');
        }

        // Status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Sorting
        $sortBy = request('sort_by', 'sort_order');
        $sortOrder = request('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $facilities = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => Facility::count(),
            'active' => Facility::where('status', 'active')->count(),
            'inactive' => Facility::where('status', 'inactive')->count(),
        ];

        return inertia('Facilities/Index', [
            'facilities' => $facilities,
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFacilityRequest $request)
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('facilities', 'r2');
            $data['image_path'] = Storage::disk('r2')->url($path);
        }

        // Auto-assign sort_order if not provided
        if (!isset($data['sort_order']) || $data['sort_order'] === '') {
            $data['sort_order'] = Facility::max('sort_order') + 1;
        }

        Facility::create($data);

        return redirect()->back()->with('success', 'Facility created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Facility $facility)
    {
        return inertia('Facilities/Show', [
            'facility' => $facility,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Facility $facility)
    {
        // Not needed - edit is handled via modal in index page
        return redirect()->route('facilities.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFacilityRequest $request, Facility $facility)
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($facility->image_path) {
                $oldPath = str_replace(env('R2_PUBLIC_URL') . '/', '', $facility->image_path);
                if (Storage::disk('r2')->exists($oldPath)) {
                    Storage::disk('r2')->delete($oldPath);
                }
            }
            $path = $request->file('image')->store('facilities', 'r2');
            $data['image_path'] = Storage::disk('r2')->url($path);
        }

        // Handle sort_order - if empty, keep existing value
        if (!isset($data['sort_order']) || $data['sort_order'] === '') {
            unset($data['sort_order']);
        }

        $facility->update($data);

        return redirect()->back()->with('success', 'Facility updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Facility $facility)
    {
        // Delete image from R2
        if ($facility->image_path) {
            $oldPath = str_replace(env('R2_PUBLIC_URL') . '/', '', $facility->image_path);
            if (Storage::disk('r2')->exists($oldPath)) {
                Storage::disk('r2')->delete($oldPath);
            }
        }

        $facility->delete();

        return redirect()->back()->with('success', 'Facility deleted successfully.');
    }
}
