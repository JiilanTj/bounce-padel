<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortColumns = ['name', 'email', 'role', 'created_at', 'updated_at'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'created_at';
        }

        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->get('per_page', 10), 100); // Max 100 per page
        $users = $query->paginate($perPage)->withQueryString();

        // Calculate statistics
        $stats = [
            'total' => User::count(),
            'by_role' => [
                'owner' => User::where('role', 'owner')->count(),
                'admin' => User::where('role', 'admin')->count(),
                'kasir' => User::where('role', 'kasir')->count(),
                'pelayan' => User::where('role', 'pelayan')->count(),
                'user' => User::where('role', 'user')->count(),
            ],
            'recent' => User::where('created_at', '>=', now()->subDays(30))->count(),
            'active_today' => User::whereDate('updated_at', today())->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'availableRoles' => $this->getAvailableRoles($request->user()),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Users/Create', [
            'availableRoles' => $this->getAvailableRoles($request->user()),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()
            ->route('users.index')
            ->with('success', "User {$user->name} berhasil dibuat.");
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        // Load related data if needed (bookings, orders, etc.)
        $user->loadCount([
            // Add relationships count here when models are created
            // 'bookings',
            // 'orders',
        ]);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'availableRoles' => $this->getAvailableRoles($request->user()),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        // Update user data
        $user->name = $validated['name'] ?? $user->name;
        $user->email = $validated['email'] ?? $user->email;
        
        // Update password only if provided
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // Update role only if provided and different
        if (isset($validated['role']) && $validated['role'] !== $user->role) {
            $user->role = $validated['role'];
        }

        $user->save();

        return redirect()
            ->route('users.index')
            ->with('success', "User {$user->name} berhasil diupdate.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $userName = $user->name;
        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', "User {$userName} berhasil dihapus.");
    }

    /**
     * Get available roles that the current user can assign.
     */
    protected function getAvailableRoles(User $currentUser): array
    {
        $allRoles = [
            'user' => 'User',
            'kasir' => 'Kasir',
            'pelayan' => 'Pelayan',
            'admin' => 'Admin',
            'owner' => 'Owner',
        ];

        // Owner can assign: admin, pelayan, kasir, user (not owner)
        if ($currentUser->role === 'owner') {
            unset($allRoles['owner']);
        }

        // Admin can assign: admin, pelayan, kasir, user (not owner)
        if ($currentUser->role === 'admin') {
            unset($allRoles['owner']);
        }

        return $allRoles;
    }

}
