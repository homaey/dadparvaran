# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dadparvaran** (dadparvaran.com) — a Persian-first legal services platform built with Next.js 14 App Router. Public-facing legal content site (laws, articles, calculators, team profiles) plus an internal dashboard for content management with AI-assisted article production. SQLite database, deployed on an Iranian server (GitHub unreachable — deploy via SCP).

## Commands

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Production build (runs typecheck)
npm run typecheck    # TypeScript check only (tsc --noEmit)
npx vitest run       # Run all tests
npx vitest run src/modules/workflow/workflow.test.ts  # Single test file
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to SQLite (use --accept-data-loss if prompted)
npx prisma studio    # Visual DB browser
npx tsx prisma/seed.ts  # Seed database
```

**Before schema changes:** always back up `prisma/dev.db` first — the user has explicitly required this.

## Architecture

### Routing & i18n

Next.js App Router with `[locale]` dynamic segment. Two locales: `fa` (default), `en`. Configured in `src/i18n/routing.ts`. Middleware in `src/middleware.ts` handles locale detection and redirects `dadparvaran.com/` → `/fa`.

Route groups:
- `src/app/[locale]/(public)/` — public pages (laws, articles, calculators, forms, team, services)
- `src/app/[locale]/dashboard/` — authenticated dashboard (protected by layout.tsx session check)
- `src/app/[locale]/auth/` — login, lawyer registration
- `src/app/api/` — API routes (no locale prefix)

Translation files: `messages/fa.json`, `messages/en.json`. Used via `getTranslations()` server-side or `useTranslations()` client-side from `next-intl`.

### Authentication & Roles

NextAuth.js with JWT strategy (`src/lib/auth.ts`). Credentials provider accepts email or Iranian phone (`09XXXXXXXXX`). Four roles stored as plain strings on `User.role`:

- **ADMIN** — full access, manages content strategy, approves lawyers, site settings
- **LAWYER** — team member, writes articles
- **CONTENT_CREATOR** — assigned content tasks, writes article blocks
- **LEGAL_REVIEWER** — reviews articles for legal accuracy

Helper functions: `getCurrentUser()` returns `SessionUser | null`, `requireUser(roles?)` same with optional role filter. API routes use `authorize(roles?)` from `src/lib/api.ts`.

### Database

SQLite via Prisma ORM. Schema at `prisma/schema.prisma`. **SQLite constraints:** no `enum` types (use `String` with defaults like `@default("DRAFT")`), no `Json` type (serialize to `String`). Enum-like constants live in `src/lib/content-enums.ts` as `const` objects with matching types.

Key model groups:
- **Core:** User, TeamMember, Article, Category
- **Legal content:** LegalNode (hierarchical law tree), Ruling, NodeRelatedRuling, Tag, Taggable
- **Calculators:** PriceIndex, DiyeRate, LegalDeadline, Holiday, Calculator
- **Legal forms:** LegalFormCategory (tree), LegalFormTemplate
- **Content management:** ContentPlan, ContentCalendarItem, Task, TaskActivity, Notification, ContentArticle, ArticleBlock, ArticleBlockGeneration, ArticleQualityReview, ArticleExportProfile, SystemSetting

### Content Management System (src/modules/)

AI-powered content pipeline with 6 stages. Modules are organized by domain:

- `content-strategy/` — AI calendar generation via OpenAI, plan input validation (zod schemas)
- `workflow/` — Task state machine (PLANNED→ASSIGNED→RESEARCHING→DRAFT→REVIEW→REVISION→APPROVED→PUBLISHED), role-based transition rules
- `article-engine/` — Block-based article templates (6 types × 7-10 blocks each), AI content generation per block with 6 operations (generate/regenerate/simplify/professionalize/shorten/expand)
- `quality-review/` — Dual AI review (legal accuracy + SEO), content signature hashing
- `article-export/` — Serializes ContentArticle blocks into publishable Article, `publishToMainSite()` upserts to the public Article model
- `notifications/` — Deadline reminders, Telegram delivery (optional)
- `management-intelligence/` — Detects stale/stuck tasks, sends daily summaries to admins

### LegalNode Hierarchy

Laws are stored as a tree in `LegalNode`. Hierarchy by `type` field with implied rank: `LAW` > `BOOK/INTRODUCTION` > `PART/SECTION` > `CHAPTER` > `TOPIC` > `SUBTOPIC` > `PARAGRAPH` > `ARTICLE`. Persian section names: جلد, مقدمه, کتاب, قسمت, بخش, باب, فصل, مبحث, فقره, ماده. Tree display uses `pruneEmptySections()` from `src/lib/laws.ts`.

### UI Components

- `src/components/ui.tsx` — shared primitives: Card, Badge, MetricCard, button/input/table CSS classes
- `src/components/dashboard/DashboardLayout.tsx` — sidebar navigation with role-based menu items
- Icons: Lucide React exclusively (no emoji icons)
- Design: Navy (#1E3A8A) + Gold (#B45309) palette, Estedad/Kalameh Persian fonts

## Deployment

Deployed to an Iranian server behind nginx + pm2. **GitHub is unreachable from that server**, so deployment is SCP-based, never `git pull`. Follow `docs/DEPLOY.md` — it is the only supported procedure.

Host, SSH user, key path and env vars live in `docs/SERVER.private.md` (gitignored — never commit connection details or credentials to this repo).

Two other things that host cannot reach, which shape the code: `api.telegram.org` (notifications therefore use Bale, `tapi.bale.ai`) and `fonts.googleapis.com` (build warns and falls back).

## Critical Rules

- **قبل از تغییر اسکیما یا داده، یک نسخه‌ی پشتیبان از دیتابیس بگیر**
- **اگر جایی این پرامپت با کد موجود در تناقض بود یا تصمیمی ریسک داشت، قبل از تغییر از من بپرس**
- **داده‌های حقوقی (شاخص بها، نرخ دیه، مهلت‌ها) از منبع بانک مرکزی توسط کاربر تهیه شده — مقادیر را تغییر نده، گِرد نکن، و از خودت رکورد نساز. فقط عیناً import کن.**
- **ماشین‌حساب سهم‌الارث طرحش جدا در حال بررسی است — دست نزن**

## Gotchas

- `prisma/schema.prisma` uses SQLite — never add `enum` blocks or `Json` fields; use `String` with constants from `src/lib/content-enums.ts`
- Content management translation keys (`content.*`) in `messages/fa.json` are incomplete — pages using `getTranslations("content.contentStrategy")` etc. will crash without them
- PowerShell can't handle `(public)` in git paths — use Bash tool for git operations involving route group directories
- `requireUser()` returns `SessionUser | null` — always null-check before accessing properties
- `Article.authorId` references `TeamMember.id` (not `User.id`) — publishing requires the user to have a linked TeamMember
