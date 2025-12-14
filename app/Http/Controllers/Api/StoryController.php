<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\StoreStoryRequest;
use App\Http\Requests\UpdateStoryRequest;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 100);

        $query = Story::query()
            ->with(['user:id,name,role'])
            ->withCount(['likes', 'allComments as comments_total']);

        // Search by title or body
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        // Filter by author
        if ($request->filled('author')) {
            $author = $request->string('author');
            $query->whereHas('user', function ($q) use ($author) {
                $q->where('name', 'like', "%{$author}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $role = $request->string('role');
            $query->whereHas('user', function ($q) use ($role) {
                $q->where('role', $role);
            });
        }

        if (!$request->user()) {
            $query->where('is_published', true);
        }

        if ($request->boolean('only_published')) {
            $query->where('is_published', true);
        }

        // Sorting
        $sort = $request->string('sort', 'latest');
        match ($sort) {
            'latest' => $query->latest(),
            'oldest' => $query->oldest(),
            'most_liked' => $query->orderBy('likes_count', 'desc'),
            'most_commented' => $query->orderBy('comments_count', 'desc'),
            default => $query->latest(),
        };

        $stories = $query->paginate($perPage);

        return $this->paginatedResponse($stories, 'Stories retrieved successfully');
    }

    public function show(Request $request, Story $story): JsonResponse
    {
        $this->authorize('view', $story);

        $story->load(['user:id,name,role'])->loadCount(['likes', 'allComments as comments_total']);

        return $this->successResponse($story, 'Story retrieved');
    }

    public function store(StoreStoryRequest $request): JsonResponse
    {
        $this->authorize('create', Story::class);

        $data = $request->validated();

        $story = Story::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'body' => $data['body'],
            'is_published' => $data['is_published'] ?? true,
        ]);

        return $this->createdResponse($story, 'Story created');
    }

    public function update(UpdateStoryRequest $request, Story $story): JsonResponse
    {
        $this->authorize('update', $story);

        $story->fill($request->validated());
        $story->save();

        return $this->successResponse($story, 'Story updated');
    }

    public function destroy(Request $request, Story $story): JsonResponse
    {
        $this->authorize('delete', $story);

        $story->delete();

        return $this->successResponse(null, 'Story deleted');
    }

    /**
     * List deleted stories (admin only)
     */
    public function trashed(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbiddenResponse('Unauthorized');
        }

        $perPage = min($request->integer('per_page', 15), 100);

        $stories = Story::onlyTrashed()
            ->with(['user:id,name,role'])
            ->withCount(['likes', 'allComments as comments_total'])
            ->latest('deleted_at')
            ->paginate($perPage);

        return $this->paginatedResponse($stories, 'Trashed stories');
    }

    /**
     * Restore a deleted story
     */
    public function restore(Request $request, $storyId): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbiddenResponse('Unauthorized');
        }

        $story = Story::withTrashed()->findOrFail($storyId);

        if (!$story->trashed()) {
            return $this->errorResponse('Story is not deleted', 400);
        }

        $story->restore();

        return $this->successResponse($story, 'Story restored successfully');
    }

    /**
     * Permanently delete a story
     */
    public function forceDelete(Request $request, $storyId): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbiddenResponse('Unauthorized');
        }

        $story = Story::withTrashed()->findOrFail($storyId);
        $storyTitle = $story->title;
        $story->forceDelete();

        return $this->successResponse([
            'deleted_story_id' => $storyId,
        ], "Story '{$storyTitle}' permanently deleted");
    }
}
