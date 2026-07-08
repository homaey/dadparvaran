/**
 * Check laws with big gaps (>2) to see if sub-pages have real missing articles.
 */
const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

// Laws with significant gaps from verify output
const bigGapLaws = [
  { name: 'قانون اداره تصفیه امور ورشکستگی', db: 33, src: 61, diff: 28 },
  { name: 'قانون مبارزه با قاچاق کالا و ارز', db: 78, src: 90, diff: 12 },
  { name: 'قانون ثبت اسناد و املاک', db: 157, src: 165, diff: 8 },
  { name: 'قانون مالیاتهای مستقیم', db: 288, src: 296, diff: 8 },
  { name: 'قانون صدور چک', db: 25, src: 30, diff: 5 },
  { name: 'قانون مدنی', db: 1335, src: 1339, diff: 4 },
  { name: 'قانون تملک آپارتمان‌ها', db: 15, src: 18, diff: 3 },
  { name: 'قانون مجازات اسلامی', db: 1014, src: 1017, diff: 3 },
  { name: 'تعزیرات و مجازات‌های بازدارنده', db: 286, src: 289, diff: 3 },
];

function getArticleNumbersFromPage(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const articles = [];
  const sectionLinks = [];

  $('[wire\\:key]').each((idx, el) => {
    const $el = $(el);
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'article') {
      const title = $el.find('a').first().text().trim();
      const numMatch = title.match(/ماده\s+(\S+)/);
      articles.push({
        title,
        articleNumber: numMatch ? numMatch[1] : null,
      });
    } else if (tagName === 'div' && $el.find('a span').length > 0) {
      const href = $el.find('a').attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);
      if (uidMatch) sectionLinks.push(uidMatch[1]);
    }
  });

  return { articles, sectionLinks };
}

function getAllArticleNumbers(uid, visited) {
  if (visited.has(uid)) return [];
  visited.add(uid);

  const dir = path.join(SRC, 'page', uid);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  if (files.length === 0) return [];

  const { articles, sectionLinks } = getArticleNumbersFromPage(path.join(dir, files[0]));
  let all = [...articles];

  for (const subUid of sectionLinks) {
    all = all.concat(getAllArticleNumbers(subUid, visited));
  }

  return all;
}

async function main() {
  for (const gap of bigGapLaws) {
    const law = await db.legalNode.findFirst({
      where: { type: 'LAW', title: { contains: gap.name.substring(0, 30) } },
    });
    if (!law) { console.log(`Not found: ${gap.name}`); continue; }

    const uid = law.lawKey?.replace('davoudabadi-', '');
    const visited = new Set();
    const sourceArticles = getAllArticleNumbers(uid, visited);

    const dbArticles = await db.legalNode.findMany({
      where: { lawId: law.id, type: 'ARTICLE' },
      select: { articleNumber: true, title: true },
    });
    const dbNums = new Set(dbArticles.map(a => a.articleNumber).filter(Boolean));

    // Find missing by article number
    const withNum = sourceArticles.filter(a => a.articleNumber);
    const withoutNum = sourceArticles.filter(a => !a.articleNumber);
    const missingByNum = withNum.filter(a => !dbNums.has(a.articleNumber));

    console.log(`\n=== ${law.title} ===`);
    console.log(`  DB: ${dbArticles.length} | Source total: ${sourceArticles.length} (${withNum.length} with number, ${withoutNum.length} without)`);
    console.log(`  Missing by article number: ${missingByNum.length}`);

    if (missingByNum.length > 0) {
      for (const m of missingByNum.slice(0, 10)) {
        console.log(`    ماده ${m.articleNumber}: "${m.title}"`);
      }
      if (missingByNum.length > 10) console.log(`    ... and ${missingByNum.length - 10} more`);
    }

    console.log(`  Without article number (closing text): ${withoutNum.length}`);
    for (const m of withoutNum.slice(0, 3)) {
      console.log(`    - "${m.title}"`);
    }
  }

  await db.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
