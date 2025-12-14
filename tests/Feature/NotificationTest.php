<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;
    protected User $user;
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

        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_get_notifications(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson('/api/notifications');

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Notifications retrieved',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['total', 'count'],
            ]);
    }

    public function test_get_unread_count(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson('/api/notifications/unread-count');

        $response
            ->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => ['unread_count'],
            ]);
    }

    public function test_mark_notification_as_read(): void
    {
        // Get first unread notification
        $notification = $this->user->notifications()
            ->whereNull('read_at')
            ->first();

        if (!$notification) {
            $this->markTestSkipped('No unread notifications');
        }

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->putJson("/api/notifications/{$notification->id}/read");

        $response
            ->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.read_at', fn ($val) => $val !== null);
    }

    public function test_mark_all_as_read(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson('/api/notifications/read-all');

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'All notifications marked as read',
            ]);
    }

    public function test_delete_notification(): void
    {
        $notification = $this->user->notifications()->first();

        if (!$notification) {
            $this->markTestSkipped('No notifications');
        }

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->deleteJson("/api/notifications/{$notification->id}");

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Notification deleted',
            ]);
    }
}
