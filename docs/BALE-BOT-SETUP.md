# راه‌اندازی بازوی بله

1. در بله با `@botfather` یک بازوی رسمی بسازید و Token را فقط در Secret Store یا `.env` سرور قرار دهید.
2. Mini App اصلی را روی آدرس `https://www.dadparvaran.com/fa/bale/consultation` تنظیم کنید.
3. یک گروه خصوصی برای درخواست‌های وکلا ایجاد و بازو را عضو/مدیر کنید.
4. برای یافتن Chat ID، موقتاً Webhook را حذف کنید، پیامی در گروه بفرستید و `npm run bale:get-updates` را اجرا کنید. سپس Webhook را دوباره ثبت کنید.
5. متغیرهای `.env` را تکمیل کنید.
6. پس از Deploy، `npm run bale:set-webhook` و سپس `npm run bale:webhook-info` را اجرا کنید.

## متغیرهای ضروری

```env
BALE_BOT_TOKEN=
BALE_BOT_PUBLIC_URL=https://ble.ir/BOT_USERNAME
NEXT_PUBLIC_BALE_BOT_URL=https://ble.ir/BOT_USERNAME
BALE_LAWYERS_GROUP_CHAT_ID=
BALE_WEBHOOK_PATH_SECRET=<random-at-least-24-chars>
BALE_MINIAPP_URL=https://www.dadparvaran.com/fa/bale/consultation
BALE_API_BASE_URL=https://tapi.bale.ai
BALE_REQUEST_TIMEOUT_MS=8000
BALE_MINIAPP_MAX_AGE_SECONDS=600
BALE_MINIAPP_HMAC_MODE=compatible
```

## امنیت

Token، Chat ID خصوصی و Secret مسیر Webhook را Commit نکنید. متن کامل پرونده یا فایل‌های کاربر را در گروه وکلا نفرستید. برای تست از بازو و گروه Staging جدا استفاده کنید.
