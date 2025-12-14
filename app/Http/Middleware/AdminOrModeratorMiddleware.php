<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrModeratorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, [User::ROLE_ADMIN, User::ROLE_MODERATOR])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin or moderator access required.',
            ], 403);
        }

        return $next($request);
    }
}
