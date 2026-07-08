/**
 * Fix missing articles by:
 * 1. Re-parsing source HTML for each law with missing articles
 * 2. Handling duplicate slugs
 * 3. Following sub-page links recursively
 * 4. Importing the "closing text" articles that were deleted (they had empty titles)
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

async function ensureUniqueSlug(parentId, baseSlug) {
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await db.legalNode.findFirst({ where: { parentId, slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

let globalOrder = 10000;

function parseWireKeyElements(html) {
  const $ = cheerio.load(html);
  const elements = [];
  const sectionLinks = {};

  $('[wire\\:key]').each((idx, el) => {
    const $el = $(el);
    const wireKey = $el.attr('wire:key') || `node-${idx}`;
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'div' && $el.find('a span').length > 0) {
      const title = $el.find('a').text().trim().replace(/^❯\s*/g, '');
      const href = $el.find('a').attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);
      elements.push({
        type: 'SECTION',
        wireKey,
        title,
        subUid: uidMatch ? uidMatch[1] : null,
      });
      if (uidMatch) sectionLinks[title] = uidMatch[1];
    } else if (tagName === 'article') {
      const articleLink = $el.find('a').first();
      const articleTitle = articleLink.text().trim();
      const articleText = $el.find('.post-text').text().trim();
      const numMatch = articleTitle.match(/ماده\s+(\S+)/);
      elements.push({
        type: 'ARTICLE',
        wireKey,
        title: articleTitle,
        articleNumber: numMatch ? numMatch[1] : null,
        content: articleText || null,
      });
    }
  });

  return { elements, sectionLinks, $ };
}

async function importMissingArticles(lawId, parentId, htmlPath, depth) {
  if (depth > 6) return 0;

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const { elements } = parseWireKeyElements(html);

  let imported = 0;
  let currentSectionId = null;

  for (const elem of elements) {
    if (elem.type === 'SECTION') {
      // Find existing section in DB
      const sectionSlug = makeSlug(elem.title);
      let section = await db.legalNode.findFirst({
        where: { parentId, slug: sectionSlug },
      });

      if (!section && elem.title) {
        // Try broader match
        section = await db.legalNode.findFirst({
          where: { parentId, title: elem.title, type: 'SECTION' },
        });
      }

      if (!section && elem.title) {
        const uniqueSlug = await ensureUniqueSlug(parentId, sectionSlug);
        section = await db.legalNode.create({
          data: {
            parentId,
            lawId,
            type: 'SECTION',
            title: elem.title,
            slug: uniqueSlug,
            orderIndex: globalOrder++,
          },
        });
        imported++;
      }

      currentSectionId = section ? section.id : parentId;

      // Follow sub-page if exists
      if (elem.subUid) {
        const subDir = path.join(SRC, 'page', elem.subUid);
        if (fs.existsSync(subDir)) {
          const subFiles = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
          if (subFiles.length > 0) {
            imported += await importMissingArticles(
              lawId,
              currentSectionId,
              path.join(subDir, subFiles[0]),
              depth + 1
            );
          }
        }
      }
    } else if (elem.type === 'ARTICLE') {
      const targetParent = currentSectionId || parentId;

      let baseSlug;
      if (elem.articleNumber) {
        baseSlug = `ماده-${elem.articleNumber}`;
      } else if (elem.title) {
        baseSlug = makeSlug(elem.title);
      } else {
        baseSlug = `article-${globalOrder}`;
      }

      // Check if already exists
      const existing = await db.legalNode.findFirst({
        where: { parentId: targetParent, slug: baseSlug },
      });

      if (!existing) {
        const title = elem.title || (elem.content ? elem.content.substring(0, 60) + '...' : 'متن قانون');
        const uniqueSlug = await ensureUniqueSlug(targetParent, baseSlug || 'article');
        await db.legalNode.create({
          data: {
            parentId: targetParent,
            lawId,
            type: 'ARTICLE',
            title,
            slug: uniqueSlug,
            articleNumber: elem.articleNumber,
            content: elem.content,
            orderIndex: globalOrder++,
            sourceUrl: `https://davoudabadi.ir/page/${elem.wireKey}`,
          },
        });
        imported++;
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

  console.log(`Processing ${laws.length} laws...\n`);

  let totalImported = 0;

  for (const law of laws) {
    const uid = law.lawKey?.replace('davoudabadi-', '');
    if (!uid) continue;

    const pageDir = path.join(SRC, 'page', uid);
    if (!fs.existsSync(pageDir)) continue;

    const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) continue;

    const htmlPath = path.join(pageDir, htmlFiles[0]);

    const beforeCount = await db.legalNode.count({
      where: { lawId: law.id, type: 'ARTICLE' },
    });

    const imported = await importMissingArticles(law.id, law.id, htmlPath, 0);

    if (imported > 0) {
      const afterCount = await db.legalNode.count({
        where: { lawId: law.id, type: 'ARTICLE' },
      });
      console.log(`✓ ${law.title}: +${imported} (${beforeCount} → ${afterCount})`);
      totalImported += imported;
    }
  }

  console.log(`\nTotal imported: ${totalImported}`);

  // Final stats
  const totalArticles = await db.legalNode.count({ where: { type: 'ARTICLE' } });
  const totalSections = await db.legalNode.count({ where: { type: 'SECTION' } });
  console.log(`DB totals: ${totalArticles} articles, ${totalSections} sections`);

  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
