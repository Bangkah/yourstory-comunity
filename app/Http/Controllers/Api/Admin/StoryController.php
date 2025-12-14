<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends ApiController
{
    /**
     * List all stories with moderation capabilities
     */
    public function index(Request $request): JsonResponse
    {
        // Check moderator or admin permission
        if (!in_array($request->user()->role, ['admin', 'moderator'])) {
            return $this->forbiddenResponse('Unauthorized');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $query = Story::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        // Filter by author
        if ($request->filled('author_id')) {
            $query->where('user_id', $request->integer('author_id'));
        }

        // Filter by publication status
        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        // Sort
        $sort = $request->string('sort', 'latest');
        match ($sort) {
            'latest' => $query->latest('created_at'),
            'oldest' => $query->oldest('created_at'),
            'most_liked' => $query->orderBy('likes_count', 'desc'),
            'most_commented' => $query->orderBy('comments_count', 'desc'),
            default => $query->latest('created_at'),
        };

        $stories = $query->with('user:id,name,role')
            ->withCount(['likes', 'allComments'])
            ->paginate($perPage);

        return $this->paginatedResponse($stories, 'Stories retrieved');
    }

    /**
     * Get story details for moderation
     */
    public function show(Request $request, Story $story): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'moderator'])) {
            return $this->forbiddenResponse('Unauthorized');
        }

        $story->load([
            'user:id,name,role,email',
            'likes' => fn($q) => $q->with('user:id,name'),
            'allComments' => fn($q) => $q->with('user:id,name'),
        ])->loadCount(['likes', 'allComments']);

        return $this->successResponse($story, 'Story retrieved');
    }

    /**
     * Update story publication status
     */
    public function updateStatus(Request $request, Story $story): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'moderator'])) {
            return $this->forbiddenResponse('Unauthorized');
        }

        $validated = $request->validate([
            'is_published' => 'required|boolean',
        ]);

        $oldStatus = $story->is_published;
        $story->update($validated);

        return $this->successResponse([
            'story_id' => $story->id,
            'old_status' => $oldStatus,
            'new_status' => $story->is_published,
        ], 'Story status updated');
    }

    /**
     * Delete story by admin/moderator
     */
    public function destroy(Request $request, Story $story): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'moderator'])) {
            return $this->forbiddenResponse('Unauthorized');
        }

        $storyTitle = $story->title;
        $story->delete();

        return $this->successResponse([
            'deleted_story_id' => $story->id,
        ], "Story '{$storyTitle}' has been deleted");
    }
}
