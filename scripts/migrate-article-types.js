/**
 * بازطبقه‌بندی عنوان‌های تقویم با تاکسونومی بدون هم‌پوشانی.
 * پیش‌فرض فقط گزارش می‌دهد؛ نوشتن در دیتابیس نیازمند --apply است.
 *
 * اجرا:
 *   node scripts/migrate-article-types.js
 *   node scripts/migrate-article-types.js --apply
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const apply = process.argv.includes("--apply");

const ARTICLE_TYPES = [
  "SERVICE_PAGE",
  "LOCAL_SEO",
  "LEGAL_GUIDE",
  "LEGAL_QA",
  "STEP_BY_STEP",
  "PRACTICAL_CHECKLIST",
  "COMPARISON",
  "LEGAL_UPDATE",
  "RULING_ANALYSIS",
  "CASE_STUDY",
  "TRUST_BUILDER",
];

function classify(title) {
  const value = title.replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/\u200c/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("fa");
  const location = /(تهران|کرج|مشهد|اصفهان|شیراز|تبریز|قم|اهواز|رشت|ارومیه|یزد|کرمان|قزوین|همدان|ساری|گرگان|بندرعباس|اراک|سنندج|زاهدان|خرم آباد|اردبیل|بوشهر|شهرستان|استان|منطقه|محله)/;
  const service = /(صفحه خدمت|خدمت تخصصی|خدمات حقوقی|^وکیل | وکیل (?:دعاوی|پرونده|متخصص|حقوقی|کیفری)|وکالت (?:دعاوی|پرونده)|مشاوره تخصصی)/;

  if (/(روش کار (?:دفتر|موسسه)|تعهدات (?:دفتر|وکیل)|چرا (?:سپردن|انتخاب) .*وکیل|معیار انتخاب وکیل|محرمانگی .*دفتر)/.test(value)) return "TRUST_BUILDER";
  if (service.test(value) && location.test(value)) return "LOCAL_SEO";
  if (service.test(value)) return "SERVICE_PAGE";
  if (/(تحلیل|بررسی|نقد|موردکاوی).*(رأی|رای|دادنامه)|(رأی|رای) (?:وحدت رویه|دادگاه|دیوان)|استدلال (?:دادگاه|قاضی)|منطوق (?:رأی|رای)/.test(value)) return "RULING_ANALYSIS";
  if (/(مطالعه موردی|موردکاوی.*پرونده|پرونده واقعی|روایت پرونده|تجربه پرونده|پرونده (?:های )?موفق)/.test(value)) return "CASE_STUDY";
  if (/(پرسش و پاسخ|پرسش های متداول|سوالات متداول|سؤالات متداول)/.test(value)) return "LEGAL_QA";
  if (/(مقایسه|تفاوت|فرق | در برابر | یا کدام|کدام بهتر)/.test(value)) return "COMPARISON";
  if (/(قانون جدید|اصلاحیه|اصلاحات جدید|بخشنامه جدید|مصوبه جدید|تغییرات قانون|تغییر قانون|چه چیزی تغییر کرد|لازم الاجرا|لازم‌الاجرا|تحلیل جدید قانون)/.test(value)) return "LEGAL_UPDATE";
  if (/(گام به گام|گام‌به‌گام|مرحله به مرحله|مرحله‌به‌مرحله|مراحل (?:قانونی|عملی|ثبت|پیگیری)|نحوه |چگونه |چطور |راهنمای عملی (?:تنظیم|ثبت|پیگیری|اعتراض|مطالبه|وصول|اجرای|دریافت))/.test(value)) return "STEP_BY_STEP";
  if (/(چک لیست|چک‌لیست|مدارک لازم|اسناد لازم|اشتباهات رایج|خطاهای رایج|نکات کلیدی|نکات مهم|نکات حقوقی|پیش از امضا|قبل از امضا)/.test(value)) return "PRACTICAL_CHECKLIST";
  if (/[؟?]$/.test(value) || /(^| )(آیا|چیست|کیست|چرا|چه زمانی|چه موقع|چقدر|تا چه حد|پرسش و پاسخ|پرسش های متداول|پرسش‌های متداول|سوالات متداول|سؤالات متداول)( |$)/.test(value)) return "LEGAL_QA";
  return "LEGAL_GUIDE";
}

function distribution(types) {
  const counts = new Map();
  for (const type of types) counts.set(type, (counts.get(type) || 0) + 1);
  const rows = ARTICLE_TYPES.filter(type => counts.has(type)).map(articleType => {
    const exact = (counts.get(articleType) * 100) / types.length;
    return { articleType, percentage: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  let remainder = 100 - rows.reduce((sum, row) => sum + row.percentage, 0);
  for (const row of [...rows].sort((a, b) => b.fraction - a.fraction)) {
    if (!remainder) break;
    row.percentage += 1;
    remainder -= 1;
  }
  return rows.map(({ articleType, percentage }) => ({ articleType, percentage }));
}

(async () => {
  const items = await db.contentCalendarItem.findMany({
    select: { id: true, contentPlanId: true, title: true, articleType: true, task: { select: { article: { select: { id: true } } } } },
    orderBy: { id: "asc" },
  });
  const classified = items.map(item => ({ ...item, nextType: classify(item.title) }));
  const changes = classified.filter(item => item.articleType !== item.nextType);
  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${changes.length} of ${items.length} items need reclassification`);
  for (const item of changes) console.log(`${item.id}: ${item.articleType} -> ${item.nextType} | ${item.title}`);

  const started = changes.filter(item => item.task && item.task.article);
  if (started.length) throw new Error(`مقاله‌های شروع‌شده نیازمند بررسی دستی‌اند: ${started.map(item => item.id).join(", ")}`);
  if (!apply || !changes.length) return;

  const byPlan = new Map();
  for (const item of classified) {
    const group = byPlan.get(item.contentPlanId) || [];
    group.push(item);
    byPlan.set(item.contentPlanId, group);
  }
  await db.$transaction(async tx => {
    for (const item of changes) await tx.contentCalendarItem.update({ where: { id: item.id }, data: { articleType: item.nextType } });
    for (const [planId, planItems] of byPlan) {
      await tx.contentPlan.update({
        where: { id: planId },
        data: { typeDistribution: JSON.stringify(distribution(planItems.map(item => item.nextType))) },
      });
    }
  });
  console.log(`DONE: ${changes.length} items and ${byPlan.size} plan distributions updated`);
})()
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => db.$disconnect());
