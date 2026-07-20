#!/bin/bash
# استقرار دادپروران — روی خود سرور اجرا می‌شود.
#
# این اسکریپت عمداً هیچ تغییری روی اسکیمای دیتابیس اعمال نمی‌کند.
# نسخه‌ی قبلی `prisma db push --accept-data-loss` را به‌صورت fallback خاموش اجرا
# می‌کرد که یعنی امکان حذف بی‌صدای داده. تغییر اسکیما کاری آگاهانه است، نه
# عارضه‌ی جانبی یک deploy — رویه‌اش در docs/DEPLOY.md آمده است.
#
# انتقال کد با SCP انجام می‌شود، نه git: سرور به GitHub دسترسی ندارد.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

TS="$(date +%Y%m%d-%H%M%S)"
HEALTH_URL="${HEALTH_URL:-https://www.dadparvaran.com}"

echo "=== Deploy dadparvaran — $TS ==="

# ── ۱) بکاپ دیتابیس ────────────────────────────────────────────────────────
# اولین قدم و بدون استثنا: اگر ادامه‌ی کار خراب شد، این نقطه‌ی برگشت است.
DB_FILE="prisma/dev.db"
if [ -f "$DB_FILE" ]; then
  BACKUP="prisma/dev.db.backup-deploy-$TS"
  cp "$DB_FILE" "$BACKUP"
  echo "[1/6] backup: $BACKUP ($(du -h "$BACKUP" | cut -f1))"
else
  echo "[1/6] WARNING: $DB_FILE not found — skipping backup"
fi

# ── ۲) وابستگی‌ها ──────────────────────────────────────────────────────────
echo "[2/6] installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  echo "  no package-lock.json — falling back to npm install"
  npm install --no-audit --no-fund
fi

# ── ۳) کلاینت Prisma ───────────────────────────────────────────────────────
# فقط تولید کلاینت؛ به دیتابیس دست نمی‌زند.
echo "[3/6] generating prisma client..."
npx prisma generate

# ── ۴) هشدار ناهماهنگی اسکیما ──────────────────────────────────────────────
# اعمال نمی‌کند، فقط خبر می‌دهد. اگر اینجا هشدار دیدید، docs/DEPLOY.md را بخوانید.
echo "[4/6] checking schema drift..."
if ! npx prisma migrate status >/tmp/migrate-status.txt 2>&1; then
  echo "  ⚠️  اسکیمای دیتابیس با schema.prisma هماهنگ نیست."
  echo "  ⚠️  این deploy اسکیما را تغییر نمی‌دهد. برای هم‌ترازسازی docs/DEPLOY.md را ببینید."
  sed 's/^/      /' /tmp/migrate-status.txt | head -20
else
  echo "  schema in sync"
fi

# ── ۵) بیلد و ری‌استارت ────────────────────────────────────────────────────
echo "[5/6] building..."
npm run build

echo "       restarting..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart legal-website || pm2 start npm --name "legal-website" -- start
  pm2 save
else
  echo "  pm2 not found — start manually: npm start"
fi

# ── ۶) health check ────────────────────────────────────────────────────────
# بدون این مرحله ممکن است deploy «موفق» اعلام شود در حالی که سایت پایین است.
echo "[6/6] health check..."
sleep 5
FAILED=0
for path in "/" "/robots.txt"; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 -L "$HEALTH_URL$path" || echo 000)"
  if [ "$CODE" = "200" ]; then
    echo "  OK   $path ($CODE)"
  else
    echo "  FAIL $path ($CODE)"
    FAILED=1
  fi
done

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "=== DEPLOY FAILED health check ==="
  echo "بررسی کنید: pm2 logs legal-website --lines 50"
  [ -n "${BACKUP:-}" ] && echo "بکاپ دیتابیس: $BACKUP"
  exit 1
fi

echo ""
echo "=== Deploy complete — $HEALTH_URL ==="
