<?php

namespace Tests\Feature;

use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LikeTest extends TestCase
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

    public function test_toggle_like_add(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/stories/{$this->story->id}/likes/toggle");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Like added',
            ])
            ->assertJsonPath('data.liked', true);
    }

    public function test_toggle_like_remove(): void
    {
        // First like
        $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/stories/{$this->story->id}/likes/toggle");

        // Then unlike
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/stories/{$this->story->id}/likes/toggle");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Like removed',
            ])
            ->assertJsonPath('data.liked', false);
    }

    public function test_like_increments_count(): void
    {
        $beforeLikes = $this->story->likes_count;

        $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/stories/{$this->story->id}/likes/toggle");

        $this->story->refresh();

        $this->assertEquals($beforeLikes + 1, $this->story->likes_count);
    }
}
