/* پایلوت: تبدیل مقالات استخراج‌شدهٔ صلح به فرمت بلوکی Article دادپروران و درج DRAFT.
   - دسته‌های جدید در صورت نبود ساخته می‌شوند (گسترش دسته‌بندی)
   - ۱۰ مقالهٔ متنوع انتخاب، بلوک‌بندی و درج DRAFT می‌شوند
   - یک نمونه PUBLISHED می‌شود تا زنده دیده شود */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const SRC = path.join("C:", "My Web Sites", "solh", "extracted", "articles.json");

// دسته‌های هدف (۵ موجود + ۵ جدید) — نگاشت اسلاگ→نام
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

// کلیدواژه‌های دسته‌بندی (اسلاگ ← واژه‌ها)
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

function classify(title, tags, content) {
  const hay = (title + " " + (tags || []).join(" ") + " " + content.slice(0, 900));
  let best = "civil-law", bestScore = 0;
  for (const [slug, words] of Object.entries(CAT_KEYWORDS)) {
    let s = 0;
    for (const w of words) { const m = hay.split(w).length - 1; s += m; }
    // وزن بیشتر برای عنوان
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

// متن markdown استخراج‌شده → آرایهٔ بلوک‌ها
function toBlocks(content) {
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

/* اولین پاراگراف را به‌عنوان مقدمهٔ برجسته (excerpt) جدا می‌کند و از بدنه حذف می‌کند
   تا در صفحه دوبار نمایش داده نشود. */
function splitLead(blocks) {
  const idx = blocks.findIndex(b => b.type === "paragraph");
  if (idx === -1) return { excerpt: null, body: blocks };
  const excerpt = blocks[idx].content;
  const body = blocks.slice(0, idx).concat(blocks.slice(idx + 1));
  return { excerpt, body };
}

function readTime(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

async function main() {
  const all = JSON.parse(fs.readFileSync(SRC, "utf8"));

  // ۱) ساخت/به‌روزرسانی دسته‌ها
  const catId = {};
  for (const c of CATEGORIES) {
    const row = await p.category.upsert({ where: { slug: c.slug }, update: { nameFA: c.nameFA, nameEN: c.nameEN }, create: c });
    catId[c.slug] = row.id;
  }
  console.log("دسته‌ها آماده شد:", Object.keys(catId).length);

  // ۲) انتخاب پایلوت: مقالات آموزشی با طول کافی، متنوع در دسته‌ها
  const eligible = all
    .filter(a => a.section === "post" && a.content.length > 900 && a.title.trim().length > 8)
    .map(a => ({ ...a, cat: classify(a.title, a.tags, a.content) }));

  const picked = [];
  const usedCats = new Set();
  // اول یکی از هر دسته
  for (const a of eligible) { if (picked.length >= 10) break; if (!usedCats.has(a.cat)) { picked.push(a); usedCats.add(a.cat); } }
  // سپس تکمیل تا ۱۰
  for (const a of eligible) { if (picked.length >= 10) break; if (!picked.includes(a)) picked.push(a); }

  const authors = [2, 3, 4, 5];
  const inserted = [];
  for (let i = 0; i < picked.length; i++) {
    const a = picked[i];
    const allBlocks = toBlocks(a.content);
    const { excerpt, body } = splitLead(allBlocks);
    const slug = persianSlug(a.title, a.sourceId);
    const rec = {
      authorId: authors[i % authors.length],
      categoryId: catId[a.cat],
      title: a.title.trim(),
      slug,
      excerpt,
      blocks: JSON.stringify(body),
      coverImage: null,
      status: "DRAFT",
      readTimeMin: readTime(a.content),
      viewCount: 0,
    };
    const created = await p.article.upsert({ where: { slug }, update: rec, create: rec });
    inserted.push({ id: created.id, slug, cat: a.cat, blocks: body.length, title: a.title.trim() });
  }

  // ۳) یک نمونه را PUBLISHED کن (طولانی‌ترین بلوک‌بندی)
  const sample = inserted.slice().sort((x, y) => y.blocks - x.blocks)[0];
  await p.article.update({ where: { id: sample.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });

  console.log("\n=== درج‌شده (DRAFT) ===");
  inserted.forEach(x => console.log(`#${x.id} [${x.cat}] بلوک=${x.blocks} | ${x.title}`));
  console.log("\n=== نمونهٔ PUBLISHED برای پیش‌نمایش زنده ===");
  console.log(`#${sample.id} | ${sample.title}\nslug: ${sample.slug}`);
  console.log(`URL: http://localhost:3001/fa/articles/${encodeURIComponent(sample.slug)}`);

  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
