/**
 * Find exactly which articles are in source but not in DB.
 * Check if they're real articles or just closing text.
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

function getAllArticlesFromHtml(htmlPath, parentContext) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const articles = [];
  const sectionLinks = [];

  $('[wire\\:key]').each((idx, el) => {
    const $el = $(el);
    const wireKey = $el.attr('wire:key') || `node-${idx}`;
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'article') {
      const title = $el.find('a').first().text().trim();
      const content = $el.find('.post-text').text().trim();
      const numMatch = title.match(/ماده\s+(\S+)/);
      articles.push({
        title: title || '(بدون عنوان)',
        articleNumber: numMatch ? numMatch[1] : null,
        contentPreview: (content || '').substring(0, 80),
        wireKey,
        parent: parentContext,
      });
    } else if (tagName === 'div' && $el.find('a span').length > 0) {
      const sectionTitle = $el.find('a').text().trim().replace(/^❯\s*/g, '');
      const href = $el.find('a').attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);
      if (uidMatch) {
        sectionLinks.push({ title: sectionTitle, uid: uidMatch[1] });
      }
    }
  });

  return { articles, sectionLinks };
}

function getAllArticlesRecursive(htmlPath, parentContext, depth, visited) {
  if (depth > 4 || visited.has(htmlPath)) return [];
  visited.add(htmlPath);

  const { articles, sectionLinks } = getAllArticlesFromHtml(htmlPath, parentContext);
  let allArticles = [...articles];

  for (const link of sectionLinks) {
    const subDir = path.join(SRC, 'page', link.uid);
    if (!fs.existsSync(subDir)) continue;
    const files = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
    if (files.length === 0) continue;

    const subArticles = getAllArticlesRecursive(
      path.join(subDir, files[0]),
      link.title,
      depth + 1,
      visited
    );
    allArticles = allArticles.concat(subArticles);
  }

  return allArticles;
}

async function main() {
  // Focus on laws with significant differences
  const laws = await db.legalNode.findMany({
    where: { type: 'LAW' },
    orderBy: { id: 'asc' },
  });

  let totalMissingReal = 0;
  let totalMissingClosing = 0;

  for (const law of laws) {
    const uid = law.lawKey?.replace('davoudabadi-', '');
    if (!uid) continue;

    const pageDir = path.join(SRC, 'page', uid);
    if (!fs.existsSync(pageDir)) continue;
    const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) continue;

    const visited = new Set();
    const sourceArticles = getAllArticlesRecursive(
      path.join(pageDir, htmlFiles[0]),
      'root',
      0,
      visited
    );

    const dbArticleCount = await db.legalNode.count({
      where: { lawId: law.id, type: 'ARTICLE' },
    });

    const diff = sourceArticles.length - dbArticleCount;
    if (diff <= 0) continue;

    // Categorize missing articles
    const dbArticles = await db.legalNode.findMany({
      where: { lawId: law.id, type: 'ARTICLE' },
      select: { title: true, articleNumber: true, slug: true },
    });
    const dbArticleNumbers = new Set(dbArticles.map(a => a.articleNumber).filter(Boolean));
    const dbTitles = new Set(dbArticles.map(a => a.title));

    let missingReal = 0;
    let missingClosing = 0;
    const missingDetails = [];

    for (const sa of sourceArticles) {
      let found = false;
      if (sa.articleNumber && dbArticleNumbers.has(sa.articleNumber)) found = true;
      if (!found && sa.title && dbTitles.has(sa.title)) found = true;

      if (!found) {
        const isClosingText = !sa.title || sa.title === '(بدون عنوان)' ||
          sa.contentPreview.includes('این قانون') ||
          sa.contentPreview.includes('رئیس مجلس') ||
          sa.contentPreview.includes('رییس مجلس') ||
          sa.contentPreview.includes('بسم الله') ||
          sa.contentPreview.includes('بسم‌ الله');

        if (isClosingText) {
          missingClosing++;
        } else {
          missingReal++;
          missingDetails.push(sa);
        }
      }
    }

    if (missingReal > 0 || missingClosing > 0) {
      console.log(`\n${law.title} (DB: ${dbArticleCount}, Source: ${sourceArticles.length}, diff: ${diff})`);
      if (missingClosing > 0) console.log(`  Closing/preamble text: ${missingClosing} (not real articles)`);
      if (missingReal > 0) {
        console.log(`  REAL MISSING: ${missingReal}`);
        for (const m of missingDetails.slice(0, 10)) {
          console.log(`    - "${m.title}" num=${m.articleNumber} parent=${m.parent} content=${m.contentPreview.substring(0, 50)}`);
        }
        if (missingDetails.length > 10) console.log(`    ... and ${missingDetails.length - 10} more`);
      }
      totalMissingReal += missingReal;
      totalMissingClosing += missingClosing;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total missing real articles: ${totalMissingReal}`);
  console.log(`Total missing closing text: ${totalMissingClosing}`);

  await db.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
