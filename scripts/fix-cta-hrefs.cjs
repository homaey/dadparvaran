/**
 * Fix CTA block hrefs across all articles.
 * - حذف پیشوند زبان اشتباه (/fa یا /en) از ابتدای href
 * - مقاله‌ی گواهی انحصار وراثت: سرویس ارث وجود ندارد، پس CTA به /contact می‌رود
 * Run: node scripts/fix-cta-hrefs.cjs
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

// سرویس‌هایی که واقعاً در services-data وجود دارند (برای اعتبارسنجی لینک‌های خدمات)
const KNOWN_SERVICES = new Set([
  "civil", "criminal", "family", "commercial", "property", "documents",
  "business", "outsourced-legal", "corporate-legal", "contract-drafting",
  "contract-review", "debt-collection", "consensual-divorce", "dowry-claim",
  "deed-registration", "eviction", "check", "check-claim", "fraud",
  "breach-of-trust", "possession-disputes",
]);

async function main() {
  const articles = await db.article.findMany({ select: { id: true, slug: true, blocks: true } });
  let changed = 0;

  for (const a of articles) {
    let blocks;
    try { blocks = JSON.parse(a.blocks); } catch { continue; }
    if (!Array.isArray(blocks)) continue;

    let touched = false;
    for (const b of blocks) {
      if (b?.type !== "cta" || typeof b.href !== "string") continue;
      const before = b.href;

      // 1) حذف پیشوند زبان تکراری
      let href = b.href.replace(/^\/(fa|en)(?=\/|$)/, "");

      // 2) اگر به سرویس ناموجود اشاره می‌کند، به /contact برگردان
      const svc = href.match(/^\/services\/([^/?#]+)/);
      if (svc && !KNOWN_SERVICES.has(svc[1])) {
        href = "/contact";
      }

      if (href !== before) {
        b.href = href;
        touched = true;
        console.log(`  id=${a.id}: "${before}" → "${href}"`);
      }
    }

    if (touched) {
      await db.article.update({ where: { id: a.id }, data: { blocks: JSON.stringify(blocks) } });
      changed++;
    }
  }

  console.log(`\n✓ ${changed} article(s) updated.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
