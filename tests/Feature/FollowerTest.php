<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowerTest extends TestCase
{
    use RefreshDatabase;
    protected User $user;
    protected User $targetUser;
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

        $this->targetUser = User::create([
            'firebase_uid' => 'member2-test-uid',
            'name' => 'Member User 2',
            'email' => 'member2@yourstory.local',
            'password' => bcrypt('password123'),
            'role' => 'member',
        ]);

        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_follow_user(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/users/{$this->targetUser->id}/follow");

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Successfully followed user',
            ])
            ->assertJsonPath('data.is_following', true);
    }

    public function test_cannot_follow_self(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/users/{$this->user->id}/follow");

        $response
            ->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'You cannot follow yourself',
            ]);
    }

    public function test_unfollow_user(): void
    {
        // First follow
        $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson("/api/users/{$this->targetUser->id}/follow");

        // Then unfollow
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->deleteJson("/api/users/{$this->targetUser->id}/follow");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Successfully unfollowed user',
            ])
            ->assertJsonPath('data.is_following', false);
    }

    public function test_get_followers(): void
    {
        $response = $this->getJson("/api/users/{$this->targetUser->id}/followers");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Followers retrieved',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['total', 'count'],
            ]);
    }

    public function test_get_following(): void
    {
        $response = $this->getJson("/api/users/{$this->user->id}/following");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Following retrieved',
            ]);
    }

    public function test_get_follow_counts(): void
    {
        $response = $this->getJson("/api/users/{$this->user->id}/follow-counts");

        $response
            ->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => ['followers_count', 'following_count'],
            ]);
    }
}
