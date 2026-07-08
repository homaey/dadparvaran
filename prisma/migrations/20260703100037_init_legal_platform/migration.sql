-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LAWYER',
    "avatar" TEXT,
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "barNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "specialtiesFA" TEXT NOT NULL DEFAULT '[]',
    "specialtiesEN" TEXT NOT NULL DEFAULT '[]',
    "bioFA" TEXT,
    "bioEN" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "education" TEXT,
    "licenseImage" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "totalCases" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "teamMemberId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lawyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lawyer_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameFA" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "titleFA" TEXT NOT NULL,
    "titleEN" TEXT NOT NULL,
    "slugFA" TEXT NOT NULL,
    "slugEN" TEXT NOT NULL,
    "excerptFA" TEXT,
    "excerptEN" TEXT,
    "contentFA" TEXT NOT NULL,
    "contentEN" TEXT NOT NULL,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "readTimeMin" INTEGER NOT NULL DEFAULT 5,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Lawyer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LegalNode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parentId" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "articleNumber" TEXT,
    "content" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "adoptionDate" TEXT,
    "adoptionAuthority" TEXT,
    "isRepealed" BOOLEAN NOT NULL DEFAULT false,
    "lastAmendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LegalNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LegalNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ruling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullText" TEXT,
    "sourceUrl" TEXT
);

-- CreateTable
CREATE TABLE "NodeRelatedRuling" (
    "legalNodeId" INTEGER NOT NULL,
    "rulingId" INTEGER NOT NULL,

    PRIMARY KEY ("legalNodeId", "rulingId"),
    CONSTRAINT "NodeRelatedRuling_legalNodeId_fkey" FOREIGN KEY ("legalNodeId") REFERENCES "LegalNode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NodeRelatedRuling_rulingId_fkey" FOREIGN KEY ("rulingId") REFERENCES "Ruling" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "nameFA" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Taggable" (
    "tagId" INTEGER NOT NULL,
    "taggableType" TEXT NOT NULL,
    "taggableId" INTEGER NOT NULL,

    PRIMARY KEY ("tagId", "taggableType", "taggableId"),
    CONSTRAINT "Taggable_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nameFA" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roleFA" TEXT NOT NULL,
    "roleEN" TEXT NOT NULL,
    "bioFA" TEXT NOT NULL,
    "bioEN" TEXT NOT NULL,
    "photoUrl" TEXT,
    "barLicenseNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Calculator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "titleFA" TEXT NOT NULL,
    "titleEN" TEXT NOT NULL,
    "descriptionFA" TEXT,
    "descriptionEN" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "inputsSchema" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "data" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_userId_key" ON "Lawyer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_barNumber_key" ON "Lawyer"("barNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_teamMemberId_key" ON "Lawyer"("teamMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slugFA_key" ON "Article"("slugFA");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slugEN_key" ON "Article"("slugEN");

-- CreateIndex
CREATE UNIQUE INDEX "LegalNode_parentId_slug_key" ON "LegalNode"("parentId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Calculator_slug_key" ON "Calculator"("slug");
