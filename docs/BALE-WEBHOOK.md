# Webhook بله

Endpoint:

```text
POST /api/integrations/bale/webhook/{BALE_WEBHOOK_PATH_SECRET}
```

## رفتار

- Payload با Zod اعتبارسنجی می‌شود.
- `update_id` در `BaleProcessedUpdate` یکتا است.
- آپدیت پردازش‌شده دوباره اجرا نمی‌شود.
- خطای پردازش با وضعیت FAILED و متن محدودشده ثبت می‌شود.
- CallbackQuery همیشه با `answerCallbackQuery` پاسخ داده می‌شود.

## عملیات اضطراری

```bash
npm run bale:delete-webhook
npm run bale:webhook-info
```

حذف Webhook درخواست‌های موجود دیتابیس را حذف نمی‌کند؛ فقط دریافت رویداد جدید را متوقف می‌کند.
