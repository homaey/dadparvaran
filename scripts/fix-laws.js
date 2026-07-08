/**
 * Fix imported laws:
 * 1. Remove nodes with empty titles
 * 2. Import articles for "ماده واحده" laws (no wire:key, content in .post-text)
 * 3. Import articles for section-only laws (sections link to sub-pages with articles)
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();
const SRC = 'C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir';

function makeSlug(title) {
  return title
    .replace(/\s+/g, '-')
    .replace(/[^؀-ۿݐ-ݿa-zA-Z0-9\-]/g, '')
    .substring(0, 200);
}

function parseArticlesFromHtml(html) {
  const $ = cheerio.load(html);
  const articles = [];

  $('[wire\\:key]').each((idx, el) => {
    const $el = $(el);
    const wireKey = $el.attr('wire:key') || `node-${idx}`;
    const tagName = el.tagName?.toLowerCase();

    if (tagName === 'article') {
      const articleLink = $el.find('a').first();
      const articleTitle = articleLink.text().trim();
      const articleText = $el.find('.post-text').text().trim();
      const numMatch = articleTitle.match(/ماده\s+(\S+)/);

      articles.push({
        uid: wireKey,
        title: articleTitle,
        articleNumber: numMatch ? numMatch[1] : null,
        content: articleText || null,
      });
    }
  });

  return articles;
}

async function main() {
  console.log('=== Step 1: Remove empty title nodes ===');
  const emptyTitles = await db.legalNode.findMany({ where: { title: '' } });
  console.log(`Found ${emptyTitles.length} nodes with empty titles`);
  if (emptyTitles.length > 0) {
    await db.legalNode.deleteMany({ where: { title: '' } });
    console.log(`Deleted ${emptyTitles.length} empty title nodes`);
  }

  console.log('\n=== Step 2: Fix "ماده واحده" laws (no wire:key) ===');
  const noArticleLaws = await db.legalNode.findMany({
    where: { type: 'LAW' },
  });

  for (const law of noArticleLaws) {
    const articleCount = await db.legalNode.count({
      where: { lawId: law.id, type: 'ARTICLE' },
    });
    if (articleCount > 0) continue;

    const childCount = await db.legalNode.count({
      where: { lawId: law.id, id: { not: law.id } },
    });

    const uid = law.lawKey?.replace('davoudabadi-', '');
    if (!uid) continue;

    const pageDir = path.join(SRC, 'page', uid);
    if (!fs.existsSync(pageDir)) continue;

    const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) continue;

    const html = fs.readFileSync(path.join(pageDir, htmlFiles[0]), 'utf-8');
    const $ = cheerio.load(html);
    const wireKeys = $('[wire\\:key]');

    if (wireKeys.length === 0 && childCount === 0) {
      // "ماده واحده" - single article in .post-text
      const postText = $('.post-text');
      if (postText.length > 0) {
        const content = postText.text().trim();
        if (content) {
          await db.legalNode.create({
            data: {
              parentId: law.id,
              lawId: law.id,
              type: 'ARTICLE',
              title: 'ماده واحده',
              slug: 'ماده-واحده',
              articleNumber: 'واحده',
              content,
              orderIndex: 0,
              sourceUrl: law.sourceUrl,
            },
          });
          console.log(`  ✓ Created ماده واحده for: ${law.title}`);
        }
      }
    } else if (childCount > 0 && articleCount === 0) {
      // Has sections but no articles - check sub-pages
      const sections = await db.legalNode.findMany({
        where: { parentId: law.id, type: 'SECTION' },
        orderBy: { orderIndex: 'asc' },
      });

      // Extract section UIDs from the HTML links
      const sectionLinks = [];
      $('[wire\\:key]').each((i, el) => {
        const href = $(el).find('a').attr('href') || '';
        const uidMatch = href.match(/\.\.\/(\d+)\//);
        if (uidMatch) {
          sectionLinks.push(uidMatch[1]);
        }
      });

      let globalOrder = 0;
      for (let si = 0; si < sections.length && si < sectionLinks.length; si++) {
        const section = sections[si];
        const subUid = sectionLinks[si];
        const subDir = path.join(SRC, 'page', subUid);

        if (!fs.existsSync(subDir)) continue;

        const subFiles = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
        if (subFiles.length === 0) continue;

        const subHtml = fs.readFileSync(path.join(subDir, subFiles[0]), 'utf-8');
        const articles = parseArticlesFromHtml(subHtml);

        for (const art of articles) {
          const slug = art.articleNumber ? `ماده-${art.articleNumber}` : makeSlug(art.title);

          const existing = await db.legalNode.findFirst({
            where: { parentId: section.id, slug },
          });
          if (existing) continue;

          await db.legalNode.create({
            data: {
              parentId: section.id,
              lawId: law.id,
              type: 'ARTICLE',
              title: art.title,
              slug,
              articleNumber: art.articleNumber,
              content: art.content,
              orderIndex: globalOrder++,
              sourceUrl: `https://davoudabadi.ir/page/${art.uid}`,
            },
          });
        }

        if (articles.length > 0) {
          console.log(`  ✓ Added ${articles.length} articles to section "${section.title}" of ${law.title}`);
        }
      }
    }
  }

  console.log('\n=== Step 3: Fix لایحه قانونی تجارت ===');
  const layehe = await db.legalNode.findFirst({
    where: { type: 'LAW', title: { contains: 'لایحه قانونی اصلاح' } },
  });
  if (layehe) {
    const artCount = await db.legalNode.count({ where: { lawId: layehe.id, type: 'ARTICLE' } });
    if (artCount === 0) {
      const uid = layehe.lawKey?.replace('davoudabadi-', '');
      const pageDir = path.join(SRC, 'page', uid);
      if (fs.existsSync(pageDir)) {
        const htmlFiles = fs.readdirSync(pageDir).filter(f => f.endsWith('.html'));
        if (htmlFiles.length > 0) {
          const html = fs.readFileSync(path.join(pageDir, htmlFiles[0]), 'utf-8');
          const $ = cheerio.load(html);

          // Check for section sub-pages
          const sections = await db.legalNode.findMany({
            where: { parentId: layehe.id, type: 'SECTION' },
            orderBy: { orderIndex: 'asc' },
          });

          const sectionLinks = [];
          $('[wire\\:key]').each((i, el) => {
            const href = $(el).find('a').attr('href') || '';
            const uidMatch = href.match(/\.\.\/(\d+)\//);
            if (uidMatch) sectionLinks.push(uidMatch[1]);
          });

          let globalOrder = 0;
          for (let si = 0; si < sections.length && si < sectionLinks.length; si++) {
            const section = sections[si];
            const subUid = sectionLinks[si];
            const subDir = path.join(SRC, 'page', subUid);
            if (!fs.existsSync(subDir)) continue;

            const subFiles = fs.readdirSync(subDir).filter(f => f.endsWith('.html'));
            if (subFiles.length === 0) continue;

            const subHtml = fs.readFileSync(path.join(subDir, subFiles[0]), 'utf-8');
            const articles = parseArticlesFromHtml(subHtml);

            for (const art of articles) {
              const slug = art.articleNumber ? `ماده-${art.articleNumber}` : makeSlug(art.title);
              const existing = await db.legalNode.findFirst({ where: { parentId: section.id, slug } });
              if (existing) continue;

              await db.legalNode.create({
                data: {
                  parentId: section.id,
                  lawId: layehe.id,
                  type: 'ARTICLE',
                  title: art.title,
                  slug,
                  articleNumber: art.articleNumber,
                  content: art.content,
                  orderIndex: globalOrder++,
                  sourceUrl: `https://davoudabadi.ir/page/${art.uid}`,
                },
              });
            }

            if (articles.length > 0) {
              console.log(`  ✓ Added ${articles.length} articles to "${section.title}"`);
            }
          }
        }
      }
    }
  }

  // Also check قانون جرایم رایانه ای  - it has 0 children and wire:key 0, but might have .post-text
  // Already handled in step 2

  console.log('\n=== Summary ===');
  const totalLaws = await db.legalNode.count({ where: { type: 'LAW' } });
  const totalArticles = await db.legalNode.count({ where: { type: 'ARTICLE' } });
  const totalSections = await db.legalNode.count({ where: { type: 'SECTION' } });
  const emptyTitleCheck = await db.legalNode.count({ where: { title: '' } });
  const noArticleLawsFinal = [];
  const allLaws = await db.legalNode.findMany({ where: { type: 'LAW' } });
  for (const law of allLaws) {
    const ac = await db.legalNode.count({ where: { lawId: law.id, type: 'ARTICLE' } });
    if (ac === 0) noArticleLawsFinal.push(law.title);
  }

  console.log(`Laws: ${totalLaws}`);
  console.log(`Sections: ${totalSections}`);
  console.log(`Articles: ${totalArticles}`);
  console.log(`Empty titles remaining: ${emptyTitleCheck}`);
  console.log(`Laws still without articles: ${noArticleLawsFinal.length}`);
  noArticleLawsFinal.forEach(t => console.log(`  - ${t}`));

  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
