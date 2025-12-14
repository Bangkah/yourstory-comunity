#!/usr/bin/env bash
set -euo pipefail

# Maintenance script for Laravel + Vite project
# Usage: ./scripts/maintenance.sh

echo "[1/6] Clearing Laravel caches..."
php artisan cache:clear || true
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "[2/6] Running database migrations..."
php artisan migrate --force || true

echo "[3/6] Optimizing and caching configs/routes/views..."
php artisan optimize || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "[4/6] Fixing permissions for storage and cache..."
# Ensure required directories exist
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views storage/app/public || true
# On host systems, www-data may not exist; fallback to current user
if id -u www-data >/dev/null 2>&1; then
  chown -R www-data:www-data storage bootstrap/cache || true
else
  echo "www-data user not found; skipping chown."
fi
chmod -R 775 storage bootstrap/cache || true
ls -ld storage bootstrap/cache storage/logs || true

echo "[5/6] Building frontend assets..."
npm run build || true

echo "[6/6] Docker health check (if docker-compose present)..."
if [ -f docker-compose.yml ]; then
  docker compose ps || true
  docker compose logs --tail=50 app || true
fi

echo "Maintenance complete."
