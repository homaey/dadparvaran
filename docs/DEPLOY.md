# رویه استقرار

اطلاعات اتصال (میزبان، کاربر، مسیر کلید) در `docs/SERVER.private.md` است — آن فایل کامیت نمی‌شود.

## چرا SCP و نه git

سرور به GitHub دسترسی ندارد (شبکه ایران). `git pull` روی سرور کار نمی‌کند. نسخه‌ی قدیمی `deploy.sh` با `git pull` شروع می‌شد که یعنی هرگز نمی‌توانست کامل اجرا شود.

## استقرار عادی (فقط تغییر کد)

از سیستم خودتان، فایل‌های تغییرکرده را منتقل کنید:

```bash
scp -i <KEY> src/path/to/changed.tsx <USER>@<HOST>:/var/www/dadparvaran/src/path/to/changed.tsx
```

> مسیرهای دارای route group مثل `(public)` را در PowerShell نمی‌توان مستقیم داد — از Bash استفاده کنید.

سپس روی سرور:

```bash
cd /var/www/dadparvaran && ./deploy.sh
```

اسکریپت به‌ترتیب: بکاپ دیتابیس → نصب وابستگی‌ها → تولید کلاینت Prisma → **هشدار** ناهماهنگی اسکیما → بیلد → ری‌استارت → health check. اگر health check رد شود، با کد خطا خارج می‌شود و مسیر بکاپ را چاپ می‌کند.

## تغییر اسکیمای دیتابیس

**`deploy.sh` عمداً اسکیما را تغییر نمی‌دهد.** این کار باید آگاهانه و جداگانه انجام شود.

دلیل: نسخه‌ی قبلی اسکریپت این خط را داشت —

```bash
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || echo "..."
```

هر سه بخش خطا را می‌بلعیدند و در بدترین حالت `--accept-data-loss` بی‌صدا داده حذف می‌کرد.

### وضعیت فعلی که باید بدانید

دیتابیس پروداکشن **جدول `_prisma_migrations` ندارد** — یعنی هرگز با migration ساخته نشده و `prisma migrate deploy` روی آن کار نخواهد کرد. ضمناً اسکیمای سرور از مخزن عقب است و چند جدول را ندارد.

تا وقتی این وضعیت اصلاح نشده، **هیچ تغییر اسکیمایی را خودکار اعمال نکنید.** رویه‌ی دستی و آگاهانه:

```bash
# ۱) بکاپ صریح
cp prisma/dev.db prisma/dev.db.backup-manual-$(date +%Y%m%d-%H%M%S)

# ۲) انتقال اسکیمای جدید (این فایل در deploy عادی منتقل نمی‌شود)
#    از سیستم خودتان: scp prisma/schema.prisma <USER>@<HOST>:/var/www/dadparvaran/prisma/

# ۳) ببینید قرار است چه اتفاقی بیفتد — بدون اعمال
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script

# ۴) فقط پس از بررسی خروجی بالا و اطمینان از اینکه چیزی حذف نمی‌شود:
npx prisma db push          # هرگز با --accept-data-loss
```

اگر `db push` بدون آن فلگ شکست خورد، یعنی واقعاً داده‌ای در خطر است — این خطا را دور نزنید، علتش را بررسی کنید.

## قواعد

- **بکاپ قبل از هر تغییر داده یا اسکیما** — استثنا ندارد.
- **`--accept-data-loss` ممنوع.**
- **`schema.prisma` در deploy عادی منتقل نمی‌شود** — انتقالش یعنی قصد تغییر اسکیما دارید، پس رویه‌ی بالا را دنبال کنید.
- health check شکست‌خورده یعنی deploy شکست خورده؛ آن را نادیده نگیرید.

## عیب‌یابی

| نشانه | بررسی |
|-------|-------|
| health check رد می‌شود | `pm2 logs legal-website --lines 50` |
| بیلد درباره‌ی فونت‌ها هشدار می‌دهد | طبیعی است — سرور به `fonts.googleapis.com` دسترسی ندارد و fallback می‌شود |
| اعلان بله نمی‌رسد | `BALE_BOT_TOKEN` و `BALE_ADMIN_CHAT_ID` در `.env` تنظیم شده‌اند؟ (تلگرام کار نمی‌کند — سرور به `api.telegram.org` دسترسی ندارد) |
| تغییر کد اثر ندارد | فایل واقعاً منتقل شده؟ `.next/cache` پاک شده؟ |
