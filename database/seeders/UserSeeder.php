<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin (idempotent)
        User::updateOrCreate(
            ['email' => 'admin@yourstory.local'],
            [
                'firebase_uid' => 'admin-uid',
                'name' => 'Admin User',
                'password' => bcrypt('password123'),
                'role' => User::ROLE_ADMIN,
            ]
        );

        // Moderator (idempotent)
        User::updateOrCreate(
            ['email' => 'moderator@yourstory.local'],
            [
                'firebase_uid' => 'moderator-uid',
                'name' => 'Moderator User',
                'password' => bcrypt('password123'),
                'role' => User::ROLE_MODERATOR,
            ]
        );

        // 5 Regular Members (idempotent)
        for ($i = 1; $i <= 5; $i++) {
            User::updateOrCreate(
                ['email' => "member$i@yourstory.local"],
                [
                    'firebase_uid' => 'member-uid-' . $i,
                    'name' => "Member User $i",
                    'password' => bcrypt('password123'),
                    'role' => User::ROLE_MEMBER,
                ]
            );
        }
    }
}
