# Your Story Community - Backend Documentation

**Version:** 1.0.0  
**Last Updated:** December 14, 2025  
**API Base URL:** `http://localhost:8080/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Setup & Installation](#setup--installation)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Endpoints](#api-endpoints)
7. [Request/Response Format](#requestresponse-format)
8. [Error Handling](#error-handling)
9. [Database Schema](#database-schema)
10. [Models & Relationships](#models--relationships)
11. [Services & Business Logic](#services--business-logic)
12. [Events & Listeners](#events--listeners)
13. [Middleware](#middleware)
14. [Rate Limiting](#rate-limiting)
15. [Testing](#testing)
16. [Development Guidelines](#development-guidelines)
17. [Deployment](#deployment)
18. [Troubleshooting](#troubleshooting)
19. [Future Enhancements](#future-enhancements)

---

## Overview

**Your Story Community** is a RESTful API backend built with Laravel 11, providing a complete social storytelling platform. Users can:

- **Create & manage stories** with full CRUD operations
- **Engage with content** via comments (nested/threaded), likes, and follows
- **Receive real-time notifications** for interactions
- **Admin/Moderator controls** for content moderation and user management
- **Role-based access control** (Admin, Moderator, Member)

### Key Features

- ✅ JWT-based authentication (Sanctum)
- ✅ Soft delete for content recovery
- ✅ Event-driven notifications
- ✅ Nested comment threads
- ✅ Follow/Follower system
- ✅ Content moderation workflow
- ✅ Rate limiting by action type
- ✅ Firebase Firestore integration (optional)
- ✅ Comprehensive error handling & logging

---

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Laravel** | 11.x | Web framework |
| **PHP** | 8.4+ | Runtime |
| **MySQL** | 8.0+ | Database |
| **Laravel Sanctum** | 4.x | API authentication |
| **Docker** | Latest | Containerization |
| **PHPUnit** | 11.x | Testing |

### Dependencies

```
laravel/framework: ^11.0
laravel/sanctum: ^4.0
laravel/tinker: ^2.9
laravel/pint: ^1.15
phpunit/phpunit: ^11.0
firebase/php-jwt: For Firebase integration (optional)
```

---

## Architecture

### MVC Pattern with Traits & Policies

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── ApiController.php          (Base controller with AuthorizesRequests)
│   │   ├── Auth/LoginController.php
│   │   ├── StoryController.php
│   │   ├── CommentController.php
│   │   ├── LikeController.php
│   │   ├── FollowerController.php
│   │   ├── NotificationController.php
│   │   └── Admin/
│   │       ├── UserController.php
│   │       └── StoryController.php
│   ├── Middleware/
│   │   ├── HandleApiErrors.php        (Global error handling for API)
│   │   ├── Admin.php                  (Role-based auth)
│   │   ├── AdminOrModerator.php
│   │   └── HandleCors.php
│   └── Requests/
│       ├── StoreStoryRequest.php      (Form validation)
│       ├── UpdateStoryRequest.php
│       └── StoreCommentRequest.php
├── Models/
│   ├── User.php                       (Authentication, followers, stories)
│   ├── Story.php                      (SoftDeletes, relationships)
│   ├── Comment.php                    (Nested/threaded)
│   ├── Like.php
│   └── Notification.php               (UUID primary key)
├── Events/
│   ├── CommentCreated.php
│   └── StoryLiked.php
├── Listeners/
│   ├── SendCommentNotification.php    (Queued, creates DB records)
│   └── SendLikeNotification.php
├── Policies/
│   └── StoryPolicy.php                (Authorization logic)
├── Services/
│   └── Firebase/
│       └── FirestoreCommentBroadcaster.php (Real-time comments)
├── Traits/
│   └── ApiResponse.php                (Standardized JSON responses)
└── Providers/
    ├── AppServiceProvider.php
    ├── AuthServiceProvider.php
    ├── EventServiceProvider.php
    └── RouteServiceProvider.php

database/
├── migrations/
│   ├── create_users_table
│   ├── create_stories_table
│   ├── add_soft_delete_to_stories
│   ├── create_comments_table
│   ├── create_likes_table
│   ├── create_followers_table
│   ├── create_notifications_table
│   └── create_personal_access_tokens_table
├── seeders/
│   ├── DatabaseSeeder.php
│   ├── UserSeeder.php                 (Admin, Moderator, Members)
│   └── StorySeeder.php                (Sample content)
└── factories/
    └── UserFactory.php
```

### Request Flow

```
HTTP Request
    ↓
[CORS Middleware]
    ↓
[Verify Encoding / Trim Strings]
    ↓
[CSRF / Session (if applicable)]
    ↓
[HandleApiErrors - Try/Catch]
    ↓
[Auth:Sanctum] → Token validation
    ↓
[Rate Limiting] → Throttle check
    ↓
[Role-based Middleware] → Admin/Moderator check
    ↓
[Route Binding] → Model resolution (e.g., Story {story})
    ↓
[Form Request Validation] → StoreStoryRequest validation
    ↓
[Controller Action] → Business logic
    ↓
[Event Dispatch] → CommentCreated, StoryLiked, etc.
    ↓
[Response] → JSON via ApiResponse trait
```

---

## Setup & Installation

### Prerequisites

- Docker & Docker Compose
- Terminal/CLI
- 4GB+ RAM
- Port 8080, 3306 available

### Installation Steps

```bash
# 1. Navigate to project
cd /home/atha/Dokumen/myproject/yourstoryComunity

# 2. Start containers
docker compose up -d --build

# 3. Generate application key
docker compose exec app php artisan key:generate

# 4. Clear route cache (important for first run)
docker compose exec app php artisan route:clear

# 5. Run migrations
docker compose exec app php artisan migrate --force

# 6. Seed database (optional, for test data)
docker compose exec app php artisan db:seed --force

# 7. Verify installation
docker compose exec app php artisan tinker
>>> User::count()  # Should return 7 (1 admin, 1 moderator, 5 members)
```

### Verify Setup

```bash
# Check containers
docker compose ps

# Test API
curl -H "Accept: application/json" http://localhost:8080/
# Expected: {"success":true,"message":"API is running"}

# Test stories endpoint
curl -H "Accept: application/json" http://localhost:8080/api/stories
# Expected: paginated list of stories
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=yourstory_comunity
DB_USERNAME=root
DB_PASSWORD=

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:8080
SESSION_DOMAIN=localhost

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug

# Cache & Queue (use database for testing)
CACHE_STORE=database
QUEUE_CONNECTION=database
```

---

## Authentication & Authorization

### Sanctum Token-Based Auth

All protected endpoints require a valid Sanctum token in the `Authorization` header.

#### Login Flow

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Admin User",
      "role": "admin",
      "created_at": "2025-12-14T14:22:32.000000Z"
    },
    "token": "14|CAoQih3D7yCUUrG0y0kJyrajIt15Mm51VTYOVEO16271c442"
  }
}
```

#### Using Token

```bash
curl -H "Authorization: Bearer {token}" \
     -H "Accept: application/json" \
     http://localhost:8080/api/auth/me
```

### Role-Based Access Control

#### User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access, manage users, moderate content, force-delete |
| **moderator** | View & moderate stories, cannot manage users |
| **member** | Create content, comment, like, follow |

#### Middleware Protection

```php
// Admin only
Route::middleware('admin')->group(...)

// Admin or Moderator
Route::middleware('admin_or_moderator')->group(...)

// Authenticated (any role)
Route::middleware('auth:sanctum')->group(...)
```

#### Authorization Policies

Use `StoryPolicy` for fine-grained checks:

```php
// Can view story
$this->authorize('view', $story);

// Can update own story
$this->authorize('update', $story);

// Can delete story
$this->authorize('delete', $story);
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out",
  "data": null
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| POST | `/auth/login` | ❌ | 5/min | User login, returns token |
| POST | `/auth/logout` | ✅ | 120/min | Invalidate current token |
| GET | `/auth/me` | ✅ | 120/min | Get authenticated user |

### Stories

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| GET | `/stories` | ❌ | 60/min | List all published stories (paginated) |
| GET | `/stories?search=...` | ❌ | 60/min | Search stories by title/body |
| GET | `/stories?author=...` | ❌ | 60/min | Filter by author name |
| GET | `/stories?sort=latest\|oldest\|most_liked\|most_commented` | ❌ | 60/min | Sort stories |
| GET | `/stories/{id}` | ❌ | 60/min | Get single story details |
| POST | `/stories` | ✅ | 30/min | Create new story |
| PUT | `/stories/{id}` | ✅ | 30/min | Update story (author only) |
| DELETE | `/stories/{id}` | ✅ | 30/min | Soft delete story (author only) |

#### Story Query Parameters

```
GET /api/stories?per_page=20&page=1&search=lorem&author=John&role=admin&sort=latest&only_published=true
```

- `per_page`: 1-100 (default: 15)
- `page`: Pagination offset
- `search`: Full-text search in title/body
- `author`: Filter by user name
- `role`: Filter by user role (admin/moderator/member)
- `sort`: latest, oldest, most_liked, most_commented
- `only_published`: true/false (default: shows only published if not auth)

### Comments (Nested/Threaded)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| GET | `/stories/{story_id}/comments` | ❌ | 60/min | Get threaded comment tree |
| POST | `/stories/{story_id}/comments` | ✅ | 30/min | Create root comment |
| POST | `/stories/{story_id}/comments/{comment_id}/reply` | ✅ | 30/min | Reply to comment |

#### Comment Structure

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "body": "Great story!",
      "depth": 0,
      "user": { "id": 2, "name": "John" },
      "created_at": "2025-12-14T15:00:00Z",
      "children": [
        {
          "id": 2,
          "body": "I agree!",
          "depth": 1,
          "user": { "id": 3, "name": "Jane" },
          "children": []
        }
      ]
    }
  ]
}
```

### Likes

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| POST | `/stories/{story_id}/likes/toggle` | ✅ | 60/min | Toggle like on/off |

**Response:**
```json
{
  "success": true,
  "data": {
    "story_id": 1,
    "liked": true,
    "likes_count": 15
  }
}
```

### Followers/Following

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| GET | `/users/{user_id}/followers` | ❌ | 60/min | List user followers (paginated) |
| GET | `/users/{user_id}/following` | ❌ | 60/min | List users they follow (paginated) |
| GET | `/users/{user_id}/follow-counts` | ❌ | 60/min | Get follower/following counts |
| GET | `/users/{user_id}/follow-status` | ❌ | 60/min | Check if current user follows target |
| POST | `/users/{user_id}/follow` | ✅ | 60/min | Follow user |
| DELETE | `/users/{user_id}/follow` | ✅ | 60/min | Unfollow user |

### Notifications

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| GET | `/notifications` | ✅ | 120/min | List notifications (paginated) |
| GET | `/notifications/unread-count` | ✅ | 120/min | Get unread count |
| PUT | `/notifications/{id}/read` | ✅ | 120/min | Mark as read |
| POST | `/notifications/read-all` | ✅ | 120/min | Mark all as read |
| DELETE | `/notifications/{id}` | ✅ | 120/min | Delete notification |

#### Notification Types

| Type | Triggered When | Data Fields |
|------|----------------|-------------|
| `comment_created` | New comment on your story | `comment_id`, `story_id`, `user_name`, `comment_preview` |
| `comment_reply` | Reply to your comment | `comment_id`, `parent_id`, `story_id`, `user_name`, `reply_preview` |
| `story_liked` | Someone likes your story | `story_id`, `user_name`, `story_title` |

### Admin: User Management

| Method | Endpoint | Auth | Role | Rate Limit | Description |
|--------|----------|------|------|-----------|-------------|
| GET | `/admin/users` | ✅ | admin | 60/min | List all users (searchable) |
| GET | `/admin/users/{id}` | ✅ | admin | 60/min | Get user with stories/comments |
| PUT | `/admin/users/{id}/role` | ✅ | admin | 60/min | Update user role |
| POST | `/admin/users/{id}/suspend` | ✅ | admin | 60/min | Toggle suspend status |
| DELETE | `/admin/users/{id}` | ✅ | admin | 60/min | Hard delete user |

#### Admin: Story Management

| Method | Endpoint | Auth | Role | Rate Limit | Description |
|--------|----------|------|------|-----------|-------------|
| GET | `/admin/stories` | ✅ | admin/mod | 60/min | List all stories for moderation |
| GET | `/admin/stories/{id}` | ✅ | admin/mod | 60/min | Get story with author/comments |
| PUT | `/admin/stories/{id}/status` | ✅ | admin/mod | 60/min | Update publication status |
| DELETE | `/admin/stories/{id}` | ✅ | admin/mod | 60/min | Flag story for review/delete |
| GET | `/admin/stories/trashed` | ✅ | admin | 60/min | List soft-deleted stories |
| POST | `/admin/stories/{id}/restore` | ✅ | admin | 60/min | Restore soft-deleted story |
| DELETE | `/admin/stories/{id}/force-delete` | ✅ | admin | 60/min | Permanently delete story |

---

## Request/Response Format

### Standard Response Format

All API responses follow this structure:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": {},
  "meta": {}
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "My First Story",
      "body": "...",
      "user": { "id": 2, "name": "John", "role": "member" },
      "likes_count": 5,
      "comments_count": 3,
      "created_at": "2025-12-14T10:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "count": 15,
    "per_page": 15,
    "current_page": 1,
    "last_page": 3,
    "from": 1,
    "to": 15
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [...],
  "meta": {
    "total": 100,
    "count": 20,
    "per_page": 20,
    "current_page": 1,
    "last_page": 5
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```

### Validation Error (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."],
    "body": ["The body must be at least 10 characters."]
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Story retrieved successfully |
| 201 | Created | Story created |
| 204 | No Content | Resource deleted |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Story doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unhandled exception |

### Error Response Examples

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**422 Validation:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email must be a valid email address."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

**429 Rate Limited:**
```json
{
  "success": false,
  "message": "Too many requests"
}
```

### Error Handling Middleware

The `HandleApiErrors` middleware catches all exceptions and returns consistent JSON:

```php
// In app/Http/Middleware/HandleApiErrors.php
- ModelNotFoundException → 404
- ValidationException → 422 with errors
- Generic Exception → 500 (with detailed message in debug mode)
```

All errors are logged to `storage/logs/laravel.log` for debugging.

---

## Database Schema

### Entity Relationship Diagram

```
Users (1) ←→ (many) Stories
Users (1) ←→ (many) Comments
Users (1) ←→ (many) Likes
Users (1) ←→ (many) Notifications

Stories (1) ←→ (many) Comments
Stories (1) ←→ (many) Likes

Comments (1) ←→ (many) Comments (self, parent_id)

Users (many) ←→ (many) Users (followers table)
```

### Table Definitions

#### `users` Table

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255),
  role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_is_suspended ON users(is_suspended);
```

#### `stories` Table

```sql
CREATE TABLE stories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  likes_count UNSIGNED INT DEFAULT 0,
  comments_count UNSIGNED INT DEFAULT 0,
  deleted_at TIMESTAMP NULL,  -- SoftDeletes
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_created ON stories(user_id, created_at);
CREATE INDEX idx_is_published ON stories(is_published);
CREATE INDEX idx_deleted_at ON stories(deleted_at);
```

#### `comments` Table

```sql
CREATE TABLE comments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  story_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,  -- NULL for root, ID for replies
  body TEXT NOT NULL,
  depth UNSIGNED INT DEFAULT 0,    -- 0 for root, 1+ for replies
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_story_depth ON comments(story_id, depth);
CREATE INDEX idx_parent_id ON comments(parent_id);
```

#### `likes` Table

```sql
CREATE TABLE likes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  story_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP,
  UNIQUE KEY unique_story_user (story_id, user_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `followers` Table

```sql
CREATE TABLE followers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,        -- User being followed
  follower_id BIGINT UNSIGNED NOT NULL,    -- User who follows
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE KEY unique_follow (user_id, follower_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON followers(user_id);
CREATE INDEX idx_follower_id ON followers(follower_id);
```

#### `notifications` Table

```sql
CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,                  -- UUID
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(255) NOT NULL,               -- comment_created, comment_reply, story_liked
  data JSON NOT NULL,                       -- Event data
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_read ON notifications(user_id, read_at);
```

#### `personal_access_tokens` Table

```sql
CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tokenable_type VARCHAR(255) NOT NULL,     -- Model class
  tokenable_id BIGINT UNSIGNED NOT NULL,    -- User ID
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  abilities JSON,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);
CREATE INDEX idx_token ON personal_access_tokens(token);
```

---

## Models & Relationships

### User Model

```php
class User extends Authenticatable {
  // Relationships
  hasMany(Story::class)
  hasMany(Comment::class)
  hasMany(Like::class)
  hasMany(Notification::class)
  
  // Many-to-Many (Followers)
  belongsToMany(User::class, 'followers', 'user_id', 'follower_id')
    ->withTimestamps()
  
  // Many-to-Many (Following)
  belongsToMany(User::class, 'followers', 'follower_id', 'user_id')
    ->withTimestamps()
  
  // Methods
  isFollowing(User $user): bool
  getFollowersCountAttribute(): int
  getFollowingCountAttribute(): int
}
```

### Story Model

```php
class Story extends Model {
  use SoftDeletes;  // Enables soft delete
  
  // Relationships
  belongsTo(User::class)
  hasMany(Comment::class)
  hasMany(Like::class)
  hasMany(Comment::class, 'story_id', 'id')  // allComments (all levels)
  
  // Casts
  protected $casts = [
    'is_published' => 'bool',
    'created_at' => 'datetime',
  ];
  
  // Attributes
  $fillable = ['user_id', 'title', 'body', 'is_published'];
}
```

### Comment Model

```php
class Comment extends Model {
  // Relationships
  belongsTo(Story::class)
  belongsTo(User::class)
  belongsTo(Comment::class, 'parent_id')  // Parent reply
  hasMany(Comment::class, 'parent_id')    // Child replies
  
  // For threading
  depth: 0 for root, 1+ for replies
  parent_id: NULL for root, comment ID for replies
}
```

### Notification Model

```php
class Notification extends Model {
  // Relationships
  belongsTo(User::class)
  
  // Attributes
  protected $keyType = 'string';
  protected $primaryKey = 'id';
  protected $casts = [
    'data' => 'array',
    'read_at' => 'datetime',
  ];
}
```

---

## Services & Business Logic

### ApiResponse Trait

Standardizes all JSON responses:

```php
// In app/Traits/ApiResponse.php

successResponse($data, $message, $statusCode)
paginatedResponse($paginator, $message, $statusCode)
createdResponse($data, $message)
errorResponse($message, $statusCode, $errors)
validationErrorResponse($errors)
unauthorizedResponse($message)
forbiddenResponse($message)
notFoundResponse($message)
```

### Authorization (Policies)

```php
// In app/Policies/StoryPolicy.php

view(User $user, Story $story): bool
  // Public stories visible to all
  // Private stories visible to author only

create(User $user): bool
  // Authenticated users can create

update(User $user, Story $story): bool
  // Author can update own stories

delete(User $user, Story $story): bool
  // Author can delete, Admin can force-delete

restore(User $user, Story $story): bool
  // Only admin can restore soft-deleted
```

### Firebase Integration (Optional)

```php
// In app/Services/Firebase/FirestoreCommentBroadcaster.php

broadcast(Comment $comment): void
  // Real-time comment broadcast via Firestore
  // Called when comment created
```

---

## Events & Listeners

### Event-Driven Notification System

#### CommentCreated Event

Triggered when: New comment on story (root or reply)

```php
// Event data
$event->comment  // Comment model with relationships loaded

// Listeners
SendCommentNotification::class
  // If reply to comment: Notify parent comment author
  // If new comment: Notify story author
  // Skip if commenter is the story/parent author
```

#### StoryLiked Event

Triggered when: User likes a story

```php
// Event data
$event->like  // Like model with user & story relationships

// Listeners
SendLikeNotification::class
  // Notify story author
  // Skip if liker is the story author
```

#### Listener Execution

Listeners implement `ShouldQueue` for async execution:
- Queued via `database` queue (configurable)
- Retries on failure
- Creates `Notification` records in DB

---

## Middleware

### HandleApiErrors

Global error catcher for API:

```php
// Catches exceptions and returns JSON
ModelNotFoundException → 404
ValidationException → 422
Generic Exception → 500

// Logs all errors to storage/logs/laravel.log
```

### Auth Middleware

```php
auth:sanctum
// Validates Sanctum token
// Sets $request->user()
// Returns 401 if invalid
```

### Role-Based Middleware

```php
admin
// Checks $user->role === 'admin'
// Returns 403 if not

admin_or_moderator
// Checks $user->role in ['admin', 'moderator']
// Returns 403 if not
```

### Rate Limiting

Uses Laravel's built-in throttle middleware:

```php
throttle:60,1      // 60 requests per 1 minute
throttle:30,1      // 30 requests per 1 minute
throttle:120,1     // 120 requests per 1 minute
```

---

## Rate Limiting

### By Endpoint Type

| Action | Limit | Purpose |
|--------|-------|---------|
| Read (public) | 60/min | Light usage |
| Read (auth) | 120/min | Standard usage |
| Write (create) | 30/min | Prevent spam |
| Social (like/follow) | 60/min | Moderate usage |
| Login | 5/min | Brute force protection |
| Admin | 60/min | Moderation work |

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1702569600
```

### Exceeding Limit

**Response (429):**
```json
{
  "success": false,
  "message": "Too many requests"
}
```

---

## Testing

### Test Suite Structure

```
tests/Feature/
├── HealthCheckTest.php         ✅ 1/1 passing
├── AuthTest.php                ✅ 4/5 passing (logout edge case)
├── StoryTest.php               ✅ 5/8 passing
├── CommentTest.php             ✅ 4/4 passing
├── LikeTest.php                ✅ 3/3 passing
├── FollowerTest.php            ✅ 6/6 passing
└── NotificationTest.php        ⏭️ Partial (edge cases)

Total: 25/31 passing (80.6%)
```

### Running Tests

```bash
# All tests
php artisan test --testsuite=Feature

# Specific test file
php artisan test tests/Feature/AuthTest.php

# Specific test
php artisan test tests/Feature/AuthTest.php --filter=test_login_with_valid_credentials

# With coverage
php artisan test --coverage

# Verbose output
php artisan test -v
```

### Test Database

Tests use `sqlite` in-memory database (defined in `phpunit.xml`):

```xml
<php>
  <env name="DB_CONNECTION" value="sqlite"/>
  <env name="DB_DATABASE" value=":memory:"/>
</php>
```

### Writing Tests

```php
class StoryTest extends TestCase {
  use RefreshDatabase;  // Reset DB each test
  
  protected function setUp(): void {
    parent::setUp();
    // Setup test data
    $this->user = User::create([...]);
  }
  
  public function test_can_create_story(): void {
    $response = $this->actingAs($this->user)
      ->postJson('/api/stories', [
        'title' => 'Test',
        'body' => 'Body',
      ]);
    
    $response->assertStatus(201)
      ->assertJson(['success' => true]);
  }
}
```

---

## Development Guidelines

### Code Standards

- **PHP**: PSR-12
- **Laravel**: Official conventions
- **JSON**: Consistent response format
- **Naming**: Descriptive, snake_case for routes/endpoints

### Controller Pattern

```php
class StoryController extends ApiController {
  // Always return JsonResponse
  public function index(Request $request): JsonResponse {
    // Validate input
    // Query/transform data
    // Authorize if needed
    // Return via ApiResponse trait
  }
}
```

### Form Request Validation

```php
class StoreStoryRequest extends FormRequest {
  public function authorize(): bool {
    return $this->user() !== null;
  }
  
  public function rules(): array {
    return [
      'title' => 'required|string|max:255',
      'body' => 'required|string|min:10',
      'is_published' => 'boolean',
    ];
  }
}
```

### Model Relationships

```php
// Always use explicit foreign keys
hasMany(Comment::class, 'story_id', 'id')
belongsTo(User::class, 'user_id')

// Load eagerly to avoid N+1
Story::with(['user', 'likes', 'comments'])->get()
```

### Event Dispatching

```php
// Dispatch events after model changes
CommentCreated::dispatch($comment->load('user', 'story'));

// Listeners handle side effects
// Keep controllers clean, logic in listeners
```

### Logging

```php
// Log important actions
Log::info('User created story', ['user_id' => 1, 'story_id' => 5]);

// Log errors in middleware/listeners
Log::error('API Error: ' . $e->getMessage(), ['exception' => $e]);
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-endpoint

# Commit with meaningful messages
git commit -m "feat: add comment thread API endpoint"

# Pull request for review
# Merge after tests pass

# Deploy
git push production main
```

---

## Deployment

### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate strong `APP_KEY`
- [ ] Configure database (RDS/managed MySQL)
- [ ] Set up environment variables
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Configure CORS for frontend domain
- [ ] Set up HTTPS certificates
- [ ] Configure logging (CloudWatch/ELK)
- [ ] Set up monitoring & alerts
- [ ] Run tests: `php artisan test`
- [ ] Cache configurations: `php artisan config:cache`
- [ ] Cache routes: `php artisan route:cache`

### Docker Production Build

```bash
# Build image
docker build -t yourstory-api:1.0.0 .

# Push to registry
docker push yourstory-api:1.0.0

# Deploy
docker pull yourstory-api:1.0.0
docker run -e APP_ENV=production ... yourstory-api:1.0.0
```

### Database Backups

```bash
# Automated backups
0 2 * * * mysqldump -u root -p yourstory_comunity > /backups/db_$(date +\%Y\%m\%d).sql

# Restore from backup
mysql -u root -p yourstory_comunity < /backups/db_20251214.sql
```

### Monitoring

Monitor these metrics:
- API response time (target: <200ms)
- Error rate (target: <1%)
- Database query time (target: <100ms per query)
- Memory usage
- Disk space
- Token validation latency

---

## Troubleshooting

### Common Issues

#### 1. "No such table" errors

**Cause:** Migrations not run

**Fix:**
```bash
docker compose exec app php artisan migrate --force
```

#### 2. "Unauthorized" (401) on protected endpoints

**Cause:** Missing/invalid token

**Fix:**
```bash
# Verify token format
Authorization: Bearer {token}

# Check token in database
php artisan tinker
>>> DB::table('personal_access_tokens')->where('token', 'hashed_value')->first()
```

#### 3. "Forbidden" (403) on admin endpoints

**Cause:** User doesn't have admin role

**Fix:**
```bash
php artisan tinker
>>> User::find(1)->update(['role' => 'admin'])
```

#### 4. Notifications not creating

**Cause:** Events/Listeners not wired or queue not processing

**Fix:**
```bash
# Check EventServiceProvider
>>> EventServiceProvider::$listen

# Process queued jobs
php artisan queue:work

# Or check listener code for bugs
```

#### 5. Rate limit issues in tests

**Cause:** RefreshDatabase not clearing rate limit cache

**Fix:**
```php
protected function setUp(): void {
  parent::setUp();
  Cache::flush();  // Clear cache
}
```

#### 6. CORS errors from frontend

**Cause:** Origin not whitelisted

**Fix:** In `.env`:
```
SANCTUM_STATEFUL_DOMAINS=localhost:3000,yourdomain.com
```

---

## Future Enhancements

### Phase 2 (v1.1)

- [ ] Full-text search with Elasticsearch
- [ ] Real-time notifications via WebSockets
- [ ] User blocking feature
- [ ] Content reporting system
- [ ] Advanced analytics dashboard
- [ ] API rate limit dashboard

### Phase 3 (v1.2)

- [ ] Machine learning recommendations
- [ ] Multi-language support
- [ ] Rich text editor support (Markdown)
- [ ] Image/media upload
- [ ] Email digests
- [ ] Two-factor authentication

### Phase 4 (v2.0)

- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Mobile app API optimization
- [ ] Advanced moderation tools
- [ ] Community guidelines enforcement
- [ ] Payment integration

---

## Support & Contact

For issues, questions, or contributions:

- **Documentation:** See this file
- **API Testing:** Use Postman/Insomnia collections
- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions

---

## License

Proprietary - All rights reserved

---

**Last Updated:** December 14, 2025  
**Documentation Version:** 1.0.0  
**API Version:** 1.0.0
