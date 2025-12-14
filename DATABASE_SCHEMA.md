# Database Schema Documentation

Complete schema dan relationship diagram untuk Your Story Community database.

## Table of Contents
- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables Detail](#tables-detail)
- [Relationships](#relationships)
- [Indexes & Performance](#indexes--performance)
- [Data Integrity](#data-integrity)
- [Queries Reference](#queries-reference)

---

## Overview

**Database Type:** MySQL 8.0+
**Total Tables:** 9
**Total Records (Seeded):** 100+
**Soft Delete Support:** Yes (Stories table)

### Table Summary

| Table | Purpose | Records | Type |
|-------|---------|---------|------|
| users | User accounts & roles | 7 | Core |
| stories | User stories/posts | 15 | Core |
| comments | Story comments | 30 | Core |
| likes | Story likes | 40 | Core |
| followers | Follow relationships | 20+ | Core |
| notifications | User notifications | Variable | Core |
| personal_access_tokens | API tokens | Variable | System |
| migrations | Migration tracking | - | System |
| password_resets | Password reset tokens | - | System |

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ firebase_uid    │
│ name            │
│ email (UNIQUE)  │
│ role (ENUM)     │
│ is_suspended    │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:M
         ├──────────────┐
         │              │
         ▼              ▼
    ┌──────────┐   ┌──────────────┐
    │ stories  │   │  followers   │
    ├──────────┤   ├──────────────┤
    │ id (PK)  │   │ user_id (FK) │
    │ user_id  │   │ follower_id  │
    │ title    │   │ created_at   │
    │ body     │   └──────────────┘
    │ pub      │          ▲
    │ likes    │          │
    │ comments │          └── (self-referential M:M)
    │ deleted  │
    │ created  │
    └────┬─────┘
         │
         │ 1:M
         ├─────────────┐
         │             │
         ▼             ▼
    ┌──────────┐  ┌──────────┐
    │ comments │  │  likes   │
    ├──────────┤  ├──────────┤
    │ id (PK)  │  │ id (PK)  │
    │ story_id │  │ story_id │
    │ user_id  │  │ user_id  │
    │ parent_id│  │ created  │
    │ body     │  └──────────┘
    │ depth    │       ▲
    │ created  │       │
    └────┬─────┘       │
         │             │
         │ Self-ref 1:M
         ├─────────────┘
         │
         └── (comments.parent_id -> comments.id)

    ┌──────────────┐
    │notifications │
    ├──────────────┤
    │ id (PK UUID) │
    │ user_id (FK) │
    │ type (ENUM)  │
    │ data (JSON)  │
    │ read_at      │
    │ created_at   │
    └──────────────┘
         ▲
         │ 1:M
         │
         └── From: users
```

---

## Tables Detail

### 1. Users Table

**Purpose:** Store user accounts and authentication data

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
  is_suspended BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| firebase_uid | VARCHAR(255) | YES | NULL | Firebase authentication ID |
| name | VARCHAR(255) | NO | - | User's display name |
| email | VARCHAR(255) | NO | UNIQUE | User's email (unique) |
| password | VARCHAR(255) | YES | NULL | Hashed password |
| role | ENUM | NO | 'member' | Role: admin, moderator, member |
| is_suspended | BOOLEAN | NO | FALSE | Account suspension flag |
| email_verified_at | TIMESTAMP | YES | NULL | Email verification timestamp |
| created_at | TIMESTAMP | YES | NULL | Account creation time |
| updated_at | TIMESTAMP | YES | NULL | Last update time |

**Indexes:**
```sql
CREATE UNIQUE INDEX users_email_unique ON users(email);
CREATE INDEX users_role_index ON users(role);
CREATE INDEX users_is_suspended_index ON users(is_suspended);
```

**Seeded Data:** 7 users
- 1 Admin
- 1 Moderator  
- 5 Members

---

### 2. Stories Table

**Purpose:** Store user-created stories/posts

```sql
CREATE TABLE stories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  likes_count BIGINT DEFAULT 0,
  comments_count BIGINT DEFAULT 0,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| user_id | BIGINT UNSIGNED | NO | FK | Author user ID |
| title | VARCHAR(255) | NO | - | Story title |
| body | LONGTEXT | NO | - | Story content |
| is_published | BOOLEAN | NO | TRUE | Publication status |
| likes_count | BIGINT | NO | 0 | Denormalized like count |
| comments_count | BIGINT | NO | 0 | Denormalized comment count |
| deleted_at | TIMESTAMP | YES | NULL | Soft delete timestamp |
| created_at | TIMESTAMP | YES | NULL | Creation time |
| updated_at | TIMESTAMP | YES | NULL | Last update time |

**Indexes:**
```sql
CREATE INDEX stories_user_id_index ON stories(user_id);
CREATE INDEX stories_is_published_index ON stories(is_published);
CREATE INDEX stories_deleted_at_index ON stories(deleted_at);
CREATE FULLTEXT INDEX stories_title_body_fulltext ON stories(title, body);
```

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Seeded Data:** 15 stories
- 3 per member (5 members × 3 = 15)
- Random published status
- 30 comments distributed
- 40 likes distributed

---

### 3. Comments Table

**Purpose:** Store story comments with nested replies support

```sql
CREATE TABLE comments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  story_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  body LONGTEXT NOT NULL,
  depth INT DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| story_id | BIGINT UNSIGNED | NO | FK | Associated story |
| user_id | BIGINT UNSIGNED | NO | FK | Comment author |
| parent_id | BIGINT UNSIGNED | YES | NULL | Parent comment (for replies) |
| body | LONGTEXT | NO | - | Comment content |
| depth | INT | NO | 0 | Nesting depth (0=root, 1+=reply) |
| created_at | TIMESTAMP | YES | NULL | Creation time |
| updated_at | TIMESTAMP | YES | NULL | Last update time |

**Indexes:**
```sql
CREATE INDEX comments_story_id_index ON comments(story_id);
CREATE INDEX comments_user_id_index ON comments(user_id);
CREATE INDEX comments_parent_id_index ON comments(parent_id);
CREATE INDEX comments_depth_index ON comments(depth);
```

**Foreign Keys:**
- `story_id` → `stories.id` (ON DELETE CASCADE)
- `user_id` → `users.id` (ON DELETE CASCADE)
- `parent_id` → `comments.id` (ON DELETE CASCADE, self-referential)

**Tree Structure Example:**
```
Root Comment (depth=0, parent_id=NULL)
├── Reply 1 (depth=1, parent_id=1)
│   └── Reply to Reply (depth=2, parent_id=2)
├── Reply 2 (depth=1, parent_id=1)
└── Reply 3 (depth=1, parent_id=1)
```

**Seeded Data:** 30 comments
- Mix of root comments (depth=0) and replies
- 2-4 comments per story
- 0-2 replies per comment

---

### 4. Likes Table

**Purpose:** Store story likes (user-story relationships)

```sql
CREATE TABLE likes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  story_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  
  UNIQUE KEY likes_story_user_unique (story_id, user_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| story_id | BIGINT UNSIGNED | NO | FK | Liked story |
| user_id | BIGINT UNSIGNED | NO | FK | User who liked |
| created_at | TIMESTAMP | YES | NULL | Like creation time |

**Indexes:**
```sql
CREATE UNIQUE KEY likes_story_user_unique ON likes(story_id, user_id);
CREATE INDEX likes_user_id_index ON likes(user_id);
```

**Foreign Keys:**
- `story_id` → `stories.id` (ON DELETE CASCADE)
- `user_id` → `users.id` (ON DELETE CASCADE)

**Constraints:**
- Unique constraint ensures one like per user per story
- Toggle like removes/adds the record

**Seeded Data:** 40 likes
- ~3 likes per story average
- Random distribution across users

---

### 5. Followers Table

**Purpose:** Store follow relationships between users

```sql
CREATE TABLE followers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  follower_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  
  UNIQUE KEY followers_unique (user_id, follower_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| user_id | BIGINT UNSIGNED | NO | FK | User being followed |
| follower_id | BIGINT UNSIGNED | NO | FK | User who follows |
| created_at | TIMESTAMP | YES | NULL | Follow creation time |

**Indexes:**
```sql
CREATE UNIQUE KEY followers_unique ON followers(user_id, follower_id);
CREATE INDEX followers_user_id_index ON followers(user_id);
CREATE INDEX followers_follower_id_index ON followers(follower_id);
```

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE) - User being followed
- `follower_id` → `users.id` (ON DELETE CASCADE) - Follower

**Usage Examples:**
```
To get followers of user X:
SELECT * FROM followers WHERE user_id = X

To get users that user X follows:
SELECT * FROM followers WHERE follower_id = X

To check if user A follows user B:
SELECT * FROM followers WHERE user_id = B AND follower_id = A
```

**Seeded Data:** 20+ follower relationships
- Random distribution
- Some mutual follows

---

### 6. Notifications Table

**Purpose:** Store user notifications for comments and likes

```sql
CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(255) NOT NULL,
  data JSON NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(36) | NO | UUID | Primary key (UUID v4) |
| user_id | BIGINT UNSIGNED | NO | FK | Notification recipient |
| type | VARCHAR(255) | NO | - | Notification type |
| data | JSON | NO | - | Notification payload |
| read_at | TIMESTAMP | YES | NULL | Read status timestamp |
| created_at | TIMESTAMP | YES | NULL | Creation time |
| updated_at | TIMESTAMP | YES | NULL | Last update time |

**Indexes:**
```sql
CREATE INDEX notifications_user_id_index ON notifications(user_id);
CREATE INDEX notifications_read_at_index ON notifications(read_at);
CREATE INDEX notifications_created_at_index ON notifications(created_at);
```

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Notification Types:**

1. **comment_created** - Someone commented on your story
   ```json
   {
     "comment_id": 1,
     "story_id": 1,
     "story_title": "My Story",
     "commenter_name": "John",
     "comment_body": "Great story!",
     "comment_depth": 0
   }
   ```

2. **story_liked** - Someone liked your story
   ```json
   {
     "like_id": 1,
     "story_id": 1,
     "story_title": "My Story",
     "liker_name": "Jane",
     "total_likes": 5
   }
   ```

**Seeded Data:** Variable (generated on demand)

---

### 7. Personal Access Tokens Table

**Purpose:** Store API authentication tokens for Sanctum

```sql
CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  abilities JSON,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  INDEX personal_access_tokens_tokenable_index (tokenable_type, tokenable_id)
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| tokenable_type | VARCHAR(255) | NO | - | Model type ('App\\Models\\User') |
| tokenable_id | BIGINT UNSIGNED | NO | - | Model ID (user_id) |
| name | VARCHAR(255) | NO | - | Token name |
| token | VARCHAR(64) | NO | UNIQUE | Hashed token |
| abilities | JSON | NO | - | Token abilities/scopes |
| last_used_at | TIMESTAMP | YES | NULL | Last usage time |
| expires_at | TIMESTAMP | YES | NULL | Token expiration |
| created_at | TIMESTAMP | YES | NULL | Creation time |
| updated_at | TIMESTAMP | YES | NULL | Last update time |

**Indexes:**
```sql
CREATE UNIQUE INDEX personal_access_tokens_token_unique ON personal_access_tokens(token);
CREATE INDEX personal_access_tokens_tokenable_index 
  ON personal_access_tokens(tokenable_type, tokenable_id);
```

**Generated on:** Each successful login

---

### 8. Migrations Table

**Purpose:** Track applied database migrations

```sql
CREATE TABLE migrations (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  migration VARCHAR(255) UNIQUE NOT NULL,
  batch INT NOT NULL
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| migration | VARCHAR(255) | NO | UNIQUE | Migration file name |
| batch | INT | NO | - | Batch number |

**Managed by:** Laravel migrations system

---

### 9. Password Resets Table

**Purpose:** Store password reset tokens

```sql
CREATE TABLE password_resets (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| email | VARCHAR(255) | NO | PK | User email |
| token | VARCHAR(255) | NO | - | Reset token |
| created_at | TIMESTAMP | YES | NULL | Creation time |

**Note:** Currently unused (Firebase handles auth), but available for future use

---

## Relationships

### Relationship Matrix

| From | To | Type | Constraint | Cascade |
|------|-----|------|-----------|---------|
| users → stories | 1:M | Has many | FK user_id | ON DELETE CASCADE |
| users → comments | 1:M | Has many | FK user_id | ON DELETE CASCADE |
| users → likes | 1:M | Has many | FK user_id | ON DELETE CASCADE |
| users → followers | M:M | BelongsToMany | FK user_id, follower_id | ON DELETE CASCADE |
| users → notifications | 1:M | Has many | FK user_id | ON DELETE CASCADE |
| stories → comments | 1:M | Has many | FK story_id | ON DELETE CASCADE |
| stories → likes | 1:M | Has many | FK story_id | ON DELETE CASCADE |
| comments → comments | 1:M | Self-ref | FK parent_id | ON DELETE CASCADE |

### Cascade Delete Examples

```
When User deleted:
├── All their Stories deleted
│   ├── All Comments on those stories deleted
│   └── All Likes on those stories deleted
├── All their Comments deleted
├── All their Likes deleted
├── All their Notifications deleted
└── Follower relationships removed

When Story deleted:
├── All Comments deleted (recursively)
└── All Likes deleted

When Comment deleted:
└── All replies to that comment deleted (recursive)
```

---

## Indexes & Performance

### Index Strategy

**Why Indexes Matter:**
- Faster queries on frequently searched columns
- Foreign key lookups optimized
- Sorting/filtering accelerated
- Full-text search enabled

### Key Indexes

```sql
-- User lookup
CREATE INDEX users_email_unique ON users(email);
CREATE INDEX users_role_index ON users(role);

-- Story filtering
CREATE INDEX stories_user_id_index ON stories(user_id);
CREATE INDEX stories_is_published_index ON stories(is_published);
CREATE INDEX stories_deleted_at_index ON stories(deleted_at);

-- Story search
CREATE FULLTEXT INDEX stories_title_body_fulltext 
  ON stories(title, body);

-- Comment filtering
CREATE INDEX comments_story_id_index ON comments(story_id);
CREATE INDEX comments_parent_id_index ON comments(parent_id);

-- Like lookups
CREATE INDEX likes_user_id_index ON likes(user_id);

-- Follower relationships
CREATE INDEX followers_follower_id_index ON followers(follower_id);

-- Notifications
CREATE INDEX notifications_user_id_index ON notifications(user_id);
CREATE INDEX notifications_read_at_index ON notifications(read_at);
```

### Query Performance Tips

1. **N+1 Query Problem Prevention:**
   ```php
   // Bad: Causes N+1 queries
   $stories = Story::all();
   foreach ($stories as $story) {
       echo $story->user->name; // N queries for user
   }

   // Good: Eager loading
   $stories = Story::with('user')->get(); // 1 query
   foreach ($stories as $story) {
       echo $story->user->name;
   }
   ```

2. **Soft Delete Handling:**
   ```php
   // Excludes deleted stories by default
   Story::all(); // Only published

   // Include deleted
   Story::withTrashed()->get();

   // Only deleted
   Story::onlyTrashed()->get();
   ```

3. **Denormalization Benefits:**
   ```php
   // Fast count without subquery
   $story->likes_count; // Direct column
   
   // Instead of
   $story->likes()->count(); // Subquery
   ```

---

## Data Integrity

### Constraints Enforced

1. **Unique Constraints:**
   - User email must be unique
   - Like per user per story must be unique
   - Follower relationship must be unique

2. **Foreign Key Constraints:**
   - All foreign keys required (except soft deletes)
   - Cascading deletes for data consistency
   - No orphaned records

3. **Check Constraints:**
   ```sql
   -- Role validation (application level)
   ALTER TABLE users 
   ADD CONSTRAINT check_role_valid 
   CHECK (role IN ('admin', 'moderator', 'member'));
   ```

4. **NOT NULL Constraints:**
   - All required fields enforced
   - No partial records

### Transaction Support

Ensure ACID compliance for complex operations:

```php
// Multi-step operation
DB::transaction(function () {
    // Create story
    $story = Story::create($data);
    
    // Create comment
    Comment::create(['story_id' => $story->id, ...]);
    
    // Update count
    $story->increment('comments_count');
    
    // If any fails, all rolled back
});
```

---

## Queries Reference

### Common Query Patterns

#### 1. Get Stories with Comments (Eager Loading)
```sql
SELECT s.*, u.name as author_name, COUNT(DISTINCT c.id) as comment_count
FROM stories s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN comments c ON s.id = c.story_id
WHERE s.is_published = 1 AND s.deleted_at IS NULL
GROUP BY s.id
ORDER BY s.created_at DESC;
```

#### 2. Get Comment Tree for Story
```sql
SELECT c.id, c.body, c.depth, c.parent_id, u.name as author
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.story_id = 1
ORDER BY c.parent_id, c.created_at;
```

#### 3. Get User Followers
```sql
SELECT u.* FROM users u
JOIN followers f ON u.id = f.follower_id
WHERE f.user_id = 1
ORDER BY f.created_at DESC;
```

#### 4. Get User Following
```sql
SELECT u.* FROM users u
JOIN followers f ON u.id = f.user_id
WHERE f.follower_id = 1
ORDER BY f.created_at DESC;
```

#### 5. Get Unread Notifications
```sql
SELECT n.* FROM notifications n
WHERE n.user_id = 1 AND n.read_at IS NULL
ORDER BY n.created_at DESC;
```

#### 6. Search Stories by Title/Body
```sql
SELECT s.* FROM stories s
WHERE MATCH(s.title, s.body) 
AGAINST('+amazing +story' IN BOOLEAN MODE)
AND s.is_published = 1
AND s.deleted_at IS NULL
LIMIT 20;
```

#### 7. Get Story Statistics
```sql
SELECT 
  s.id,
  s.title,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT l.id) as like_count,
  COUNT(DISTINCT f.follower_id) as follower_count
FROM stories s
LEFT JOIN comments c ON s.id = c.story_id
LEFT JOIN likes l ON s.id = l.story_id
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN followers f ON u.id = f.user_id
WHERE s.is_published = 1
GROUP BY s.id;
```

---

## Migration Order

Critical for proper database setup:

1. `0001_01_01_000000_create_users_table` - Users first
2. `0001_01_01_000001_create_cache_table` - Laravel cache
3. `0001_01_01_000002_create_jobs_table` - Laravel jobs
4. `2024_01_15_000003_create_followers_table` - User relationships
5. `2025_12_14_000003_create_stories_table` - User stories
6. `2025_12_14_000004_create_comments_table` - Story comments
7. `2025_12_14_000005_create_likes_table` - Story likes
8. `2025_12_14_000004_add_soft_delete_to_stories` - **MUST RUN AFTER create_stories**
9. `2025_12_14_000006_create_notifications_table` - Notifications
10. `2025_12_14_142312_create_personal_access_tokens_table` - Sanctum tokens

⚠️ **CRITICAL:** Soft delete migration must run AFTER create_stories (timestamp-based ordering)

---

## Database Maintenance

### Regular Tasks

```bash
# Optimize tables
OPTIMIZE TABLE users, stories, comments, likes, followers, notifications;

# Analyze table statistics
ANALYZE TABLE users, stories, comments, likes, followers;

# Check table integrity
CHECK TABLE users, stories, comments, likes, followers, notifications;

# Repair if corrupted
REPAIR TABLE users;
```

### Backup Strategy

```bash
# Full backup
mysqldump -u root -p yourstory_db > backup_$(date +%Y%m%d).sql

# With gzip compression
mysqldump -u root -p yourstory_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Scheduled daily backup
0 2 * * * /usr/bin/mysqldump -u root -p yourstory_db | gzip > /backups/backup_$(date +\%Y\%m\%d).sql.gz
```

---

## Database Connection Information

### Development (Docker)

```
Host: localhost
Port: 3306
Database: yourstory_db
User: yourstory_user
Password: yourstory_password
```

### Environment Variables (.env)

```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=yourstory_db
DB_USERNAME=yourstory_user
DB_PASSWORD=yourstory_password
```

### Connection String

```
mysql://yourstory_user:yourstory_password@localhost:3306/yourstory_db
```

---

**Last Updated:** January 2024
**Schema Version:** 1.0
**Status:** ✅ Production Ready
