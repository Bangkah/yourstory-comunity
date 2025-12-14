# Testing Guide - Your Story Community API

Complete guide untuk testing API endpoints dengan berbagai tools dan methods.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start with cURL](#quick-start-with-curl)
- [Postman Collection](#postman-collection)
- [API Testing Workflow](#api-testing-workflow)
- [Test Data](#test-data)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Pastikan backend sudah running:

```bash
# Terminal 1: Start Docker containers
docker-compose up -d

# Terminal 2: Run migrations dan seeders
docker-compose exec app php artisan migrate --seed

# Terminal 3: Start queue worker (untuk notifications)
docker-compose exec app php artisan queue:work
```

API Base URL: `http://localhost:8080/api`

---

## Quick Start with cURL

### 1. Authentication Flow

#### Login sebagai Admin
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "admin@yourstory.local",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@yourstory.local",
      "role": "admin",
      "is_suspended": false,
      "created_at": "2024-01-15T10:00:00Z"
    },
    "token": "1|abcdef123456..."
  }
}
```

**Save token:**
```bash
TOKEN="1|abcdef123456..."
```

#### Get Current User
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

#### Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

### 2. Stories Management

#### Get All Stories (Public)
```bash
# Get first page
curl -X GET "http://localhost:8080/api/stories?per_page=20&page=1" \
  -H "Accept: application/json"

# Search stories
curl -X GET "http://localhost:8080/api/stories?search=amazing" \
  -H "Accept: application/json"

# Sort stories
curl -X GET "http://localhost:8080/api/stories?sort=latest" \
  -H "Accept: application/json"

# Combine filters
curl -X GET "http://localhost:8080/api/stories?search=story&sort=popular&per_page=10" \
  -H "Accept: application/json"
```

#### Get Single Story
```bash
curl -X GET http://localhost:8080/api/stories/1 \
  -H "Accept: application/json"
```

#### Create Story (Protected)
```bash
curl -X POST http://localhost:8080/api/stories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "My First Story",
    "body": "This is an amazing story about my journey into programming.",
    "is_published": true
  }'
```

#### Update Story
```bash
curl -X PUT http://localhost:8080/api/stories/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Updated Title",
    "body": "Updated content here...",
    "is_published": true
  }'
```

#### Delete Story (Soft Delete)
```bash
curl -X DELETE http://localhost:8080/api/stories/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

### 3. Comments & Replies

#### Get Story Comments (with tree structure)
```bash
curl -X GET http://localhost:8080/api/stories/1/comments \
  -H "Accept: application/json"
```

Response includes nested comments:
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": 1,
      "body": "Great story!",
      "depth": 0,
      "user": { "id": 2, "name": "User Two" },
      "children": [
        {
          "id": 2,
          "body": "I agree!",
          "depth": 1,
          "user": { "id": 3, "name": "User Three" },
          "children": []
        }
      ]
    }
  ]
}
```

#### Create Root Comment
```bash
curl -X POST http://localhost:8080/api/stories/1/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "body": "This is a wonderful story! Really enjoyed it."
  }'
```

#### Reply to Comment
```bash
curl -X POST http://localhost:8080/api/stories/1/comments/1/reply \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "body": "I agree! Very impressive."
  }'
```

---

### 4. Likes

#### Toggle Like
```bash
curl -X POST http://localhost:8080/api/stories/1/likes/toggle \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

Response (like added):
```json
{
  "success": true,
  "message": "Like added successfully",
  "data": {
    "likes_count": 5,
    "user_has_liked": true
  }
}
```

Response (like removed):
```json
{
  "success": true,
  "message": "Like removed successfully",
  "data": {
    "likes_count": 4,
    "user_has_liked": false
  }
}
```

---

### 5. Followers

#### Get User Followers
```bash
curl -X GET "http://localhost:8080/api/users/2/followers?per_page=20" \
  -H "Accept: application/json"
```

#### Get User Following
```bash
curl -X GET "http://localhost:8080/api/users/2/following?per_page=20" \
  -H "Accept: application/json"
```

#### Get Follow Counts
```bash
curl -X GET http://localhost:8080/api/users/2/follow-counts \
  -H "Accept: application/json"
```

Response:
```json
{
  "success": true,
  "message": "Follow counts retrieved successfully",
  "data": {
    "followers_count": 5,
    "following_count": 3
  }
}
```

#### Follow User
```bash
curl -X POST http://localhost:8080/api/users/2/follow \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

#### Unfollow User
```bash
curl -X DELETE http://localhost:8080/api/users/2/follow \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

### 6. Notifications

#### Get Notifications
```bash
curl -X GET "http://localhost:8080/api/notifications?per_page=20&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

#### Get Unread Count
```bash
curl -X GET http://localhost:8080/api/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

Response:
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "unread_count": 3
  }
}
```

#### Mark Notification as Read
```bash
curl -X PUT http://localhost:8080/api/notifications/{notification_id}/read \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

#### Mark All as Read
```bash
curl -X POST http://localhost:8080/api/notifications/read-all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

#### Delete Notification
```bash
curl -X DELETE http://localhost:8080/api/notifications/{notification_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

### 7. Admin Endpoints

#### Get All Users (Admin Only)
```bash
# List users with pagination
curl -X GET "http://localhost:8080/api/admin/users?per_page=20&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"

# Search users by name/email
curl -X GET "http://localhost:8080/api/admin/users?search=admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"

# Filter by role
curl -X GET "http://localhost:8080/api/admin/users?role=moderator" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Get User Details
```bash
curl -X GET http://localhost:8080/api/admin/users/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Update User Role
```bash
curl -X PUT http://localhost:8080/api/admin/users/2/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "role": "moderator"
  }'
```

Valid roles: `admin`, `moderator`, `member`

#### Suspend/Unsuspend User
```bash
curl -X POST http://localhost:8080/api/admin/users/2/suspend \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Delete User
```bash
curl -X DELETE http://localhost:8080/api/admin/users/10 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Get Stories for Moderation
```bash
curl -X GET "http://localhost:8080/api/admin/stories?per_page=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Update Story Status
```bash
curl -X PUT http://localhost:8080/api/admin/stories/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "is_published": false
  }'
```

#### Get Trashed Stories
```bash
curl -X GET http://localhost:8080/api/admin/stories/trashed \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Restore Story
```bash
curl -X POST http://localhost:8080/api/admin/stories/1/restore \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

#### Force Delete Story
```bash
curl -X DELETE http://localhost:8080/api/admin/stories/1/force-delete \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json"
```

---

## Postman Collection

### Setup

1. **Import Collection:**
   - Buka Postman
   - Klik `File` → `Import`
   - Upload `postman_collection.json`

2. **Import Environment:**
   - Klik `File` → `Import`
   - Upload `postman_environment.json`
   - Select environment dari dropdown

3. **Set Variables:**
   - Edit environment
   - Update `base_url` jika berbeda
   - Isi `token` dan `admin_token` setelah login

### Usage

1. **Login & Get Token:**
   - Jalankan request "Login" di folder Authentication
   - Copy token dari response
   - Paste ke variable `token` di environment

2. **Test Endpoints:**
   - Setiap request sudah configured dengan Authorization header
   - Variables `{{base_url}}` dan `{{token}}` akan substituted automatically

3. **Export Results:**
   - Run collection via Collection Runner
   - Export test results

---

## API Testing Workflow

### Complete User Journey Test

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api"

# 1. Login
echo "=== 1. LOGIN ==="
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member1@yourstory.local",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.id')
echo "Token: $TOKEN"
echo "User ID: $USER_ID"

# 2. Get authenticated user
echo -e "\n=== 2. GET ME ==="
curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Create story
echo -e "\n=== 3. CREATE STORY ==="
STORY_RESPONSE=$(curl -s -X POST $BASE_URL/stories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Amazing Journey",
    "body": "This is my story about learning to code...",
    "is_published": true
  }')

STORY_ID=$(echo $STORY_RESPONSE | jq -r '.data.id')
echo "Story ID: $STORY_ID"

# 4. Get stories
echo -e "\n=== 4. GET STORIES ==="
curl -s -X GET $BASE_URL/stories | jq

# 5. Add comment
echo -e "\n=== 5. CREATE COMMENT ==="
curl -s -X POST $BASE_URL/stories/1/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Great story!"
  }' | jq

# 6. Toggle like
echo -e "\n=== 6. TOGGLE LIKE ==="
curl -s -X POST $BASE_URL/stories/1/likes/toggle \
  -H "Authorization: Bearer $TOKEN" | jq

# 7. Follow user
echo -e "\n=== 7. FOLLOW USER ==="
curl -s -X POST $BASE_URL/users/2/follow \
  -H "Authorization: Bearer $TOKEN" | jq

# 8. Get notifications
echo -e "\n=== 8. GET NOTIFICATIONS ==="
curl -s -X GET $BASE_URL/notifications \
  -H "Authorization: Bearer $TOKEN" | jq

# 9. Logout
echo -e "\n=== 9. LOGOUT ==="
curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq
```

Simpan sebagai `test-workflow.sh` dan jalankan:
```bash
chmod +x test-workflow.sh
./test-workflow.sh
```

---

## Test Data

### Default Seeded Users

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Admin | admin@yourstory.local | password123 | 1 |
| Moderator | moderator@yourstory.local | password123 | 2 |
| Member 1 | member1@yourstory.local | password123 | 3 |
| Member 2 | member2@yourstory.local | password123 | 4 |
| Member 3 | member3@yourstory.local | password123 | 5 |
| Member 4 | member4@yourstory.local | password123 | 6 |
| Member 5 | member5@yourstory.local | password123 | 7 |

### Default Seeded Data

- **Stories:** 15 stories (3 per member)
- **Comments:** 30 comments with nested replies
- **Likes:** 40 likes across stories
- **Followers:** Random follower relationships

---

## Running PHPUnit Tests

### Run All Tests
```bash
docker-compose exec app php artisan test
```

### Run Specific Test Suite
```bash
# Feature tests only
docker-compose exec app php artisan test --testsuite=Feature

# Unit tests only
docker-compose exec app php artisan test --testsuite=Unit
```

### Run Specific Test File
```bash
docker-compose exec app php artisan test tests/Feature/StoryTest.php
```

### Run Specific Test Method
```bash
docker-compose exec app php artisan test --filter testStoryCreation
```

### Generate Coverage Report
```bash
docker-compose exec app php artisan test --coverage

# With detailed HTML report
docker-compose exec app php artisan test --coverage --coverage-html=coverage
```

### Watch Mode (re-run on file change)
```bash
docker-compose exec app php artisan test --watch
```

---

## Troubleshooting

### 1. "Connection refused" Error
```bash
# Check if containers are running
docker-compose ps

# Start containers if needed
docker-compose up -d
```

### 2. "No such table" Error in Tests
```bash
# Ensure migrations are run
docker-compose exec app php artisan migrate --seed
```

### 3. Token Expired/Invalid
```bash
# Login again to get fresh token
curl -X POST http://localhost:8080/api/auth/login ...
```

### 4. Authorization Failed (403)
```bash
# Check user role and permissions
# Admin endpoints require 'admin' role
# Moderator endpoints require 'admin' or 'moderator' role

# Verify via /auth/me
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Rate Limit Exceeded (429)
```bash
# Wait a minute for rate limit to reset
# Rate limits per action type:
# - Login: 5/min
# - Create/Edit Story: 30/min
# - Create Like/Follow: 60/min
# - Notifications: 120/min
```

### 6. Database Issues
```bash
# Reset database completely
docker-compose exec app php artisan migrate:fresh --seed

# Clear cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
```

### 7. Queue Not Processing Notifications
```bash
# Ensure queue worker is running in separate terminal
docker-compose exec app php artisan queue:work

# Or run async (background)
docker-compose exec -d app php artisan queue:work
```

---

## Performance Testing

### Using Apache Bench
```bash
# Test public endpoint
ab -n 100 -c 10 http://localhost:8080/api/stories

# Test with auth token
TOKEN="your-token-here"
ab -n 50 -c 5 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/auth/me
```

### Using wrk
```bash
# Install wrk if needed: brew install wrk

# Load test public endpoint
wrk -t4 -c100 -d30s http://localhost:8080/api/stories

# With custom script for auth
wrk -t4 -c100 -d30s \
  -s script.lua \
  http://localhost:8080/api/auth/me
```

---

## Best Practices

1. **Always Test Errors:**
   ```bash
   # Test with invalid token
   curl -X GET http://localhost:8080/api/auth/me \
     -H "Authorization: Bearer invalid"
   
   # Test with missing auth
   curl -X POST http://localhost:8080/api/stories \
     -H "Content-Type: application/json" \
     -d '{"title": "Test"}'
   ```

2. **Test Edge Cases:**
   ```bash
   # Empty search
   curl -X GET "http://localhost:8080/api/stories?search="
   
   # Invalid pagination
   curl -X GET "http://localhost:8080/api/stories?per_page=1000&page=99999"
   
   # Invalid story ID
   curl -X GET http://localhost:8080/api/stories/99999
   ```

3. **Monitor Response Times:**
   ```bash
   # Time request
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/stories
   ```

4. **Save Test Scripts:**
   - Keep curl commands in version control
   - Document API behavior with examples
   - Update when API changes

---

## Integration Testing

### With Frontend

```javascript
// JavaScript/Fetch Example
const BASE_URL = 'http://localhost:8080/api';

async function loginAndFetch() {
  // Login
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'member1@yourstory.local',
      password: 'password123'
    })
  });

  const { data: { token } } = await loginResponse.json();

  // Get stories
  const storiesResponse = await fetch(`${BASE_URL}/stories`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return storiesResponse.json();
}
```

---

**Last Updated:** January 2024
