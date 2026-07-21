# Rollback

1. CTA بله را از تنظیمات یا Deploy قبلی غیرفعال کنید.
2. `npm run bale:delete-webhook` را اجرا کنید.
3. نسخه قبلی کد را Restore کنید.
4. Migration را به‌صورت کورکورانه Down نکنید؛ جداول جدید داده عملیاتی دارند.
5. در صورت نیاز، دیتابیس را از بکاپ قبل از Migration بازگردانید.
6. درخواست‌های ثبت‌شده را قبل از هر حذف یا Restore به CSV/JSON خروجی بگیرید.

اسکریپت `apply-overlay.sh` از فایل‌های جایگزین‌شده یک نسخه در `.bale-patch-backup/<timestamp>` می‌سازد.
