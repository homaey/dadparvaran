-- «پیگیری در بله» برای متقاضیِ فرم سایت.
--
-- کاربر پس از ثبت فرم، با یک ضربه روی deep-link حسابِ بله‌اش را به همان
-- درخواست می‌بندد و از آن پس مثل کاربر مینی‌اپ، پیام پذیرش و لینک گفت‌وگو با
-- وکیل را دریافت می‌کند. پیش از این، رفتن به بله شش قدم بود و کاربر مجبور بود
-- پیش از ثبت درخواست تصمیم بگیرد.
--
-- افزودن ستون در SQLite بدون بازسازی جدول ممکن است، چون nullable است.

ALTER TABLE "ConsultationRequest" ADD COLUMN "clientLinkToken" TEXT;

CREATE UNIQUE INDEX "ConsultationRequest_clientLinkToken_key"
    ON "ConsultationRequest"("clientLinkToken");
