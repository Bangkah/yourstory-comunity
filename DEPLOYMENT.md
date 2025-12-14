# Deployment Guide

This guide covers deploying Your Story Community to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Database Migration](#database-migration)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass locally (`php artisan test`)
- [ ] All code follows PSR-12 standards
- [ ] No debug mode enabled (`APP_DEBUG=false`)
- [ ] Database backup taken
- [ ] Environment variables reviewed
- [ ] SSL certificates prepared
- [ ] Domain configured and DNS updated
- [ ] Email credentials verified
- [ ] Rate limiting configured
- [ ] CORS allowed domains set
- [ ] Database connection optimized
- [ ] Redis configured for cache/queue
- [ ] Log rotation configured
- [ ] Monitoring tools set up

## Environment Setup

### Production Environment Variables

Create `.env` with production values:

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourstory.com

# Database - Production
DB_CONNECTION=mysql
DB_HOST=prod-db-host
DB_PORT=3306
DB_DATABASE=yourstory_prod
DB_USERNAME=yourstory_user
DB_PASSWORD=strong_password_here
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=prod-redis-host
REDIS_PASSWORD=strong_redis_password
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailer.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourstory.com
MAIL_FROM_NAME="Your Story"

# Security
SANCTUM_STATEFUL_DOMAINS=yourstory.com
SESSION_DOMAIN=yourstory.com
TRUSTED_PROXIES=*
TRUSTED_HEADERS=X-FORWARDED_FOR,X-FORWARDED_PROTO,X-FORWARDED_PORT

# Firebase (if using notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_api_key
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

## Docker Deployment

### 1. Build Production Image

```bash
# Build the application image
docker build -f Dockerfile -t yourstory:latest .

# Tag for registry (e.g., Docker Hub, ECR)
docker tag yourstory:latest bangkah/yourstory:latest
docker push bangkah/yourstory:latest
```

### 2. Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  app:
    image: bangkah/yourstory:latest
    restart: always
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    volumes:
      - storage:/app/storage
      - logs:/app/storage/logs
    depends_on:
      - mysql
      - redis
    networks:
      - yourstory
    healthcheck:
      test: ["CMD", "php", "-r", "file_exists('/app/storage/logs/laravel.log')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
      - storage:/app/storage
    depends_on:
      - app
    networks:
      - yourstory

  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: yourstory_prod
      MYSQL_USER: yourstory_user
      MYSQL_PASSWORD: strong_password
      MYSQL_ROOT_PASSWORD: root_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf
    networks:
      - yourstory
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - yourstory
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
  redis_data:
  storage:
  logs:

networks:
  yourstory:
    driver: bridge
```

### 3. Deploy Stack

```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f app
```

## Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y php8.4 php8.4-{curl,dom,fpm,gd,mbstring,mysql,opcache,redis} \
                     nginx mysql-server redis-server composer git
```

### 2. Application Setup

```bash
# Clone repository
cd /var/www
git clone https://github.com/Bangkah/yourstory-comunity.git
cd yourstory-comunity

# Set permissions
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 storage bootstrap/cache

# Install dependencies
composer install --no-dev --optimize-autoloader

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan storage:link
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/yourstory.com`:

```nginx
server {
    listen 80;
    server_name yourstory.com www.yourstory.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourstory.com www.yourstory.com;

    ssl_certificate /etc/letsencrypt/live/yourstory.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourstory.com/privkey.pem;

    root /var/www/yourstory-comunity/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ /\.env {
        deny all;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/yourstory.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate

```bash
# Using Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourstory.com -d www.yourstory.com
```

## Database Migration

### 1. Backup Current Database

```bash
# Docker
docker-compose exec mysql mysqldump -u yourstory_user -p yourstory_db > backup.sql

# Manual
mysqldump -u root -p yourstory_db > backup.sql
```

### 2. Run Migrations

```bash
php artisan migrate --force
```

### 3. Seed Production Data (Optional)

```bash
php artisan db:seed --force
```

## Security Configuration

### 1. File Permissions

```bash
sudo chown -R www-data:www-data /var/www/yourstory-comunity
sudo chmod -R 755 /var/www/yourstory-comunity
sudo chmod -R 775 /var/www/yourstory-comunity/storage
sudo chmod -R 775 /var/www/yourstory-comunity/bootstrap/cache
```

### 2. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. SSH Security

```bash
# Disable root login
sudo sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password authentication
sudo sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

sudo systemctl restart sshd
```

## Monitoring & Logging

### 1. Application Logs

```bash
# Monitor Laravel logs
tail -f storage/logs/laravel.log

# Archive old logs
find storage/logs -name "*.log" -mtime +7 -delete
```

### 2. Health Check

```bash
curl https://yourstory.com/api/health
```

### 3. Uptime Monitoring

Set up monitoring with tools like:
- Uptime Robot
- Pingdom
- New Relic
- Datadog

### 4. Performance Monitoring

```bash
# MySQL slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

# Check slow queries
tail -f /var/log/mysql/slow.log
```

## Rollback Procedures

### 1. Database Rollback

```bash
# Rollback last migration
php artisan migrate:rollback

# Rollback all
php artisan migrate:reset

# Restore from backup
mysql -u root -p yourstory_db < backup.sql
```

### 2. Application Rollback

```bash
# Using Git
git log --oneline
git revert <commit-hash>
git push origin main

# Restart application
php artisan cache:clear
sudo systemctl restart php8.4-fpm
```

### 3. Docker Rollback

```bash
# Switch to previous image
docker-compose -f docker-compose.prod.yml pull bangkah/yourstory:previous
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app
tail -f storage/logs/laravel.log

# Check permissions
ls -la storage bootstrap/cache

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

### High CPU Usage

```bash
# Check processes
top

# Check Redis
redis-cli INFO stats

# Monitor queues
php artisan queue:failed
php artisan queue:retry all
```

### Database Connection Issues

```bash
# Test connection
php artisan tinker
>>> DB::select('select 1')

# Check MySQL status
sudo systemctl status mysql

# Test MySQL
mysql -u yourstory_user -p yourstory_db -e "SELECT 1"
```

### Out of Memory

```bash
# Check memory usage
free -h
df -h

# Increase PHP memory
php -i | grep memory_limit

# Update php.ini
memory_limit = 512M
```

---

## Support

For deployment issues:
1. Check logs: `storage/logs/laravel.log`
2. Review TROUBLESHOOTING section
3. Check GitHub issues
4. Contact support

**Production Deployment Checklist:**
- [ ] All tests pass
- [ ] Environment variables set
- [ ] Database backed up
- [ ] SSL configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Team trained on deployment

---

**Last Updated**: 2024-12-15  
**Version**: 1.0  
**Status**: Active
