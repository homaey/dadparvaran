import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { callAi } from "@/lib/ai-provider";
import fs from "fs";
import path from "path";

const SRC = path.join("C:", "My Web Sites", "solh", "extracted", "articles.json");

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

const CAT_KEYWORDS: Record<string, string[]> = {
  "inheritance-law": ["ارث", "وراثت", "ترکه", "وصیت", "سهم‌الارث", "سهم الارث", "انحصار وراثت", "ماترک", "حسبی", "قیمومت"],
  "labor-law": ["کارگر", "کارفرما", "بیمه", "سنوات", "اخراج", "قرارداد کار", "تأمین اجتماعی", "بازنشستگی"],
  "financial-claims": ["چک", "سفته", "برگشتی", "مطالبه وجه", "مطالبات", "اعسار", "تقسیط", "واخواست"],
  "procedure-law": ["دادخواست", "دادرسی", "تجدیدنظر", "واخواهی", "فرجام", "اجرای حکم", "دادگاه", "شورای حل اختلاف", "ابلاغ", "دادسرا"],
  "contract-law": ["قرارداد", "بیع", "معامله", "فسخ", "اجاره", "مبایعه", "تعهد", "وجه التزام", "پیمانکاری"],
  "family-law": ["طلاق", "مهریه", "نفقه", "حضانت", "ازدواج", "تمکین", "عقد", "زوجه", "زوج", "ملاقات"],
  "property-law": ["ملک", "املاک", "سند رسمی", "خلع ید", "سرقفلی", "تصرف عدوانی", "آپارتمان", "افراز", "ثبتی"],
  "criminal-law": ["کلاهبرداری", "سرقت", "جرم", "کیفری", "مجازات", "قصاص", "دیه", "جعل", "خیانت در امانت", "توهین", "شکایت"],
  "commercial-law": ["شرکت", "تجاری", "ورشکستگی", "سهام", "تجارت", "علامت تجاری", "برند", "داوری", "موسسه"],
};

const HIGH_PRIORITY: { words: string[]; score: number }[] = [
  { words: ["مهریه", "طلاق", "حضانت", "نفقه", "ازدواج"], score: 90 },
  { words: ["ارث", "وراثت", "ترکه", "وصیت"], score: 85 },
  { words: ["چک", "سفته", "مطالبات", "اعسار"], score: 82 },
  { words: ["خرید", "فروش", "ملک", "آپارتمان", "سند", "سرقفلی"], score: 80 },
  { words: ["کلاهبرداری", "شکایت", "سرقت", "جرم"], score: 78 },
  { words: ["قرارداد", "اجاره", "فسخ", "بیع"], score: 75 },
  { words: ["دادخواست", "دادگاه", "تجدیدنظر", "اجرای حکم"], score: 70 },
  { words: ["کارگر", "کارفرما", "بیمه", "اخراج", "سنوات"], score: 68 },
  { words: ["شرکت", "ثبت", "تجاری", "برند"], score: 55 },
];

function classify(title: string, content: string): string {
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

function heuristicPriority(title: string, content: string): number {
  const hay = title + " " + content.slice(0, 500);
  let maxScore = 30;
  for (const group of HIGH_PRIORITY) {
    for (const w of group.words) {
      if (hay.includes(w)) { maxScore = Math.max(maxScore, group.score); break; }
    }
  }
  if (content.length > 5000) maxScore = Math.min(100, maxScore + 5);
  return maxScore;
}

function persianSlug(title: string, id: string): string {
  return title.trim()
    .replace(/[()«»؟?.,،:؛"'!\/\\]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 70) + "-" + id;
}

type Block = { type: string; content?: string; items?: unknown[]; variant?: string; title?: string };

function toBlocksSimple(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: "paragraph", content: para.join(" ").trim() }); para = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: "steps", items: [...list] }); list = []; } };
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

function splitLead(blocks: Block[]): { excerpt: string | null; body: Block[] } {
  const idx = blocks.findIndex(b => b.type === "paragraph");
  if (idx === -1) return { excerpt: null, body: blocks };
  return { excerpt: blocks[idx].content!, body: blocks.slice(0, idx).concat(blocks.slice(idx + 1)) };
}

function readTime(content: string): number {
  return Math.max(2, Math.round(content.split(/\s+/).filter(Boolean).length / 200));
}

const REWRITE_SYSTEM = `تو ویراستار ارشد حقوقی ایرانی هستی. مقاله را بازنویسی کن با زبان ساده و بلوک‌بندی جذاب.
خروجی فقط JSON باشد: {"excerpt":"خلاصه ۱–۲ جمله","priority":1-100,"readTimeMin":عدد,"blocks":[...]}
انواع بلوک: paragraph, heading, callout (variant: info|tip|warning|danger), steps (items:[...]), faq (items:[{q,a},...])
هر پاراگراف حداکثر ۴ جمله. حداقل ۱ callout. ۲–۵ سؤال FAQ. استنادات قانونی را حفظ کن. محتوا را حذف نکن.`;

// --- GET: آمار مقالات ---
export async function GET() {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  if (!fs.existsSync(SRC)) {
    return NextResponse.json({ error: "فایل articles.json پیدا نشد", path: SRC }, { status: 404 });
  }

  const all = JSON.parse(fs.readFileSync(SRC, "utf8")) as { section: string; title: string; content: string; sourceId: string }[];
  const eligible = all.filter(a => a.section === "post" && a.content.length > 600 && a.title.trim().length > 8);

  const scored = eligible.map(a => ({
    sourceId: a.sourceId,
    title: a.title.trim(),
    category: classify(a.title, a.content),
    priority: heuristicPriority(a.title, a.content),
    length: a.content.length,
  })).sort((a, b) => b.priority - a.priority);

  const existingSlugs = new Set(
    (await db.article.findMany({ select: { slug: true } })).map(a => a.slug)
  );

  const fresh = scored.filter(a => !existingSlugs.has(persianSlug(a.title, a.sourceId)));

  const catCounts: Record<string, number> = {};
  for (const a of fresh) { catCounts[a.category] = (catCounts[a.category] || 0) + 1; }

  return NextResponse.json({
    totalExtracted: all.length,
    eligible: eligible.length,
    alreadyImported: scored.length - fresh.length,
    readyToImport: fresh.length,
    categories: catCounts,
    articles: fresh.map(a => ({
      sourceId: a.sourceId,
      title: a.title,
      category: CATEGORIES.find(c => c.slug === a.category)?.nameFA || a.category,
      categorySlug: a.category,
      priority: a.priority,
      length: a.length,
    })),
  });
}

// --- POST: واردسازی ---
export async function POST(req: NextRequest) {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as { limit?: number; useAi?: boolean; sourceIds?: string[] };
  const useAi = body.useAi ?? false;

  if (!fs.existsSync(SRC)) {
    return NextResponse.json({ error: "فایل articles.json پیدا نشد" }, { status: 404 });
  }

  const all = JSON.parse(fs.readFileSync(SRC, "utf8")) as { section: string; title: string; content: string; sourceId: string; category?: string }[];
  const eligible = all.filter(a => a.section === "post" && a.content.length > 600 && a.title.trim().length > 8);

  const scored = eligible.map(a => ({
    ...a,
    cat: classify(a.title, a.content),
    priority: heuristicPriority(a.title, a.content),
  })).sort((a, b) => b.priority - a.priority);

  const existingSlugs = new Set(
    (await db.article.findMany({ select: { slug: true } })).map(a => a.slug)
  );
  const fresh = scored.filter(a => !existingSlugs.has(persianSlug(a.title, a.sourceId)));

  let toProcess;
  if (body.sourceIds && body.sourceIds.length > 0) {
    const idSet = new Set(body.sourceIds);
    toProcess = fresh.filter(a => idSet.has(a.sourceId)).slice(0, 50);
  } else {
    const limit = Math.min(body.limit || 5, 50);
    toProcess = fresh.slice(0, limit);
  }

  // دسته‌ها
  const catId: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const row = await db.category.upsert({ where: { slug: c.slug }, update: { nameFA: c.nameFA, nameEN: c.nameEN }, create: c });
    catId[c.slug] = row.id;
  }

  const authors = await db.teamMember.findMany({ where: { isActive: true }, select: { id: true } });
  const authorIds = authors.map(a => a.id);
  if (authorIds.length === 0) {
    return NextResponse.json({ error: "هیچ نویسنده‌ای فعال نیست" }, { status: 400 });
  }

  const PUBLISH_HOURS = [8, 14];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(8, 0, 0, 0);

  function scheduleDate(index: number): Date {
    const dayOffset = Math.floor(index / 2);
    const hourSlot = PUBLISH_HOURS[index % 2];
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hourSlot, 0, 0, 0);
    return d;
  }

  const results: { id: number; title: string; status: string; scheduledAt: string; aiUsed: boolean; error?: string }[] = [];

  // شمارنده برای زمان‌بندی (فقط مقالات موفق)
  const existingScheduled = await db.article.count({ where: { status: "SCHEDULED" } });
  let schedIdx = existingScheduled;

  for (let i = 0; i < toProcess.length; i++) {
    const a = toProcess[i];
    const catName = CATEGORIES.find(c => c.slug === a.cat)?.nameFA || a.cat;
    let blocks: Block[], excerpt: string | null, priority: number, readMin: number;
    let aiUsed = false;

    if (useAi) {
      try {
        const userPrompt = `عنوان: ${a.title}\nدسته: ${catName}\n\n--- متن اصلی ---\n${a.content.slice(0, 12000)}\n--- پایان ---\n\nبازنویسی کن. خروجی فقط JSON.`;
        const raw = await callAi({ prompt: REWRITE_SYSTEM + "\n\n" + userPrompt, maxTokens: 8192 });
        let json = raw;
        const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fence) json = fence[1];
        const parsed = JSON.parse(json.trim());
        blocks = parsed.blocks || [];
        excerpt = parsed.excerpt || null;
        priority = parsed.priority || a.priority;
        readMin = parsed.readTimeMin || readTime(a.content);
        aiUsed = true;
      } catch {
        const allBlocks = toBlocksSimple(a.content);
        const split = splitLead(allBlocks);
        blocks = split.body; excerpt = split.excerpt;
        priority = a.priority; readMin = readTime(a.content);
      }
    } else {
      const allBlocks = toBlocksSimple(a.content);
      const split = splitLead(allBlocks);
      blocks = split.body; excerpt = split.excerpt;
      priority = a.priority; readMin = readTime(a.content);
    }

    const slug = persianSlug(a.title, a.sourceId);
    const scheduledAt = scheduleDate(schedIdx);

    try {
      const created = await db.article.upsert({
        where: { slug },
        update: {
          title: a.title.trim(), excerpt, blocks: JSON.stringify(blocks),
          status: "SCHEDULED", priority, scheduledAt, readTimeMin: readMin, categoryId: catId[a.cat],
        },
        create: {
          authorId: authorIds[i % authorIds.length], categoryId: catId[a.cat],
          title: a.title.trim(), slug, excerpt, blocks: JSON.stringify(blocks),
          status: "SCHEDULED", priority, scheduledAt, readTimeMin: readMin, viewCount: 0,
        },
      });
      results.push({
        id: created.id, title: a.title.trim(), status: "SCHEDULED",
        scheduledAt: scheduledAt.toISOString(), aiUsed,
      });
      schedIdx++;
    } catch (err) {
      results.push({
        id: 0, title: a.title.trim(), status: "ERROR",
        scheduledAt: "", aiUsed, error: (err as Error).message.slice(0, 100),
      });
    }
  }

  const success = results.filter(r => r.status === "SCHEDULED").length;
  return NextResponse.json({
    imported: success,
    failed: results.length - success,
    results,
  });
}
