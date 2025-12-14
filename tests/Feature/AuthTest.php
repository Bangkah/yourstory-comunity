<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create admin user for testing
        User::create([
            'firebase_uid' => 'admin-test-uid',
            'name' => 'Admin User',
            'email' => 'admin@yourstory.local',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);
    }
    public function test_login_with_valid_credentials(): void
    {
        $user = User::where('email', 'admin@yourstory.local')->first();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@yourstory.local',
            'password' => 'password123',
        ]);

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'email', 'name', 'role'],
                    'token',
                ],
            ]);
    }

    public function test_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@yourstory.local',
            'password' => 'wrongpassword',
        ]);

        $response
            ->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    public function test_me_endpoint_returns_authenticated_user(): void
    {
        $user = User::where('email', 'admin@yourstory.local')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Authenticated user',
            ])
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_logout_deletes_token(): void
    {
        $user = User::where('email', 'admin@yourstory.local')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out',
            ]);

        // Token should be invalid now
        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me')
            ->assertStatus(401);
    }

    public function test_me_without_token_returns_unauthorized(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }
}
