<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTableRequest;
use App\Http\Requests\UpdateTableRequest;
use App\Models\Table;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Table::query();

        // Search
        if (request('search')) {
            $query->where('number', 'like', '%' . request('search') . '%')
                  ->orWhere('qr_code', 'like', '%' . request('search') . '%');
        }

        // Status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Sorting
        $sortBy = request('sort_by', 'number');
        $sortOrder = request('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $tables = $query->paginate(10)->withQueryString();

        // Stats
        $stats = [
            'total' => Table::count(),
            'available' => Table::where('status', 'available')->count(),
            'occupied' => Table::where('status', 'occupied')->count(),
            'reserved' => Table::where('status', 'reserved')->count(),
        ];

        return inertia('Tables/Index', [
            'tables' => $tables,
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
    public function store(StoreTableRequest $request)
    {
        $data = $request->validated();
        // Stub for QR Code generation. In real app, this might be a URL string.
        $data['qr_code'] = 'table-' . \Illuminate\Support\Str::random(10); 

        Table::create($data);

        return redirect()->back()->with('success', 'Table created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Table $table)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Table $table)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTableRequest $request, Table $table)
    {
        $table->update($request->validated());
        return redirect()->back()->with('success', 'Table updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Table $table)
    {
        $table->delete();
        return redirect()->back()->with('success', 'Table deleted successfully.');
    }

    /**
     * Validate table QR code
     */
    public function validateQrCode()
    {
        request()->validate([
            'qr_code' => 'required|string',
        ]);

        $table = Table::where('qr_code', request('qr_code'))->first();

        if (!$table) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode QR tidak valid atau meja tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'table' => [
                'id' => $table->id,
                'number' => $table->number,
                'qr_code' => $table->qr_code,
            ],
        ]);
    }
}
