/**
 * Show EXACTLY what's in source but not in DB for each law.
 * Categorize as: real article, closing text, or duplicate.
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

function getArticlesFromMainPage(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const articles = [];

  $('[wire\\:key]').each((idx, el) => {
    const $el = $(el);
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'article') {
      const title = $el.find('a').first().text().trim();
      const content = $el.find('.post-text').text().trim();
      const numMatch = title.match(/ماده\s+(\S+)/);
      articles.push({
        title: title || '',
        articleNumber: numMatch ? numMatch[1] : null,
        contentStart: (content || '').substring(0, 100),
        hasContent: !!content,
      });
    }
  });

  return articles;
}

function isClosingText(art) {
  const c = art.contentStart || '';
  const t = art.title || '';
  if (!t && !c) return true;
  if (!t) {
    return c.includes('این قانون') || c.includes('رئیس مجلس') || c.includes('رییس مجلس') ||
      c.includes('بسم') || c.includes('قانون فوق') || c.includes('قانون بالا') ||
      c.includes('لَقَد') || c.includes('مشتمل بر');
  }
  return false;
}

async function main() {
  const laws = await db.legalNode.findMany({ where: { type: 'LAW' }, orderBy: { id: 'asc' } });

  const significantGaps = [];

  for (const law of laws) {
    const uid = law.lawKey?.replace('davoudabadi-', '');
    if (!uid) continue;

    const pageDir = path.join(SRC, 'page', uid);
    if (!fs.existsSync(pageDir)) continue;
    const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) continue;

    const sourceArticles = getArticlesFromMainPage(path.join(pageDir, htmlFiles[0]));
    const dbArticles = await db.legalNode.findMany({
      where: { lawId: law.id, type: 'ARTICLE' },
      select: { articleNumber: true, title: true },
    });

    const dbNums = new Set(dbArticles.map(a => a.articleNumber).filter(Boolean));
    const dbTitles = new Set(dbArticles.map(a => a.title));

    const missing = [];
    for (const sa of sourceArticles) {
      let found = false;
      if (sa.articleNumber && dbNums.has(sa.articleNumber)) found = true;
      if (!found && sa.title && dbTitles.has(sa.title)) found = true;
      if (!found) missing.push(sa);
    }

    if (missing.length === 0) continue;

    const realMissing = missing.filter(m => !isClosingText(m));
    const closingMissing = missing.filter(m => isClosingText(m));

    significantGaps.push({
      title: law.title,
      dbCount: dbArticles.length,
      sourceCount: sourceArticles.length,
      realMissing,
      closingMissing,
    });
  }

  // Summary
  let totalReal = 0;
  let totalClosing = 0;

  for (const gap of significantGaps) {
    totalReal += gap.realMissing.length;
    totalClosing += gap.closingMissing.length;

    if (gap.realMissing.length > 0) {
      console.log(`\n❌ ${gap.title} (DB: ${gap.dbCount}, Source main page: ${gap.sourceCount})`);
      console.log(`   Real missing: ${gap.realMissing.length}`);
      for (const m of gap.realMissing) {
        console.log(`     - "${m.title}" num=${m.articleNumber} content=${m.contentStart.substring(0, 60)}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Laws with closing text only (not real articles): ${significantGaps.filter(g => g.realMissing.length === 0).length}`);
  console.log(`Total closing/preamble text: ${totalClosing}`);
  console.log(`Total REAL missing from main page: ${totalReal}`);

  await db.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
