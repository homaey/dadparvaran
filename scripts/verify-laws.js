/**
 * Verify all imported laws against the davoudabadi.ir mirror source.
 * Compares article counts, checks for missing content, etc.
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

function countArticlesInHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  let articles = 0;
  let sections = 0;
  const sectionLinks = [];

  $('[wire\\:key]').each((i, el) => {
    const tag = el.tagName?.toLowerCase();
    if (tag === 'article') {
      articles++;
    } else if (tag === 'div' && $(el).find('a span').length > 0) {
      sections++;
      const href = $(el).find('a').attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);
      if (uidMatch) sectionLinks.push(uidMatch[1]);
    }
  });

  // Check for .post-text without wire:key (ماده واحده)
  if (articles === 0 && sections === 0) {
    const postText = $('.post-text');
    if (postText.length > 0 && postText.text().trim().length > 0) {
      articles = 1; // ماده واحده
    }
  }

  return { articles, sections, sectionLinks };
}

function countArticlesInSubPages(sectionLinks) {
  let total = 0;
  const details = [];

  for (const uid of sectionLinks) {
    const subDir = path.join(SRC, 'page', uid);
    if (!fs.existsSync(subDir)) continue;

    const files = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
    if (files.length === 0) continue;

    const html = fs.readFileSync(path.join(subDir, files[0]), 'utf-8');
    const $ = cheerio.load(html);

    let subArticles = 0;
    let subSectionLinks = [];

    $('[wire\\:key]').each((i, el) => {
      const tag = el.tagName?.toLowerCase();
      if (tag === 'article') {
        subArticles++;
      } else if (tag === 'div' && $(el).find('a span').length > 0) {
        const href = $(el).find('a').attr('href') || '';
        const uidMatch = href.match(/\.\.\/(\d+)\//);
        if (uidMatch) subSectionLinks.push(uidMatch[1]);
      }
    });

    if (subArticles > 0) {
      total += subArticles;
      details.push({ uid, articles: subArticles });
    }

    // Recurse into sub-sections
    if (subSectionLinks.length > 0 && subArticles === 0) {
      const nested = countArticlesInSubPages(subSectionLinks);
      total += nested.total;
      details.push(...nested.details);
    }
  }

  return { total, details };
}

async function main() {
  const laws = await db.legalNode.findMany({
    where: { type: 'LAW' },
    orderBy: { id: 'asc' },
  });

  console.log(`Verifying ${laws.length} laws against source...\n`);

  const issues = [];
  let perfectMatch = 0;

  for (const law of laws) {
    const uid = law.lawKey?.replace('davoudabadi-', '');
    if (!uid) {
      issues.push({ law: law.title, issue: 'NO_UID' });
      continue;
    }

    const pageDir = path.join(SRC, 'page', uid);
    if (!fs.existsSync(pageDir)) {
      issues.push({ law: law.title, issue: 'NO_SOURCE_DIR', uid });
      continue;
    }

    const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) {
      issues.push({ law: law.title, issue: 'NO_HTML_FILE', uid });
      continue;
    }

    const htmlPath = path.join(pageDir, htmlFiles[0]);
    const source = countArticlesInHtml(htmlPath);

    // Get DB counts
    const dbArticles = await db.legalNode.count({
      where: { lawId: law.id, type: 'ARTICLE' },
    });
    const dbSections = await db.legalNode.count({
      where: { lawId: law.id, type: 'SECTION' },
    });

    // For laws with sections that link to sub-pages, count articles recursively
    let expectedArticles = source.articles;
    if (source.sections > 0 && source.articles === 0 && source.sectionLinks.length > 0) {
      const subResult = countArticlesInSubPages(source.sectionLinks);
      expectedArticles = subResult.total;
    }

    // Check for articles without content
    const emptyContentArticles = await db.legalNode.count({
      where: { lawId: law.id, type: 'ARTICLE', content: null },
    });
    const emptyContentArticles2 = await db.legalNode.count({
      where: { lawId: law.id, type: 'ARTICLE', content: '' },
    });
    const totalEmpty = emptyContentArticles + emptyContentArticles2;

    // Compare
    const articleDiff = dbArticles - expectedArticles;

    if (articleDiff !== 0 || totalEmpty > 0) {
      const entry = {
        law: law.title,
        uid,
        dbArticles,
        expectedArticles,
        diff: articleDiff,
        dbSections,
        sourceSections: source.sections,
        emptyContent: totalEmpty,
      };
      issues.push(entry);

      const diffStr = articleDiff > 0 ? `+${articleDiff}` : `${articleDiff}`;
      const emptyStr = totalEmpty > 0 ? ` (${totalEmpty} empty)` : '';
      console.log(`⚠ ${law.title}`);
      console.log(`    DB: ${dbArticles} articles, ${dbSections} sections | Source: ${expectedArticles} articles, ${source.sections} sections | diff: ${diffStr}${emptyStr}`);
    } else {
      perfectMatch++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`RESULTS:`);
  console.log(`  Total laws: ${laws.length}`);
  console.log(`  Perfect match: ${perfectMatch}`);
  console.log(`  With issues: ${issues.length}`);

  if (issues.length > 0) {
    console.log(`\nISSUE SUMMARY:`);

    const missingArticles = issues.filter(i => i.diff < 0);
    const extraArticles = issues.filter(i => i.diff > 0);
    const emptyOnly = issues.filter(i => i.diff === 0 && i.emptyContent > 0);

    if (missingArticles.length > 0) {
      console.log(`\n  MISSING ARTICLES (${missingArticles.length} laws):`);
      for (const i of missingArticles) {
        console.log(`    ${i.law}: missing ${Math.abs(i.diff)} (DB: ${i.dbArticles}, Source: ${i.expectedArticles})`);
      }
    }

    if (extraArticles.length > 0) {
      console.log(`\n  EXTRA ARTICLES (${extraArticles.length} laws):`);
      for (const i of extraArticles) {
        console.log(`    ${i.law}: +${i.diff} extra (DB: ${i.dbArticles}, Source: ${i.expectedArticles})`);
      }
    }

    if (emptyOnly.length > 0) {
      console.log(`\n  EMPTY CONTENT ONLY (${emptyOnly.length} laws):`);
      for (const i of emptyOnly) {
        console.log(`    ${i.law}: ${i.emptyContent} articles without content`);
      }
    }
  }

  // Total article count
  const totalDbArticles = await db.legalNode.count({ where: { type: 'ARTICLE' } });
  const totalEmptyContent = await db.legalNode.count({ where: { type: 'ARTICLE', content: null } });
  const totalEmptyContent2 = await db.legalNode.count({ where: { type: 'ARTICLE', content: '' } });
  console.log(`\nTOTALS:`);
  console.log(`  DB articles: ${totalDbArticles}`);
  console.log(`  Articles with null content: ${totalEmptyContent}`);
  console.log(`  Articles with empty content: ${totalEmptyContent2}`);

  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
