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
        $tables = Table::latest()->paginate(10);
        return inertia('Tables/Index', [
            'tables' => $tables
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
}
