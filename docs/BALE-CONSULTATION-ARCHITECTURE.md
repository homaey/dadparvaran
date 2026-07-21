# معماری سامانه درخواست مشاوره بله

## جریان اصلی

```text
CTA سایت → Mini App بله → POST /api/consultations → ConsultationRequest(OPEN)
→ پیام خلاصه در گروه وکلا → callback claim:<token>
→ updateMany شرطی و اتمی → ASSIGNED
→ کارت خصوصی وکیل + لینک حساب کاری وکیل برای کاربر
→ HANDOFF_SENT → وکیل وضعیت را با دکمه‌های بازو ثبت می‌کند
```

## مرز حریم خصوصی

پیام گروه فقط شامل کد، حوزه، شهر، مرحله و فوریت است. نام، تلفن، شرح پرونده و اسناد در گروه منتشر نمی‌شود. اطلاعات بیشتر پس از پذیرش فقط در گفت‌وگوی خصوصی بازو با وکیل منتخب ارسال می‌شود. متن گفت‌وگوی مستقیم کاربر و وکیل در سایت ذخیره نمی‌شود.

## جلوگیری از پذیرش هم‌زمان

پذیرش با `updateMany` و شرط `status=OPEN` و `assignedLawyerId=null` انجام می‌شود. فقط اولین عملیات `count=1` می‌گیرد و کلیک‌های بعدی رد می‌شوند. این منطق باید در تست Integration با دو درخواست هم‌زمان نیز بررسی شود.

## شناسایی وکیل

شناسه اصلی، `baleUserId` عددی/رشته‌ای دریافت‌شده از CallbackQuery است. Username فقط برای نمایش و لینک عمومی است و به‌عنوان هویت قابل اعتماد استفاده نمی‌شود. اتصال Bale ID به وکیل با کد فعال‌سازی یک‌بارمصرف انجام می‌شود.

## وضعیت‌ها

`DRAFT, OPEN, ASSIGNED, HANDOFF_SENT, CONTACTED, UNDER_REVIEW, QUALIFIED, NOT_A_FIT, REFERRED, CLOSED, CANCELLED`

انتقال‌ها در `src/modules/consultations/constants.ts` متمرکز شده‌اند. هر تغییر مهم یک `ConsultationEvent` تولید می‌کند.

## اجزای اصلی

- `src/modules/bale/client.ts`: Adapter رسمی Bot API
- `src/modules/bale/webhook-handler.ts`: Routing آپدیت‌ها و Idempotency
- `src/modules/bale/miniapp-auth.ts`: اعتبارسنجی HMAC initData
- `src/modules/consultations/claim-request.ts`: پذیرش اتمی و Handoff
- `src/modules/consultations/delivery.ts`: ارسال پایدار، Dedupe و Retry
- `src/app/api/integrations/bale/webhook/[secret]/route.ts`: Endpoint Webhook
- `src/app/[locale]/(public)/bale/consultation`: Mini App UI
- `src/app/[locale]/dashboard/consultations`: نظارت مدیر

## نکات ادغام

- Schema این بسته نسخه کامل Schema فعلی مخزن در زمان تهیه است؛ قبل از جایگزینی Diff بگیرید.
- مسیر Mini App نباید هدر `X-Frame-Options: DENY` داشته باشد.
- Webhook باید HTTPS و Secret مسیر آن حداقل ۲۴ کاراکتر تصادفی باشد.
- بازو باید برای `getChatMember` در گروه وکلا دسترسی لازم را داشته باشد.
