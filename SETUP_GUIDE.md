# Setup & Installation Guide

Complete guide untuk setup dan menjalankan Your Story Community backend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start (Recommended)](#quick-start-recommended)
- [Manual Setup](#manual-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Docker & Docker Compose**
   - Download: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Verify installation:
     ```bash
     docker --version
     docker-compose --version
     ```

2. **Git** (optional, but recommended)
   ```bash
   git --version
   ```

3. **Browser** for testing API

### System Requirements

- **OS:** Linux, macOS, or Windows (with WSL2)
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk:** 5GB free space
- **Ports:** 8080, 3306, 6379 available

---

## Quick Start (Recommended)

The easiest way to get started using Docker Compose.

### Step 1: Clone Repository

```bash
cd ~/Dokumen/myproject/yourstoryComunity
```

Or if not already cloned:
```bash
git clone <repository-url> yourstoryComunity
cd yourstoryComunity
```

### Step 2: Start Docker Containers

```bash
# Start all services in background
docker-compose up -d

# Or with logs visible
docker-compose up
```

This starts:
- **Laravel App** (port 8080)
- **Nginx** (web server)
- **MySQL** (database, port 3306)
- **Redis** (cache, port 6379)

### Step 3: Install Dependencies

```bash
# Install PHP dependencies
docker-compose exec app composer install

# Install JavaScript dependencies (optional)
docker-compose exec app npm install
```

### Step 4: Setup Environment

```bash
# Copy environment file
docker-compose exec app cp .env.example .env

# Generate app key
docker-compose exec app php artisan key:generate

# Generate JWT secret (optional)
docker-compose exec app php artisan jwt:secret
```

### Step 5: Setup Database

```bash
# Run migrations
docker-compose exec app php artisan migrate

# Seed test data
docker-compose exec app php artisan db:seed
```

### Step 6: Start Queue Worker (for notifications)

In a new terminal:
```bash
docker-compose exec app php artisan queue:work
```

### Step 7: Verify Installation

```bash
# Test health endpoint
curl http://localhost:8080

# Output should be:
# {"status":"ok"}
```

### You're Done! 🎉

- **API Base URL:** http://localhost:8080/api
- **Test Credentials:** See [Test Data](#test-data) section

---

## Manual Setup

For development without Docker (requires PHP 8.4+ locally).

### Step 1: Install PHP & Dependencies

#### macOS
```bash
# Install PHP 8.4
brew install php@8.4
brew install composer
brew install mysql@8.0

# Link PHP
brew link php@8.4
```

#### Ubuntu/Debian
```bash
# Add PHP repository
sudo add-apt-repository ppa:ondrej/php
sudo apt update

# Install PHP 8.4 and extensions
sudo apt install php8.4 \
  php8.4-cli \
  php8.4-common \
  php8.4-mysql \
  php8.4-xml \
  php8.4-curl \
  php8.4-gd \
  php8.4-mbstring \
  php8.4-json \
  php8.4-bcmath \
  php8.4-tokenizer

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install mysql-server
```

### Step 2: Install Project Dependencies

```bash
cd yourStoryCommunity

# Install PHP packages
composer install

# Install JavaScript packages (optional)
npm install
```

### Step 3: Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env for local MySQL
nano .env
```

Update these values:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=yourstory_db
DB_USERNAME=root
DB_PASSWORD=
```

### Step 4: Generate Keys

```bash
# Generate app key
php artisan key:generate

# Generate JWT secret (optional)
php artisan jwt:secret
```

### Step 5: Create Database

```bash
# Login to MySQL
mysql -u root

# Create database and user
CREATE DATABASE yourstory_db;
CREATE USER 'yourstory_user'@'localhost' IDENTIFIED BY 'yourstory_password';
GRANT ALL PRIVILEGES ON yourstory_db.* TO 'yourstory_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Update .env:
```env
DB_USERNAME=yourstory_user
DB_PASSWORD=yourstory_password
```

### Step 6: Run Migrations & Seeders

```bash
# Create tables
php artisan migrate

# Seed test data
php artisan db:seed
```

### Step 7: Start Development Server

```bash
# Terminal 1: Laravel dev server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:work

# Terminal 3 (optional): Build assets
npm run dev
```

Application runs at: http://localhost:8000

---

## Environment Configuration

### Environment File (.env)

Copy `.env.example` and configure:

```env
# App Configuration
APP_NAME="Your Story Community"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8080

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=yourstory_db
DB_USERNAME=yourstory_user
DB_PASSWORD=yourstory_password

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379

# Mail (optional)
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@yourstory.local

# Firebase (optional)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...

# API Configuration
API_PAGINATION_PER_PAGE=20
API_RATE_LIMIT_LOGIN=5
API_RATE_LIMIT_STORY=30
API_RATE_LIMIT_LIKE=60
API_RATE_LIMIT_NOTIFICATION=120
```

### Production Environment

```env
APP_DEBUG=false
APP_ENV=production

# HTTPS required
APP_URL=https://yourstory.com

# Secure database
DB_HOST=secure-mysql-host
DB_USERNAME=secure_user
DB_PASSWORD=strong_password_here

# Use file-based cache for production
CACHE_DRIVER=file

# Use database for sessions
SESSION_DRIVER=database

# Configure real mail service
MAIL_MAILER=postmark
MAIL_FROM_ADDRESS=noreply@yourstory.com
POSTMARK_SECRET=...

# Enable monitoring
SENTRY_LARAVEL_DSN=https://...@sentry.io/...
```

---

## Database Setup

### Automatic Setup (Recommended)

```bash
# All-in-one command
docker-compose exec app php artisan migrate --seed
```

This:
1. Creates all tables (9 tables)
2. Adds indexes
3. Seeds test data (7 users, 15 stories, 30 comments, etc.)

### Manual Database Setup

#### Step 1: Run Migrations

```bash
# Show pending migrations
docker-compose exec app php artisan migrate:status

# Run migrations
docker-compose exec app php artisan migrate

# Rollback to previous step (if needed)
docker-compose exec app php artisan migrate:rollback

# Rollback all (fresh start)
docker-compose exec app php artisan migrate:fresh
```

#### Step 2: Seed Test Data

```bash
# Run all seeders
docker-compose exec app php artisan db:seed

# Run specific seeder
docker-compose exec app php artisan db:seed --class=UserSeeder

# Fresh migration + seed (clean slate)
docker-compose exec app php artisan migrate:fresh --seed
```

#### Step 3: Verify Database

```bash
# Connect to MySQL
docker-compose exec mysql mysql -u yourstory_user -p yourstory_db

# List tables
SHOW TABLES;

# Check users
SELECT id, name, email, role FROM users;

# Exit
EXIT;
```

### Database Tables Created

| Table | Purpose | Records |
|-------|---------|---------|
| users | User accounts | 7 |
| stories | Stories/posts | 15 |
| comments | Comments | 30 |
| likes | Likes | 40 |
| followers | Follow relationships | 20+ |
| notifications | Notifications | Variable |
| personal_access_tokens | API tokens | Auto |
| migrations | Migration tracking | Auto |
| password_resets | Password resets | Auto |

---

## Running the Application

### Docker Compose

#### Start Services

```bash
# Start in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up app nginx mysql
```

#### Common Commands

```bash
# View logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f mysql
docker-compose logs -f nginx

# Execute command in container
docker-compose exec app php artisan tinker

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
docker-compose up -d

# Shell access
docker-compose exec app bash
```

### Manual (Without Docker)

```bash
# Terminal 1: Development server
php artisan serve

# Terminal 2: Queue worker (for async notifications)
php artisan queue:work

# Terminal 3: Build assets (optional)
npm run dev

# Terminal 4: Tinker REPL (optional)
php artisan tinker
```

### Access Points

- **API:** http://localhost:8080/api
- **Web:** http://localhost:8080 (returns JSON health check)
- **Nginx:** http://localhost:8080
- **MySQL:** localhost:3306

---

## Verification

### Health Check

```bash
# Quick health check
curl http://localhost:8080/api/health

# Should return:
# {"status":"ok"}
```

### Test Database Connection

```bash
docker-compose exec app php artisan tinker

# In tinker:
>>> DB::connection()->getPdo()
# Output: Shows DB connection object

>>> User::count()
# Should return: 7 (number of seeded users)

>>> Story::count()
# Should return: 15 (number of seeded stories)

>>> exit
```

### Test API Endpoint

```bash
# Get all stories (public endpoint)
curl http://localhost:8080/api/stories

# Login and get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourstory.local",
    "password": "password123"
  }'

# Response includes token, save it:
TOKEN="1|abcdef..."

# Test authenticated endpoint
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Run Test Suite

```bash
# Run all tests
docker-compose exec app php artisan test

# Expected output:
# Tests:  25 passed, 4 failed, 2 skipped
# Duration: ~1s

# Run specific test
docker-compose exec app php artisan test tests/Feature/AuthTest.php

# Run with coverage
docker-compose exec app php artisan test --coverage
```

### Test Data Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yourstory.local | password123 |
| Moderator | moderator@yourstory.local | password123 |
| Member | member1@yourstory.local | password123 |
| Member | member2@yourstory.local | password123 |

---

## Project Structure

```
yourStoryCommunity/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── ApiController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── StoryController.php
│   │   │   │   ├── CommentController.php
│   │   │   │   ├── LikeController.php
│   │   │   │   ├── FollowerController.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   └── Admin/
│   │   │   └── Controller.php
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Story.php
│   │   ├── Comment.php
│   │   ├── Like.php
│   │   └── Notification.php
│   ├── Events/
│   │   ├── CommentCreated.php
│   │   └── StoryLiked.php
│   ├── Listeners/
│   │   ├── SendCommentNotification.php
│   │   └── SendLikeNotification.php
│   ├── Traits/
│   │   └── ApiResponse.php
│   └── Providers/
├── routes/
│   ├── api.php
│   ├── web.php
│   └── console.php
├── database/
│   ├── migrations/
│   └── seeders/
├── tests/
│   ├── Feature/
│   └── Unit/
├── config/
├── storage/
├── public/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── composer.json
├── package.json
└── README.md
```

---

## Troubleshooting

### Docker Issues

#### "Port already in use"

```bash
# Check what's using the port
lsof -i :8080
lsof -i :3306
lsof -i :6379

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8081:80"  # Changed from 8080 to 8081
```

#### "Cannot connect to database"

```bash
# Check if MySQL is running
docker-compose ps

# Restart MySQL
docker-compose restart mysql

# Check MySQL logs
docker-compose logs mysql

# Rebuild containers
docker-compose down
docker-compose up -d
```

#### "Permission denied" errors

```bash
# Fix file permissions
docker-compose exec app chown -R www-data:www-data /var/www/html
docker-compose exec app chmod -R 755 /var/www/html/storage
docker-compose exec app chmod -R 755 /var/www/html/bootstrap/cache
```

### Database Issues

#### "No such table" error

```bash
# Run migrations
docker-compose exec app php artisan migrate

# Or fresh start
docker-compose exec app php artisan migrate:fresh --seed
```

#### Cannot connect to database

```bash
# Check database credentials in .env
docker-compose exec app cat .env | grep DB_

# Test connection
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo()

# Reset database
docker-compose exec mysql mysql -u root -proot < /dev/null
# Or use credentials from docker-compose.yml
```

### Laravel Issues

#### "No application encryption key has been specified"

```bash
# Generate app key
docker-compose exec app php artisan key:generate
```

#### "Class not found" error

```bash
# Autoload classes
docker-compose exec app composer dump-autoload

# Or fresh install
docker-compose exec app composer install
```

#### Clear caches

```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan route:clear
```

### API Issues

#### Getting 500 errors

```bash
# Check logs
docker-compose logs app

# Enable debug mode in .env
APP_DEBUG=true

# Check database connection
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo()
```

#### Rate limit exceeded

```bash
# Wait 1 minute for limits to reset
# Or modify in routes/api.php
```

#### Authentication failing

```bash
# Clear sessions/tokens
docker-compose exec app php artisan cache:clear

# Test with curl using saved token
TOKEN="1|abc123..."
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/auth/me
```

### Performance Issues

#### Slow queries

```bash
# Enable query logging in .env
LOG_CHANNEL=stack
DEBUGBAR_ENABLED=true

# Check slow logs
docker-compose logs app | grep "Slow"
```

#### High memory usage

```bash
# Check PHP memory limit
docker-compose exec app php -i | grep "memory_limit"

# Increase in .env if needed
# Modify php.ini in docker/ folder
```

---

## Development Workflow

### Making Code Changes

```bash
# 1. Make changes to code
nano app/Http/Controllers/Api/StoryController.php

# 2. Test changes
docker-compose exec app php artisan test

# 3. Run specific test
docker-compose exec app php artisan test --filter testStoryCreation

# 4. Check code style
docker-compose exec app ./vendor/bin/pint

# 5. Clear cache
docker-compose exec app php artisan cache:clear
```

### Running Commands

```bash
# Any artisan command
docker-compose exec app php artisan <command>

# Examples:
docker-compose exec app php artisan tinker
docker-compose exec app php artisan make:model Story
docker-compose exec app php artisan make:controller StoryController
docker-compose exec app php artisan queue:work
docker-compose exec app php artisan schedule:run
```

### Accessing Services

```bash
# PHP shell
docker-compose exec app bash

# MySQL shell
docker-compose exec mysql mysql -u yourstory_user -p yourstory_db

# Laravel tinker (REPL)
docker-compose exec app php artisan tinker
```

---

## Next Steps

1. **Verify Installation:** Run verification steps above
2. **Read Documentation:** See [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)
3. **Test API:** Use [TESTING_GUIDE.md](./TESTING_GUIDE.md)
4. **Run Tests:** Execute `php artisan test`
5. **Explore Code:** Check [app/](./app/) directory structure
6. **Frontend Development:** Ready for Next.js/React frontend

---

## Support & Troubleshooting

- Check logs: `docker-compose logs -f app`
- Re-run migrations: `docker-compose exec app php artisan migrate:fresh --seed`
- Rebuild containers: `docker-compose down && docker-compose up -d`
- View documentation: Check BACKEND_DOCUMENTATION.md
- Test endpoints: Use TESTING_GUIDE.md or Postman collection

---

**Last Updated:** January 2024
**Status:** ✅ Production Ready
**Maintenance:** Regular database backups recommended
