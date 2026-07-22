-- درخواست مشاوره از فرم سایت (متقاضی بدون حساب بله)
--
-- سه تغییر روی ConsultationRequest:
--   1. userBaleId از NOT NULL به nullable  — کاربر وب شناسه بله ندارد.
--   2. email        — ستون جدید، اختیاری.
--   3. preferredContact — ستون جدید، اختیاری (تلفن / واتساپ / پیامک).
--
-- SQLite ستون NOT NULL را نمی‌تواند مستقیم nullable کند، پس جدول بازساخته
-- می‌شود. ترتیب کار: جدول جدید → کپی داده → حذف قدیم → تغییر نام.
-- کلیدهای خارجی موقتاً غیرفعال می‌شوند تا DROP جدول قدیمی مسدود نشود.

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_ConsultationRequest" (
    "id"               INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicCode"       TEXT NOT NULL,
    "claimToken"       TEXT NOT NULL,
    "source"           TEXT NOT NULL DEFAULT 'BALE_MINIAPP',
    "status"           TEXT NOT NULL DEFAULT 'OPEN',
    "userBaleId"       TEXT,
    "userBaleUsername" TEXT,
    "clientName"       TEXT NOT NULL,
    "phone"            TEXT,
    "email"            TEXT,
    "preferredContact" TEXT,
    "category"         TEXT NOT NULL,
    "subCategory"      TEXT,
    "city"             TEXT NOT NULL,
    "clientRole"       TEXT,
    "caseStage"        TEXT NOT NULL,
    "urgency"          TEXT NOT NULL,
    "summary"          TEXT NOT NULL,
    "assignedLawyerId" INTEGER,
    "acceptedAt"       DATETIME,
    "handoffSentAt"    DATETIME,
    "contactedAt"      DATETIME,
    "closedAt"         DATETIME,
    "groupChatId"      TEXT,
    "groupMessageId"   TEXT,
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        DATETIME NOT NULL,
    CONSTRAINT "ConsultationRequest_assignedLawyerId_fkey"
        FOREIGN KEY ("assignedLawyerId") REFERENCES "TeamMember" ("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_ConsultationRequest" (
    "id", "publicCode", "claimToken", "source", "status",
    "userBaleId", "userBaleUsername", "clientName", "phone",
    "category", "subCategory", "city", "clientRole", "caseStage",
    "urgency", "summary", "assignedLawyerId", "acceptedAt",
    "handoffSentAt", "contactedAt", "closedAt", "groupChatId",
    "groupMessageId", "createdAt", "updatedAt"
)
SELECT
    "id", "publicCode", "claimToken", "source", "status",
    "userBaleId", "userBaleUsername", "clientName", "phone",
    "category", "subCategory", "city", "clientRole", "caseStage",
    "urgency", "summary", "assignedLawyerId", "acceptedAt",
    "handoffSentAt", "contactedAt", "closedAt", "groupChatId",
    "groupMessageId", "createdAt", "updatedAt"
FROM "ConsultationRequest";

DROP TABLE "ConsultationRequest";
ALTER TABLE "new_ConsultationRequest" RENAME TO "ConsultationRequest";

CREATE UNIQUE INDEX "ConsultationRequest_publicCode_key" ON "ConsultationRequest"("publicCode");
CREATE UNIQUE INDEX "ConsultationRequest_claimToken_key" ON "ConsultationRequest"("claimToken");
CREATE INDEX "ConsultationRequest_status_createdAt_idx" ON "ConsultationRequest"("status", "createdAt");
CREATE INDEX "ConsultationRequest_assignedLawyerId_status_idx" ON "ConsultationRequest"("assignedLawyerId", "status");
CREATE INDEX "ConsultationRequest_userBaleId_createdAt_idx" ON "ConsultationRequest"("userBaleId", "createdAt");
-- جدید: نرخ‌گیری درخواست‌های فرم سایت بر اساس شماره تماس انجام می‌شود،
-- چون کاربر وب شناسه‌ای برای ردیابی ندارد.
CREATE INDEX "ConsultationRequest_phone_createdAt_idx" ON "ConsultationRequest"("phone", "createdAt");

PRAGMA foreign_keys=ON;
