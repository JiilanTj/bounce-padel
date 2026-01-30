<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can view the user.
     */
    public function view(User $user, User $model): bool
    {
        return in_array($user->role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can create users.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can update the user.
     */
    public function update(User $user, User $model): bool
    {
        // Owner can update anyone except themselves (to prevent accidental lockout)
        // Admin can update anyone except Owner role and themselves
        if ($user->role === 'owner') {
            return $user->id !== $model->id; // Owner can't update themselves
        }

        if ($user->role === 'admin') {
            return $model->role !== 'owner' && $user->id !== $model->id;
        }

        return false;
    }

    /**
     * Determine if the user can delete the user.
     */
    public function delete(User $user, User $model): bool
    {
        // Prevent deleting yourself
        if ($user->id === $model->id) {
            return false;
        }

        // Owner can delete anyone except other Owners
        if ($user->role === 'owner') {
            return $model->role !== 'owner';
        }

        // Admin can delete anyone except Owner role
        if ($user->role === 'admin') {
            return $model->role !== 'owner';
        }

        return false;
    }

    /**
     * Determine if the user can restore the user.
     */
    public function restore(User $user, User $model): bool
    {
        return in_array($user->role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can permanently delete the user.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // Same rules as delete
        return $this->delete($user, $model);
    }

    /**
     * Determine if the user can assign a specific role.
     */
    public function assignRole(User $user, string $role): bool
    {
        // Owner cannot create other Owners
        if ($user->role === 'owner' && $role === 'owner') {
            return false;
        }

        // Admin cannot create Owner
        if ($user->role === 'admin' && $role === 'owner') {
            return false;
        }

        // Both Owner and Admin can assign: admin, pelayan, kasir, user
        return in_array($role, ['admin', 'pelayan', 'kasir', 'user']);
    }
}
