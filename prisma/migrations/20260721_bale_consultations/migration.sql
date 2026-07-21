-- Bale consultation intake and lawyer handoff
-- Review against the production schema before applying.

CREATE TABLE "ConsultationRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicCode" TEXT NOT NULL,
    "claimToken" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'BALE_MINIAPP',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "userBaleId" TEXT NOT NULL,
    "userBaleUsername" TEXT,
    "clientName" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "city" TEXT NOT NULL,
    "clientRole" TEXT,
    "caseStage" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "assignedLawyerId" INTEGER,
    "acceptedAt" DATETIME,
    "handoffSentAt" DATETIME,
    "contactedAt" DATETIME,
    "closedAt" DATETIME,
    "groupChatId" TEXT,
    "groupMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsultationRequest_assignedLawyerId_fkey" FOREIGN KEY ("assignedLawyerId") REFERENCES "TeamMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "LawyerBaleAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lawyerId" INTEGER NOT NULL,
    "baleUserId" TEXT NOT NULL,
    "baleUsername" TEXT,
    "balePublicChatUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxOpenRequests" INTEGER NOT NULL DEFAULT 5,
    "allowedCategories" TEXT NOT NULL DEFAULT '[]',
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LawyerBaleAccount_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "LawyerBaleActivationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lawyerId" INTEGER NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawyerBaleActivationCode_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ConsultationEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "consultationRequestId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationEvent_consultationRequestId_fkey" FOREIGN KEY ("consultationRequestId") REFERENCES "ConsultationRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BaleProcessedUpdate" (
    "updateId" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "lastError" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME
);

CREATE TABLE "NotificationDelivery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "consultationRequestId" INTEGER,
    "recipientType" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationDelivery_consultationRequestId_fkey" FOREIGN KEY ("consultationRequestId") REFERENCES "ConsultationRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ConsultationRequest_publicCode_key" ON "ConsultationRequest"("publicCode");
CREATE UNIQUE INDEX "ConsultationRequest_claimToken_key" ON "ConsultationRequest"("claimToken");
CREATE INDEX "ConsultationRequest_status_createdAt_idx" ON "ConsultationRequest"("status", "createdAt");
CREATE INDEX "ConsultationRequest_assignedLawyerId_status_idx" ON "ConsultationRequest"("assignedLawyerId", "status");
CREATE INDEX "ConsultationRequest_userBaleId_createdAt_idx" ON "ConsultationRequest"("userBaleId", "createdAt");

CREATE UNIQUE INDEX "LawyerBaleAccount_lawyerId_key" ON "LawyerBaleAccount"("lawyerId");
CREATE UNIQUE INDEX "LawyerBaleAccount_baleUserId_key" ON "LawyerBaleAccount"("baleUserId");
CREATE INDEX "LawyerBaleAccount_isActive_isAvailable_idx" ON "LawyerBaleAccount"("isActive", "isAvailable");

CREATE UNIQUE INDEX "LawyerBaleActivationCode_codeHash_key" ON "LawyerBaleActivationCode"("codeHash");
CREATE INDEX "LawyerBaleActivationCode_lawyerId_expiresAt_idx" ON "LawyerBaleActivationCode"("lawyerId", "expiresAt");

CREATE INDEX "ConsultationEvent_consultationRequestId_createdAt_idx" ON "ConsultationEvent"("consultationRequestId", "createdAt");
CREATE INDEX "ConsultationEvent_eventType_createdAt_idx" ON "ConsultationEvent"("eventType", "createdAt");

CREATE UNIQUE INDEX "NotificationDelivery_dedupeKey_key" ON "NotificationDelivery"("dedupeKey");
CREATE INDEX "NotificationDelivery_status_createdAt_idx" ON "NotificationDelivery"("status", "createdAt");
CREATE INDEX "NotificationDelivery_consultationRequestId_messageType_idx" ON "NotificationDelivery"("consultationRequestId", "messageType");
