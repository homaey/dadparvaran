/* واردسازی هوشمند مقالات solh.ir → دادپروران
   ۱. همه مقالات را می‌خواند
   ۲. با AI بازنویسی می‌کند (بلوک‌بندی + زبان ساده)
   ۳. اولویت‌بندی بر اساس امتیاز AI
   ۴. زمان‌بندی انتشار (هر روز ۲ مقاله، ساعت ۸ و ۱۴)
   ۵. درج به‌صورت SCHEDULED در دیتابیس

   استفاده:
     node scripts/solh-smart-import.js                    # خشک‌اجرا — فقط آمار
     node scripts/solh-smart-import.js --rewrite          # بازنویسی با AI + درج
     node scripts/solh-smart-import.js --rewrite --limit 5  # فقط ۵ مقاله (تست)
     node scripts/solh-smart-import.js --no-ai            # درج بدون بازنویسی AI (بلوک‌بندی ساده)
*/

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { REWRITE_SYSTEM_PROMPT, REWRITE_USER_TEMPLATE } = require("./rewrite-prompt");

const p = new PrismaClient();

// ─── تنظیمات ───────────────────────────────────────────────────────────────

const SRC = path.join("C:", "My Web Sites", "solh", "extracted", "articles.json");
const API_KEY = process.env.PARSPACK_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const AI_PROVIDER = process.env.PARSPACK_API_KEY ? "parspack" : process.env.ANTHROPIC_API_KEY ? "claude" : "openai";
const AI_MODEL = AI_PROVIDER === "parspack" ? "openai/gpt-5.5" : AI_PROVIDER === "claude" ? "claude-sonnet-4-20250514" : "gpt-4o-mini";
const PARSPACK_BASE = "https://my.parspack.com/api/aistudio/api/v1";

const ARTICLES_PER_DAY = 2;
const PUBLISH_HOURS = [8, 14]; // ساعت ۸ صبح و ۲ بعدازظهر
const START_DATE = new Date("2026-07-20T00:00:00+03:30"); // شروع انتشار

// ─── دسته‌بندی ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "civil-law", nameFA: "حقوق مدنی", nameEN: "Civil Law" },
  { slug: "criminal-law", nameFA: "حقوق کیفری", nameEN: "Criminal Law" },
  { slug: "commercial-law", nameFA: "حقوق تجاری", nameEN: "Commercial Law" },
  { slug: "family-law", nameFA: "حقوق خانواده", nameEN: "Family Law" },
  { slug: "property-law", nameFA: "امور ملکی", nameEN: "Property Law" },
  { slug: "inheritance-law", nameFA: "ارث و امور حسبی", nameEN: "Inheritance Law" },
  { slug: "labor-law", nameFA: "حقوق کار", nameEN: "Labor Law" },
  { slug: "financial-claims", nameFA: "چک، سفته و مطالبات", nameEN: "Financial Claims" },
  { slug: "procedure-law", nameFA: "آیین دادرسی", nameEN: "Procedure Law" },
  { slug: "contract-law", nameFA: "قراردادها", nameEN: "Contracts" },
];

const CAT_KEYWORDS = {
  "inheritance-law": ["ارث", "وراثت", "ترکه", "وصیت", "سهم‌الارث", "سهم الارث", "انحصار وراثت", "ماترک", "حسبی", "قیمومت"],
  "labor-law": ["کارگر", "کارفرما", "بیمه", "سنوات", "اخراج", "قرارداد کار", "تأمین اجتماعی", "بازنشستگی", "حق سنوات"],
  "financial-claims": ["چک", "سفته", "برگشتی", "مطالبه وجه", "مطالبات", "اعسار", "تقسیط", "ضمانت", "واخواست"],
  "procedure-law": ["دادخواست", "دادرسی", "تجدیدنظر", "واخواهی", "فرجام", "اجرای حکم", "دادگاه", "شورای حل اختلاف", "ابلاغ", "ثنا", "دادسرا", "تأمین خواسته"],
  "contract-law": ["قرارداد", "بیع", "معامله", "فسخ", "اجاره", "مبایعه", "تعهد", "وجه التزام", "پیمانکاری", "مشارکت"],
  "family-law": ["طلاق", "مهریه", "نفقه", "حضانت", "ازدواج", "تمکین", "عقد", "زوجه", "زوج", "ملاقات"],
  "property-law": ["ملک", "املاک", "سند رسمی", "خلع ید", "سرقفلی", "تصرف عدوانی", "شهرداری", "آپارتمان", "افراز", "ثبتی", "پلاک"],
  "criminal-law": ["کلاهبرداری", "سرقت", "جرم", "کیفری", "مجازات", "قصاص", "دیه", "جعل", "خیانت در امانت", "توهین", "تهدید", "شکایت", "مواد مخدر"],
  "commercial-law": ["شرکت", "تجاری", "ورشکستگی", "سهام", "تجارت", "علامت تجاری", "برند", "داوری", "داور", "موسسه"],
};

function classify(title, content) {
  const hay = title + " " + content.slice(0, 900);
  let best = "civil-law", bestScore = 0;
  for (const [slug, words] of Object.entries(CAT_KEYWORDS)) {
    let s = 0;
    for (const w of words) { s += hay.split(w).length - 1; }
    for (const w of words) if (title.includes(w)) s += 3;
    if (s > bestScore) { bestScore = s; best = slug; }
  }
  return best;
}

function persianSlug(title, id) {
  let s = title.trim()
    .replace(/[()«»؟?.,،:؛"'!\/\\]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s.slice(0, 70) + "-" + id;
}

// ─── بلوک‌بندی ساده (بدون AI) ───────────────────────────────────────────────

function toBlocksSimple(content) {
  const lines = content.split("\n");
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: "paragraph", content: para.join(" ").trim() }); para = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: "steps", items: list.slice() }); list = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); flushPara(); continue; }
    if (line.startsWith("## ")) { flushList(); flushPara(); blocks.push({ type: "heading", content: line.slice(3).trim() }); continue; }
    if (line.startsWith("- ")) { flushPara(); list.push(line.slice(2).trim()); continue; }
    flushList(); para.push(line);
  }
  flushList(); flushPara();
  return blocks.filter(b => (b.content && b.content.length) || (b.items && b.items.length));
}

function splitLead(blocks) {
  const idx = blocks.findIndex(b => b.type === "paragraph");
  if (idx === -1) return { excerpt: null, body: blocks };
  const excerpt = blocks[idx].content;
  const body = blocks.slice(0, idx).concat(blocks.slice(idx + 1));
  return { excerpt, body };
}

function readTime(content) {
  return Math.max(2, Math.round(content.split(/\s+/).filter(Boolean).length / 200));
}

// ─── فراخوان AI ─────────────────────────────────────────────────────────────

async function callAI(systemPrompt, userPrompt) {
  if (AI_PROVIDER === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
    return data.content[0].text;
  } else {
    const baseUrl = AI_PROVIDER === "parspack" ? PARSPACK_BASE : "https://api.openai.com/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
    return data.choices[0].message.content;
  }
}

async function rewriteArticle(title, content, category) {
  const userPrompt = REWRITE_USER_TEMPLATE(title, content, category);
  const raw = await callAI(REWRITE_SYSTEM_PROMPT, userPrompt);

  // استخراج JSON از پاسخ (ممکن است درون ```json باشد)
  let json = raw;
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) json = fenceMatch[1];
  json = json.trim();

  const parsed = JSON.parse(json);
  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    throw new Error("خروجی AI بلوک ندارد");
  }
  return parsed;
}

// ─── اولویت‌بندی ساده (بدون AI) ─────────────────────────────────────────────

const HIGH_PRIORITY_KEYWORDS = [
  { words: ["مهریه", "طلاق", "حضانت", "نفقه", "ازدواج"], score: 90 },
  { words: ["ارث", "وراثت", "ترکه", "وصیت"], score: 85 },
  { words: ["چک", "سفته", "مطالبات", "اعسار"], score: 82 },
  { words: ["خرید", "فروش", "ملک", "آپارتمان", "سند", "سرقفلی"], score: 80 },
  { words: ["کلاهبرداری", "شکایت", "دزدی", "سرقت", "جرم"], score: 78 },
  { words: ["قرارداد", "اجاره", "فسخ", "بیع"], score: 75 },
  { words: ["دادخواست", "دادگاه", "تجدیدنظر", "اجرای حکم"], score: 70 },
  { words: ["کارگر", "کارفرما", "بیمه", "اخراج", "سنوات"], score: 68 },
  { words: ["شرکت", "ثبت", "تجاری", "برند"], score: 55 },
  { words: ["داوری", "حکمیت"], score: 45 },
];

function heuristicPriority(title, content) {
  const hay = title + " " + content.slice(0, 500);
  let maxScore = 30;
  for (const group of HIGH_PRIORITY_KEYWORDS) {
    for (const w of group.words) {
      if (hay.includes(w)) { maxScore = Math.max(maxScore, group.score); break; }
    }
  }
  // bonus for longer, richer articles
  const len = content.length;
  if (len > 5000) maxScore = Math.min(100, maxScore + 5);
  if (len > 10000) maxScore = Math.min(100, maxScore + 3);
  return maxScore;
}

// ─── زمان‌بندی ──────────────────────────────────────────────────────────────

function scheduleDate(index) {
  const dayOffset = Math.floor(index / ARTICLES_PER_DAY);
  const hourSlot = PUBLISH_HOURS[index % ARTICLES_PER_DAY];
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hourSlot, 0, 0, 0);
  return d;
}

// ─── اجرا ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const doRewrite = args.includes("--rewrite");
  const noAi = args.includes("--no-ai");
  const limitArg = args.find(a => a.startsWith("--limit"));
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 0;
  const dryRun = !doRewrite && !noAi;

  const all = JSON.parse(fs.readFileSync(SRC, "utf8"));
  const eligible = all.filter(a => a.section === "post" && a.content.length > 600 && a.title.trim().length > 8);

  console.log(`\n📊 مقالات کل: ${all.length} | واجد شرایط: ${eligible.length}`);

  if (doRewrite && !API_KEY) {
    console.error("\n❌ برای بازنویسی، کلید API لازم است:");
    console.error("   set OPENAI_API_KEY=sk-...   یا   set ANTHROPIC_API_KEY=sk-ant-...");
    process.exit(1);
  }

  // اولویت‌بندی
  const scored = eligible.map(a => ({
    ...a,
    cat: classify(a.title, a.content),
    priority: heuristicPriority(a.title, a.content),
  })).sort((a, b) => b.priority - a.priority);

  const toProcess = limit ? scored.slice(0, limit) : scored;
  console.log(`📋 برای پردازش: ${toProcess.length} مقاله (مرتب بر اساس اولویت)\n`);

  if (dryRun) {
    console.log("── حالت خشک‌اجرا (بدون تغییر دیتابیس) ──\n");
    console.log("رتبه | اولویت | دسته           | عنوان");
    console.log("─────┼─────────┼────────────────┼" + "─".repeat(50));
    toProcess.slice(0, 30).forEach((a, i) => {
      const catName = CATEGORIES.find(c => c.slug === a.cat)?.nameFA || a.cat;
      console.log(`${String(i + 1).padStart(4)} | ${String(a.priority).padStart(7)} | ${catName.padEnd(14)} | ${a.title.slice(0, 50)}`);
    });
    if (toProcess.length > 30) console.log(`\n   ... و ${toProcess.length - 30} مقالهٔ دیگر`);
    console.log(`\n⏱️  زمان تخمینی انتشار: ${Math.ceil(toProcess.length / ARTICLES_PER_DAY)} روز`);
    console.log(`📅 شروع: ${START_DATE.toLocaleDateString("fa-IR")} — پایان: ${scheduleDate(toProcess.length - 1).toLocaleDateString("fa-IR")}`);
    console.log("\n💡 برای اجرای واقعی:");
    console.log("   با AI:    node scripts/solh-smart-import.js --rewrite");
    console.log("   بدون AI:  node scripts/solh-smart-import.js --no-ai");
    await p.$disconnect();
    return;
  }

  // ساخت/به‌روزرسانی دسته‌ها
  const catId = {};
  for (const c of CATEGORIES) {
    const row = await p.category.upsert({ where: { slug: c.slug }, update: { nameFA: c.nameFA, nameEN: c.nameEN }, create: c });
    catId[c.slug] = row.id;
  }

  const authors = await p.teamMember.findMany({ where: { isActive: true }, select: { id: true } });
  const authorIds = authors.map(a => a.id);
  if (authorIds.length === 0) { console.error("❌ هیچ نویسنده‌ای فعال نیست"); process.exit(1); }

  let success = 0, failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const a = toProcess[i];
    const catName = CATEGORIES.find(c => c.slug === a.cat)?.nameFA || a.cat;
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${a.title.slice(0, 40)}... `);

    let blocks, excerpt, priority, readMin;

    if (doRewrite) {
      try {
        const result = await rewriteArticle(a.title, a.content, catName);
        blocks = result.blocks;
        excerpt = result.excerpt || null;
        priority = result.priority || a.priority;
        readMin = result.readTimeMin || readTime(a.content);
        process.stdout.write("✅ AI ");
      } catch (err) {
        console.log(`⚠️ AI خطا: ${err.message.slice(0, 60)} → بلوک‌بندی ساده`);
        const allBlocks = toBlocksSimple(a.content);
        const split = splitLead(allBlocks);
        blocks = split.body;
        excerpt = split.excerpt;
        priority = a.priority;
        readMin = readTime(a.content);
        failed++;
      }
    } else {
      // --no-ai: بلوک‌بندی ساده
      const allBlocks = toBlocksSimple(a.content);
      const split = splitLead(allBlocks);
      blocks = split.body;
      excerpt = split.excerpt;
      priority = a.priority;
      readMin = readTime(a.content);
    }

    const slug = persianSlug(a.title, a.sourceId);
    const scheduledAt = scheduleDate(i);

    try {
      await p.article.upsert({
        where: { slug },
        update: {
          title: a.title.trim(),
          excerpt,
          blocks: JSON.stringify(blocks),
          status: "SCHEDULED",
          priority,
          scheduledAt,
          readTimeMin: readMin,
          categoryId: catId[a.cat],
        },
        create: {
          authorId: authorIds[i % authorIds.length],
          categoryId: catId[a.cat],
          title: a.title.trim(),
          slug,
          excerpt,
          blocks: JSON.stringify(blocks),
          status: "SCHEDULED",
          priority,
          scheduledAt,
          readTimeMin: readMin,
          viewCount: 0,
        },
      });
      success++;
      console.log(`→ SCHEDULED ${scheduledAt.toLocaleDateString("fa-IR")} ${scheduledAt.getHours()}:00`);
    } catch (err) {
      console.log(`❌ DB خطا: ${err.message.slice(0, 60)}`);
      failed++;
    }

    // تأخیر بین درخواست‌های AI
    if (doRewrite && i < toProcess.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`✅ موفق: ${success} | ❌ ناموفق: ${failed}`);
  console.log(`📅 انتشار خودکار: ${scheduleDate(0).toLocaleDateString("fa-IR")} تا ${scheduleDate(toProcess.length - 1).toLocaleDateString("fa-IR")}`);
  console.log(`🔗 Cron endpoint: /api/cron/publish-scheduled?secret=dadparvaran-cron-2026`);
  console.log(`═══════════════════════════════════════════\n`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
