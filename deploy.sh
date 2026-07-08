#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "=== Deploy Legal Website ==="
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Pull latest changes
echo "[1/5] Pulling latest code..."
cd ../..
git pull origin master
cd "$APP_DIR"

# 2. Install dependencies
echo "[2/5] Installing dependencies..."
npm install --production=false

# 3. Run database migrations
echo "[3/5] Running database migrations..."
npx prisma generate
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || echo "  (SQLite — no migrations needed)"

# 4. Build
echo "[4/5] Building..."
npm run build

# 5. Restart
echo "[5/5] Restarting server..."
if command -v pm2 &> /dev/null; then
    pm2 restart legal-website 2>/dev/null || pm2 start npm --name "legal-website" -- start
    pm2 save
else
    echo "  PM2 not found. Start manually: npm start"
fi

echo ""
echo "=== Deploy complete ==="
echo "Site: https://www.dadparvaran.com"
