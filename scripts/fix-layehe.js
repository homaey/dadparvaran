const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

function makeSlug(title) {
  return title.replace(/\s+/g, '-').replace(/[^؀-ۿݐ-ݿa-zA-Z0-9\-]/g, '').substring(0, 200);
}

let globalOrder = 0;

async function processSubPage(subUid, parentId, lawId, depth) {
  const subDir = path.join(SRC, 'page', subUid);
  if (!fs.existsSync(subDir)) return;

  const files = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
  if (files.length === 0) return;

  const html = fs.readFileSync(path.join(subDir, files[0]), 'utf-8');
  const $ = cheerio.load(html);

  const wireKeys = $('[wire\\:key]');

  wireKeys.each((idx, el) => {});

  let currentSection = null;

  for (let idx = 0; idx < wireKeys.length; idx++) {
    const el = wireKeys[idx];
    const $el = $(el);
    const wireKey = $el.attr('wire:key') || `node-${idx}`;
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'div' && $el.find('a span').length > 0) {
      const title = $el.find('a').text().trim().replace(/^❯\s*/, '').replace(/^❯\s*/, '');
      const href = $el.find('a').attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);

      if (title) {
        const slug = makeSlug(title);
        const existing = await db.legalNode.findFirst({ where: { parentId, slug } });

        if (existing) {
          currentSection = existing;
          if (uidMatch && depth < 5) {
            const artCount = await db.legalNode.count({ where: { parentId: existing.id, type: 'ARTICLE' } });
            if (artCount === 0) {
              await processSubPage(uidMatch[1], existing.id, lawId, depth + 1);
            }
          }
        } else {
          currentSection = await db.legalNode.create({
            data: {
              parentId,
              lawId,
              type: 'SECTION',
              title,
              slug,
              orderIndex: globalOrder++,
            },
          });
          console.log('  '.repeat(depth) + `  ✓ Section: ${title}`);

          if (uidMatch && depth < 5) {
            await processSubPage(uidMatch[1], currentSection.id, lawId, depth + 1);
          }
        }
      }
    } else if (tagName === 'article') {
      const articleTitle = $el.find('a').first().text().trim();
      const articleText = $el.find('.post-text').text().trim();
      const numMatch = articleTitle.match(/ماده\s+(\S+)/);
      const articleNumber = numMatch ? numMatch[1] : null;
      const slug = articleNumber ? `ماده-${articleNumber}` : makeSlug(articleTitle);

      const targetParent = currentSection || parentId;
      const targetParentId = typeof targetParent === 'number' ? targetParent : targetParent.id;

      const existing = await db.legalNode.findFirst({ where: { parentId: targetParentId, slug } });
      if (!existing && articleTitle) {
        await db.legalNode.create({
          data: {
            parentId: targetParentId,
            lawId,
            type: 'ARTICLE',
            title: articleTitle,
            slug,
            articleNumber,
            content: articleText || null,
            orderIndex: globalOrder++,
            sourceUrl: `https://davoudabadi.ir/page/${wireKey}`,
          },
        });
      }
    }
  }
}

async function main() {
  const law = await db.legalNode.findFirst({
    where: { type: 'LAW', title: { contains: 'لایحه قانونی اصلاح' } },
  });
  if (!law) { console.log('Law not found'); return; }

  console.log('Law:', law.title);
  const uid = law.lawKey.replace('davoudabadi-', '');

  // Get existing top-level section
  const topSection = await db.legalNode.findFirst({
    where: { parentId: law.id, type: 'SECTION' },
  });

  // Get sub-sections that were created but have no articles
  const subSections = await db.legalNode.findMany({
    where: { parentId: topSection.id, type: 'SECTION' },
    orderBy: { orderIndex: 'asc' },
  });

  console.log('Sub-sections:', subSections.length);

  // Read main page to get section link for topSection
  const pageDir = path.join(SRC, 'page', uid);
  const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
  const html = fs.readFileSync(path.join(pageDir, htmlFiles[0]), 'utf-8');
  const $ = cheerio.load(html);

  const topLink = $('[wire\\:key] a').first().attr('href') || '';
  const topUidMatch = topLink.match(/\.\.\/(\d+)\//);

  if (topUidMatch) {
    const topSubDir = path.join(SRC, 'page', topUidMatch[1]);
    const topSubFiles = fs.readdirSync(topSubDir).filter(f => f.endsWith('.html'));
    const topSubHtml = fs.readFileSync(path.join(topSubDir, topSubFiles[0]), 'utf-8');
    const $top = cheerio.load(topSubHtml);

    // Get sub-section links
    const subLinks = [];
    $top('[wire\\:key] a').each((i, el) => {
      const href = $top(el).attr('href') || '';
      const uidMatch = href.match(/\.\.\/(\d+)\//);
      if (uidMatch) subLinks.push(uidMatch[1]);
    });

    console.log('Sub-section links:', subLinks.length);

    for (let i = 0; i < subSections.length && i < subLinks.length; i++) {
      const section = subSections[i];
      const subUid = subLinks[i];

      const artCount = await db.legalNode.count({ where: { parentId: section.id, type: 'ARTICLE' } });
      if (artCount > 0) {
        console.log(`  Skip ${section.title} (already has ${artCount} articles)`);
        continue;
      }

      console.log(`  Processing: ${section.title} (uid: ${subUid})`);
      await processSubPage(subUid, section.id, law.id, 2);
    }
  }

  const totalArticles = await db.legalNode.count({ where: { lawId: law.id, type: 'ARTICLE' } });
  const totalSections = await db.legalNode.count({ where: { lawId: law.id, type: 'SECTION' } });
  console.log(`\nTotal: ${totalSections} sections, ${totalArticles} articles`);

  await db.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
