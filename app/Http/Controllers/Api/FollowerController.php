<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowerController extends ApiController
{
    /**
     * Follow a user
     */
    public function follow(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Prevent self-following
        if ($currentUser->id === $user->id) {
            return $this->errorResponse('You cannot follow yourself', 400);
        }

        // Check if already following
        if ($currentUser->isFollowing($user)) {
            return $this->errorResponse('Already following this user', 400);
        }

        // Create follow relationship
        $currentUser->following()->attach($user->id);

        return $this->createdResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ],
            'is_following' => true,
        ], 'Successfully followed user');
    }

    /**
     * Unfollow a user
     */
    public function unfollow(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Check if following
        if (!$currentUser->isFollowing($user)) {
            return $this->errorResponse('Not following this user', 400);
        }

        // Remove follow relationship
        $currentUser->following()->detach($user->id);

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ],
            'is_following' => false,
        ], 'Successfully unfollowed user');
    }

    /**
     * Get user's followers
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 100);

        $followers = $user->followers()
            ->select('id', 'name', 'role')
            ->paginate($perPage);

        return $this->paginatedResponse($followers, 'Followers retrieved');
    }

    /**
     * Get users that a user is following
     */
    public function following(Request $request, User $user): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 100);

        $following = $user->following()
            ->select('id', 'name', 'role')
            ->paginate($perPage);

        return $this->paginatedResponse($following, 'Following retrieved');
    }

    /**
     * Get follower and following counts
     */
    public function counts(User $user): JsonResponse
    {
        return $this->successResponse([
            'user_id' => $user->id,
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
        ], 'Counts retrieved');
    }

    /**
     * Check follow status for authenticated user
     */
    public function checkFollowStatus(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if (!$currentUser) {
            return $this->successResponse(['is_following' => false], 'Follow status');
        }

        return $this->successResponse([
            'user_id' => $user->id,
            'is_following' => $currentUser->isFollowing($user),
            'is_followed_by' => $user->isFollowing($currentUser),
        ], 'Follow status');
    }
}
