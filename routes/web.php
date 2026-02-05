<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CourtController;
use App\Http\Controllers\OperatingHourController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PublicCourtController;
use App\Http\Controllers\PublicProductController;
use App\Http\Controllers\PublicContactController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'settings' => \App\Models\WebsiteSetting::first(),
    ]);
});

// Public routes (no auth required)
Route::get('/lapangan', [PublicCourtController::class, 'index'])->name('public.courts.index');
Route::get('/lapangan/{court}', [PublicCourtController::class, 'show'])->name('public.courts.show');
Route::get('/rental-alat', [PublicProductController::class, 'rental'])->name('public.rental');
Route::get('/padel-store', [PublicProductController::class, 'store'])->name('public.store');
Route::get('/kontak', [PublicContactController::class, 'index'])->name('public.contact');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User Management Routes (Owner & Admin only)
    Route::middleware('role:owner,admin')->group(function () {
        Route::resource('users', \App\Http\Controllers\UserController::class);
    });

    // Master Data - Read Only (All internal users: Owner, Admin, Kasir, Pelayan)
    // Assuming 'auth' is sufficient for now, or we can restrict to specific roles.
    // For now, we allow any logged in user to VIEW master data to facilitate operations.
    Route::middleware('auth')->group(function () {
        Route::resource('courts', CourtController::class)->only(['index', 'show']);
        Route::resource('categories', CategoryController::class)->only(['index', 'show']);
        Route::resource('products', ProductController::class)->only(['index', 'show']);
        Route::resource('tables', TableController::class)->only(['index', 'show']);
        Route::resource('menus', MenuController::class)->only(['index', 'show']);
        Route::resource('menu-items', MenuItemController::class)->only(['index', 'show']);
        Route::resource('inventories', InventoryController::class)->only(['index', 'show']);
    });

    // Master Data - Write Access (Owner & Admin only)
    Route::middleware('role:owner,admin')->group(function () {
        Route::resource('courts', CourtController::class)->except(['index', 'show']);
        Route::put('operating-hours/{court}', [OperatingHourController::class, 'update'])->name('operating-hours.update');
        
        Route::resource('categories', CategoryController::class)->except(['index', 'show']);
        Route::resource('products', ProductController::class)->except(['index', 'show']);
        
        Route::resource('tables', TableController::class)->except(['index', 'show']);
        Route::resource('menus', MenuController::class)->except(['index', 'show']);
        
        Route::resource('inventories', InventoryController::class)->except(['index', 'show']);
        Route::resource('menu-items', MenuItemController::class)->except(['index', 'show']);
    });
    // Owner Only Routes
    Route::middleware('role:owner')->group(function () {
        Route::get('/website-settings', [\App\Http\Controllers\WebsiteSettingController::class, 'edit'])->name('website-settings.edit');
        Route::put('/website-settings', [\App\Http\Controllers\WebsiteSettingController::class, 'update'])->name('website-settings.update');
    });
});

require __DIR__.'/auth.php';
