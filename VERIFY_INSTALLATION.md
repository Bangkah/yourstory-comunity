# Verify Installation Checklist

Quick verification that your Your Story Community backend is properly set up and ready to use.

## ✅ Pre-Installation Checklist

- [ ] Docker & Docker Compose installed (`docker --version`)
- [ ] At least 4GB RAM available
- [ ] Ports 8080, 3306, 6379 available
- [ ] Project cloned/downloaded
- [ ] Terminal open in project directory

## ✅ Installation Verification

### 1. Docker Containers Running
```bash
docker-compose ps
```

Expected output showing all containers "Up":
- [ ] app container running
- [ ] nginx container running
- [ ] mysql container running
- [ ] redis container running

### 2. PHP Dependencies
```bash
docker-compose exec app composer install
```

**Verify:**
- [ ] No errors
- [ ] vendor/ directory created

### 3. Environment Setup
```bash
docker-compose exec app php artisan key:generate
```

**Verify:**
- [ ] "Application key set successfully" message
- [ ] No errors

### 4. Database Connection
```bash
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo()
>>> exit
```

**Verify:**
- [ ] Returns PDO connection object
- [ ] No connection refused errors

### 5. Database Migrations
```bash
docker-compose exec app php artisan migrate --seed
```

**Verify:**
- [ ] All 9 migrations completed
- [ ] No SQLSTATE errors
- [ ] Seeding completed

### 6. Queue Worker
```bash
docker-compose exec app php artisan queue:work
```

**Verify:**
- [ ] "Started processing jobs" appears
- [ ] Worker waiting for jobs

## ✅ API Verification

### 1. Health Check
```bash
curl http://localhost:8080
```

**Verify:**
- [ ] Returns `{"status":"ok"}`

### 2. Get Stories (Public API)
```bash
curl http://localhost:8080/api/stories
```

**Verify:**
- [ ] Returns JSON with success: true
- [ ] Contains 15 stories (seeded data)
- [ ] Has pagination metadata

### 3. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourstory.local","password":"password123"}'
```

**Verify:**
- [ ] Returns token (e.g., "1|...")
- [ ] User data includes role: "admin"

### 4. Authenticated Request
```bash
# Use TOKEN from login above
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- [ ] Returns authenticated user data
- [ ] Correct user ID matches

## ✅ Database Verification

### 1. User Count
```bash
docker-compose exec app php artisan tinker
>>> User::count()
>>> exit
```

**Verify:**
- [ ] Returns 7 (1 admin, 1 moderator, 5 members)

### 2. Story Count
```bash
docker-compose exec app php artisan tinker
>>> Story::count()
>>> exit
```

**Verify:**
- [ ] Returns 15

### 3. Comment Count
```bash
docker-compose exec app php artisan tinker
>>> Comment::count()
>>> exit
```

**Verify:**
- [ ] Returns 30

### 4. Tables Exist
```bash
docker-compose exec mysql mysql -u yourstory_user -p yourstory_db -e "SHOW TABLES;"
```

**Verify:**
- [ ] All 9 tables listed (users, stories, comments, likes, followers, notifications, personal_access_tokens, migrations, password_resets)

## ✅ Testing Verification

### Run Tests
```bash
docker-compose exec app php artisan test
```

**Verify:**
- [ ] 25+ tests passing
- [ ] Total test count shown
- [ ] Command completes successfully

## ✅ Documentation Verification

**Verify all documentation files exist:**
- [ ] README.md
- [ ] SETUP_GUIDE.md
- [ ] BACKEND_DOCUMENTATION.md
- [ ] TESTING_GUIDE.md
- [ ] DATABASE_SCHEMA.md
- [ ] ARCHITECTURE.md
- [ ] DOCUMENTATION_INDEX.md
- [ ] postman_collection.json
- [ ] postman_environment.json

## ✅ Final Status

If all checks above pass:

**✅ Your backend is production-ready!**

### Next Steps:
1. Read [README.md](README.md)
2. Review [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
3. Test API with [TESTING_GUIDE.md](TESTING_GUIDE.md)
4. Start frontend development

---

**Verification Time:** 5-10 minutes  
**Difficulty:** Easy ✅

All systems go! 🚀
