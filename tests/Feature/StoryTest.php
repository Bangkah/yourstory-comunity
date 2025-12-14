<?php

namespace Tests\Feature;

use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoryTest extends TestCase
{
    use RefreshDatabase;
    protected User $user;
    protected User $otherUser;
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

        $this->otherUser = User::create([
            'firebase_uid' => 'member2-test-uid',
            'name' => 'Member User 2',
            'email' => 'member2@yourstory.local',
            'password' => bcrypt('password123'),
            'role' => 'member',
        ]);

        // Create test stories
        Story::create([
            'user_id' => $this->otherUser->id,
            'title' => 'Test Story by Member 2',
            'body' => 'This is a test story.',
            'is_published' => true,
        ]);

        Story::create([
            'user_id' => $this->user->id,
            'title' => 'My Test Story',
            'body' => 'This is my test story.',
            'is_published' => true,
        ]);

        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_get_all_published_stories(): void
    {
        $response = $this->getJson('/api/stories');

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Stories retrieved successfully',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['total', 'count', 'per_page', 'current_page'],
            ]);
    }

    public function test_get_single_story(): void
    {
        $story = Story::first();

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson("/api/stories/{$story->id}");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Story retrieved',
            ])
            ->assertJsonPath('data.id', $story->id);
    }

    public function test_create_story(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson('/api/stories', [
                'title' => 'Test Story',
                'body' => 'This is a test story.',
                'is_published' => true,
            ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Story created',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'title', 'body', 'user_id'],
            ]);
    }

    public function test_update_story(): void
    {
        $story = Story::where('user_id', $this->user->id)->first();

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->putJson("/api/stories/{$story->id}", [
                'title' => 'Updated Title',
                'body' => 'Updated body content.',
                'is_published' => false,
            ]);

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Story updated',
            ])
            ->assertJsonPath('data.title', 'Updated Title');
    }

    public function test_delete_story(): void
    {
        $story = Story::where('user_id', $this->user->id)->first();

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->deleteJson("/api/stories/{$story->id}");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Story deleted',
            ]);
    }

    public function test_search_stories_by_title(): void
    {
        $response = $this->getJson('/api/stories?search=Member');

        $response
            ->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_filter_stories_by_author(): void
    {
        $response = $this->getJson('/api/stories?author=Member');

        $response
            ->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
