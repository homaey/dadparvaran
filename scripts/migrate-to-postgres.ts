/**
 * اسکریپت migration از SQLite به PostgreSQL
 *
 * استفاده:
 *   $env:DATABASE_URL = "postgresql://user:pass@host:5432/legaldb"
 *   $env:SQLITE_URL   = "file:./dev.db"
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-to-postgres.ts
 */

import { PrismaClient as SQLiteClient } from "@prisma/client";

const sqlite = new SQLiteClient({ datasourceUrl: process.env.SQLITE_URL ?? "file:./dev.db" });

// بعد از جایگزینی schema با postgresql نسخه:
// const pg = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function main() {
  console.log("📦 خواندن داده‌ها از SQLite...");

  const [users, lawyers, categories, articles, consultations, docRequests, payments, settings] =
    await Promise.all([
      sqlite.user.findMany({ include: { otpCodes: true } }),
      sqlite.lawyer.findMany(),
      sqlite.category.findMany(),
      sqlite.article.findMany(),
      sqlite.consultation.findMany(),
      sqlite.documentRequest.findMany(),
      sqlite.payment.findMany(),
      sqlite.siteSettings.findMany(),
    ]);

  console.log(`✅ کاربران: ${users.length}`);
  console.log(`✅ وکلا: ${lawyers.length}`);
  console.log(`✅ مقالات: ${articles.length}`);
  console.log(`✅ مشاوره‌ها: ${consultations.length}`);

  // تبدیل JSON strings به آرایه واقعی برای PostgreSQL
  const convertLawyer = (l: any) => ({
    ...l,
    specialtiesFA: JSON.parse(l.specialtiesFA ?? "[]"),
    specialtiesEN: JSON.parse(l.specialtiesEN ?? "[]"),
    availableDays:  JSON.parse(l.availableDays  ?? "[]"),
    availableHours: JSON.parse(l.availableHours ?? "[]"),
  });

  const convertArticle = (a: any) => ({
    ...a,
    tags: JSON.parse(a.tags ?? "[]"),
  });

  const convertDocRequest = (d: any) => ({
    ...d,
    attachments: JSON.parse(d.attachments ?? "[]"),
  });

  console.log("\n📋 داده‌های آماده برای migration:");
  console.log(JSON.stringify({
    lawyers: lawyers.map(convertLawyer).slice(0, 1),
    articles: articles.map(convertArticle).slice(0, 1),
  }, null, 2));

  console.log("\n⚠️  برای ادامه migration:");
  console.log("1. schema.prisma را با schema.postgresql.prisma جایگزین کنید");
  console.log("2. DATABASE_URL را به PostgreSQL تنظیم کنید");
  console.log("3. npx prisma migrate deploy را اجرا کنید");
  console.log("4. کد insert را uncomment کنید و دوباره اجرا کنید");
}

main()
  .catch(console.error)
  .finally(() => sqlite.$disconnect());
