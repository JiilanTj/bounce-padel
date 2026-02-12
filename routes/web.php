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
use App\Http\Controllers\PublicFacilityController;
use App\Http\Controllers\PublicProductController;
use App\Http\Controllers\PublicContactController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProductSaleController;
use App\Http\Controllers\EquipmentRentalController;
use App\Http\Controllers\PublicMenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\OrderNotificationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\IngredientStockController;
use App\Http\Controllers\MenuItemRecipeController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'settings' => \App\Models\WebsiteSetting::first(),
        'facilities' => \App\Models\Facility::active()->orderBy('sort_order')->get(),
        'products' => \App\Models\Product::where(function($q) {
            $q->where('stock_buy', '>', 0)->orWhere('stock_rent', '>', 0);
        })->with('category')->take(4)->get(),
    ]);
});

// Public routes (no auth required)
Route::get('/lapangan', [PublicCourtController::class, 'index'])->name('public.courts.index');
Route::get('/lapangan/{court}', [PublicCourtController::class, 'show'])->name('public.courts.show');
Route::get('/fasilitas', [PublicFacilityController::class, 'index'])->name('public.facilities');
Route::get('/cafe-resto', [PublicMenuController::class, 'index'])->name('public.cafe-resto');
Route::post('/validate-table-qr', [TableController::class, 'validateQrCode'])->name('validate.table.qr');
Route::post('/cafe-orders', [OrderController::class, 'store'])->name('cafe-orders.store');
Route::get('/rental-alat', [PublicProductController::class, 'rental'])->name('public.rental');
Route::get('/padel-store', [PublicProductController::class, 'store'])->name('public.store');
Route::get('/kontak', [PublicContactController::class, 'index'])->name('public.contact');

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notifications Routes (KASIR ONLY)
    Route::middleware('role:kasir')->prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/count', [NotificationController::class, 'count'])->name('notifications.count');
        Route::patch('{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        Route::delete('/read', [NotificationController::class, 'deleteRead'])->name('notifications.delete-read');
    });

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
        Route::get('tables/{table}/print-qr', [TableController::class, 'printQr'])->name('tables.print-qr');
        Route::resource('menus', MenuController::class)->only(['index', 'show']);
        Route::resource('menu-items', MenuItemController::class)->only(['index', 'show']);
        Route::resource('inventories', InventoryController::class)->only(['index', 'show']);
        Route::resource('facilities', FacilityController::class)->only(['index', 'show']);

        // F&B Inventory Routes - Read Only
        Route::resource('ingredients', IngredientController::class)->only(['index', 'show']);
        Route::get('ingredients/low-stock', [IngredientController::class, 'getLowStock'])->name('ingredients.low-stock');
        Route::get('ingredients/stats', [IngredientController::class, 'getStats'])->name('ingredients.stats');
        Route::get('stock-movements', [IngredientStockController::class, 'movements'])->name('stock-movements.index');
        Route::get('stock-movements/stats', [IngredientStockController::class, 'getStats'])->name('stock-movements.stats');
        Route::get('ingredients/{ingredient}/stock-history', [IngredientStockController::class, 'getHistory'])->name('ingredients.stock-history');

        // Recipe Management - Read Only
        Route::get('menu-items/{menu_item}/recipe', [MenuItemRecipeController::class, 'index'])->name('menu-items.recipe.index');
        Route::get('menu-items/{menu_item}/recipe/cost', [MenuItemRecipeController::class, 'calculateCost'])->name('menu-items.recipe.cost');
        Route::get('menu-items/{menu_item}/recipe/check-stock', [MenuItemRecipeController::class, 'checkStockAvailability'])->name('menu-items.recipe.check-stock');
        Route::get('recipe/available-ingredients', [MenuItemRecipeController::class, 'getAvailableIngredients'])->name('recipe.available-ingredients');
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
        Route::resource('facilities', FacilityController::class)->except(['index', 'show']);

        // F&B Inventory Routes - Write Access
        Route::resource('ingredients', IngredientController::class)->except(['index', 'show']);

        // Stock Management Routes
        Route::post('ingredients/{ingredient}/stock/add', [IngredientStockController::class, 'addStock'])->name('ingredients.stock.add');
        Route::post('ingredients/{ingredient}/stock/deduct', [IngredientStockController::class, 'deductStock'])->name('ingredients.stock.deduct');
        Route::post('ingredients/{ingredient}/stock/adjust', [IngredientStockController::class, 'adjustStock'])->name('ingredients.stock.adjust');

        // Recipe Management Routes - Write Access
        Route::post('menu-items/{menu_item}/recipe', [MenuItemRecipeController::class, 'store'])->name('menu-items.recipe.store');
        Route::post('menu-items/{menu_item}/recipe/add', [MenuItemRecipeController::class, 'addIngredient'])->name('menu-items.recipe.add');
        Route::patch('menu-items/{menu_item}/recipe/{ingredient}', [MenuItemRecipeController::class, 'updateIngredient'])->name('menu-items.recipe.update');
        Route::delete('menu-items/{menu_item}/recipe/{ingredient}', [MenuItemRecipeController::class, 'removeIngredient'])->name('menu-items.recipe.remove');
    });
    // Owner Only Routes
    Route::middleware('role:owner')->group(function () {
        Route::get('/website-settings', [\App\Http\Controllers\WebsiteSettingController::class, 'edit'])->name('website-settings.edit');
        Route::put('/website-settings', [\App\Http\Controllers\WebsiteSettingController::class, 'update'])->name('website-settings.update');
    });

    // Booking Routes (Kasir & Owner)
    Route::middleware('role:kasir,owner')->group(function () {
        Route::get('/bookings/history', [BookingController::class, 'history'])->name('bookings.history');
        Route::resource('bookings', BookingController::class);
        Route::get('/api/bookings/available-slots', [BookingController::class, 'getAvailableSlots'])->name('bookings.available-slots');
        
        // Product Sales Routes
        Route::resource('product-sales', ProductSaleController::class)->except(['edit', 'update']);
        
        // Equipment Rental Routes
        Route::resource('equipment-rentals', EquipmentRentalController::class)->except(['edit']);
        
        // Cafe Orders Routes
        Route::resource('orders', OrderController::class)->only(['index', 'show']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::get('orders/stats/polling', [OrderController::class, 'stats'])->name('orders.stats');

        // SSE Order Notifications (Real-time)
        Route::get('orders/notifications/stream', [OrderNotificationController::class, 'stream'])->name('orders.notifications.stream');

        // POS Routes
        Route::get('pos', [POSController::class, 'index'])->name('pos.index');
        Route::post('pos', [POSController::class, 'store'])->name('pos.store');
    });
});

require __DIR__.'/auth.php';
