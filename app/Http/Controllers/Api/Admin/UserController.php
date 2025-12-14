<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends ApiController
{
    /**
     * List all users with filtering and searching
     */
    public function index(Request $request): JsonResponse
    {
        // Check admin permission
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return $this->forbiddenResponse('Unauthorized');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $query = User::query();

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        // Sort options
        $sort = $request->string('sort', 'latest');
        match ($sort) {
            'latest' => $query->latest('created_at'),
            'oldest' => $query->oldest('created_at'),
            'name' => $query->orderBy('name'),
            default => $query->latest('created_at'),
        };

        $users = $query->select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
            ->paginate($perPage);

        return $this->paginatedResponse($users, 'Users retrieved');
    }

    /**
     * Get a specific user
     */
    public function show(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return $this->forbiddenResponse('Unauthorized');
        }

        $user->load(['stories', 'comments']);
        $user->append(['followers_count', 'following_count']);

        return $this->successResponse($user, 'User retrieved');
    }

    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return $this->forbiddenResponse('Unauthorized');
        }

        // Prevent admin from changing their own role
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('Cannot change your own role', 400);
        }

        $validated = $request->validate([
            'role' => ['required', 'in:' . implode(',', [User::ROLE_ADMIN, User::ROLE_MODERATOR, User::ROLE_MEMBER])],
        ]);

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        return $this->successResponse([
            'user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $user->role,
        ], 'User role updated successfully');
    }

    /**
     * Suspend/unsuspend user
     */
    public function toggleSuspend(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return $this->forbiddenResponse('Unauthorized');
        }

        // Prevent admin from suspending themselves
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('Cannot suspend your own account', 400);
        }

        $user->update(['is_suspended' => !$user->is_suspended]);

        return $this->successResponse([
            'user_id' => $user->id,
            'is_suspended' => $user->is_suspended,
        ], $user->is_suspended ? 'User suspended' : 'User unsuspended');
    }

    /**
     * Delete user
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return $this->forbiddenResponse('Unauthorized');
        }

        // Prevent admin from deleting themselves
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('Cannot delete your own account', 400);
        }

        $userName = $user->name;
        $user->delete();

        return $this->successResponse([
            'deleted_user_id' => $user->id,
        ], "User '{$userName}' has been deleted");
    }
}
