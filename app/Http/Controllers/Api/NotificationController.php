<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    /**
     * Get user notifications (paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $this->paginatedResponse($notifications, 'Notifications retrieved');
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->count();

        return $this->successResponse(['unread_count' => $count], 'Unread count retrieved');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $notificationId): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($notificationId);

        $notification->update(['read_at' => now()]);

        return $this->successResponse($notification, 'Notification marked as read');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse(null, 'All notifications marked as read');
    }

    /**
     * Delete notification
     */
    public function destroy(Request $request, $notificationId): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($notificationId);

        $notification->delete();

        return $this->successResponse(null, 'Notification deleted');
    }
}
