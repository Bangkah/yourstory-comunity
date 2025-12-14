<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_ok_and_status(): void
    {
        $response = $this->get('/');

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'API is running',
            ]);
    }
}
