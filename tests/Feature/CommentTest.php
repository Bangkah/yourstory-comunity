<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;
    protected User $user;
    protected Story $story;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::create([
            'firebase_uid' => 'member1-test-uid',
            'name' => 'Member User 1',
            'email' => 'member1@yourstory.local',
            'password' => bcrypt('password123'),
            'role' => 'member',
        ]);

        $otherUser = User::create([
            'firebase_uid' => 'member2-test-uid',
            'name' => 'Member User 2',
            'email' => 'member2@yourstory.local',
            'password' => bcrypt('password123'),
            'role' => 'member',
        ]);

        $this->story = Story::create([
            'user_id' => $otherUser->id,
            'title' => 'Test Story',
            'body' => 'This is a test story.',
            'is_published' => true,
        ]);

        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_get_story_comments(): void
    {
        $response = $this->getJson("/api/stories/{$this->story->id}/comments");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Comments retrieved',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);
    }

    public function test_create_root_comment(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/stories/{$this->story->id}/comments", [
                'body' => 'This is a test comment.',
            ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Comment created',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'body', 'user_id', 'story_id', 'parent_id'],
            ]);
    }

    public function test_create_reply_to_comment(): void
    {
        $parentComment = Comment::where('story_id', $this->story->id)
            ->whereNull('parent_id')
            ->first();

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/stories/{$this->story->id}/comments/{$parentComment->id}/reply", [
                'body' => 'This is a reply.',
            ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Comment created',
            ])
            ->assertJsonPath('data.parent_id', $parentComment->id);
    }

    public function test_comment_tree_structure(): void
    {
        $response = $this->getJson("/api/stories/{$this->story->id}/comments");

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'body', 'user', 'children'],
                ],
            ]);
    }
}
