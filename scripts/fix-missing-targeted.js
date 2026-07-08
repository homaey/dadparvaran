/**
 * Targeted fix: import only REAL missing articles.
 * Checks by articleNumber to avoid duplicates.
 * Follows section sub-pages to find articles in nested sections.
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

function makeSlug(title) {
  return title.replace(/\s+/g, '-').replace(/[^؀-ۿݐ-ݿa-zA-Z0-9\-]/g, '').substring(0, 200);
}

function parsePageStructure(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const items = [];
  let currentSection = null;

  $('[wire\\:key]').each((idx, el) => {
    const $el = $(el);
    const wireKey = $el.attr('wire:key') || `node-${idx}`;
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'div' && $el.find('a span').length > 0) {
      const title = $el.find('a').text().trim().replace(/^❯\s*/g, '');
      const href = $el.find('a').attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);
      currentSection = {
        type: 'SECTION',
        title,
        subUid: uidMatch ? uidMatch[1] : null,
        children: [],
      };
      items.push(currentSection);
    } else if (tagName === 'article') {
      const articleTitle = $el.find('a').first().text().trim();
      const articleText = $el.find('.post-text').text().trim();
      const numMatch = articleTitle.match(/ماده\s+(\S+)/);
      const article = {
        type: 'ARTICLE',
        title: articleTitle,
        articleNumber: numMatch ? numMatch[1] : null,
        content: articleText || null,
        wireKey,
      };
      if (currentSection) {
        currentSection.children.push(article);
      } else {
        items.push(article);
      }
    }
  });

  return items;
}

async function findOrCreateSection(parentId, lawId, sectionTitle) {
  const slug = makeSlug(sectionTitle);

  let section = await db.legalNode.findFirst({
    where: { parentId, type: 'SECTION', slug },
  });
  if (section) return section;

  // Try matching by title
  section = await db.legalNode.findFirst({
    where: { parentId, type: 'SECTION', title: sectionTitle },
  });
  if (section) return section;

  // Create new section
  section = await db.legalNode.create({
    data: {
      parentId,
      lawId,
      type: 'SECTION',
      title: sectionTitle,
      slug,
      orderIndex: 9000,
    },
  });
  return section;
}

async function processLaw(law, existingArticleNums) {
  const uid = law.lawKey?.replace('davoudabadi-', '');
  if (!uid) return 0;

  const pageDir = path.join(SRC, 'page', uid);
  if (!fs.existsSync(pageDir)) return 0;

  const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
  if (htmlFiles.length === 0) return 0;

  const items = parsePageStructure(path.join(pageDir, htmlFiles[0]));
  let imported = 0;

  for (const item of items) {
    if (item.type === 'SECTION' && item.subUid) {
      // This section links to a sub-page. Check if we need to import articles from it.
      const section = await findOrCreateSection(law.id, law.id, item.title);

      // Process sub-page
      imported += await processSubPage(item.subUid, section.id, law.id, existingArticleNums, 0);
    }
  }

  return imported;
}

async function processSubPage(subUid, parentId, lawId, existingArticleNums, depth) {
  if (depth > 5) return 0;

  const subDir = path.join(SRC, 'page', subUid);
  if (!fs.existsSync(subDir)) return 0;

  const files = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
  if (files.length === 0) return 0;

  const items = parsePageStructure(path.join(subDir, files[0]));
  let imported = 0;
  let orderIdx = 9000 + depth * 100;

  for (const item of items) {
    if (item.type === 'SECTION') {
      // Nested section
      const section = await findOrCreateSection(parentId, lawId, item.title);

      // Import direct children articles
      for (const child of item.children) {
        if (child.type === 'ARTICLE' && child.articleNumber) {
          if (!existingArticleNums.has(child.articleNumber)) {
            const slug = `ماده-${child.articleNumber}`;
            const existing = await db.legalNode.findFirst({ where: { parentId: section.id, slug } });
            if (!existing) {
              await db.legalNode.create({
                data: {
                  parentId: section.id,
                  lawId,
                  type: 'ARTICLE',
                  title: child.title,
                  slug,
                  articleNumber: child.articleNumber,
                  content: child.content,
                  orderIndex: orderIdx++,
                  sourceUrl: `https://davoudabadi.ir/page/${child.wireKey}`,
                },
              });
              existingArticleNums.add(child.articleNumber);
              imported++;
            }
          }
        }
      }

      // Follow sub-page if exists
      if (item.subUid) {
        imported += await processSubPage(item.subUid, section.id, lawId, existingArticleNums, depth + 1);
      }
    } else if (item.type === 'ARTICLE' && item.articleNumber) {
      if (!existingArticleNums.has(item.articleNumber)) {
        const slug = `ماده-${item.articleNumber}`;
        const existing = await db.legalNode.findFirst({ where: { parentId, slug } });
        if (!existing) {
          await db.legalNode.create({
            data: {
              parentId,
              lawId,
              type: 'ARTICLE',
              title: item.title,
              slug,
              articleNumber: item.articleNumber,
              content: item.content,
              orderIndex: orderIdx++,
              sourceUrl: `https://davoudabadi.ir/page/${item.wireKey}`,
            },
          });
          existingArticleNums.add(item.articleNumber);
          imported++;
        }
      }
    }
  }

  return imported;
}

async function main() {
  const laws = await db.legalNode.findMany({
    where: { type: 'LAW' },
    orderBy: { id: 'asc' },
  });

  let totalImported = 0;

  for (const law of laws) {
    // Get existing article numbers for this law
    const existingArticles = await db.legalNode.findMany({
      where: { lawId: law.id, type: 'ARTICLE' },
      select: { articleNumber: true },
    });
    const existingNums = new Set(existingArticles.map(a => a.articleNumber).filter(Boolean));

    const imported = await processLaw(law, existingNums);

    if (imported > 0) {
      const newCount = await db.legalNode.count({ where: { lawId: law.id, type: 'ARTICLE' } });
      console.log(`✓ ${law.title}: +${imported} → ${newCount} articles`);
      totalImported += imported;
    }
  }

  console.log(`\nTotal imported: ${totalImported}`);

  const totalArticles = await db.legalNode.count({ where: { type: 'ARTICLE' } });
  const totalSections = await db.legalNode.count({ where: { type: 'SECTION' } });
  console.log(`DB totals: ${totalArticles} articles, ${totalSections} sections`);

  await db.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
