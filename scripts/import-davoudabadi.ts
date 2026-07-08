/**
 * Import laws from davoudabadi.ir offline mirror into LegalNode database.
 *
 * Usage:
 *   npx tsx scripts/import-davoudabadi.ts [--source PATH] [--law UID] [--all]
 *
 * Examples:
 *   npx tsx scripts/import-davoudabadi.ts --all
 *   npx tsx scripts/import-davoudabadi.ts --law 6925314   # only قانون مدنی
 */

import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const db = new PrismaClient();

const DEFAULT_SOURCE = "C:\\My Web Sites\\https___davoudabadi.ir_laws\\davoudabadi.ir";

interface LawEntry {
  uid: string;
  title: string;
  category: string;
  href: string;
}

interface ParsedLaw {
  uid: string;
  title: string;
  adoptionDate: string | null;
  adoptionAuthority: string | null;
  category: string;
  nodes: ParsedNode[];
}

interface ParsedNode {
  uid: string;
  type: "SECTION" | "ARTICLE";
  title: string;
  articleNumber: string | null;
  content: string | null;
  children: ParsedNode[];
}

// ── Step 1: Parse laws.html to get list of all laws ──────────────────────────

function parseLawsIndex(sourcePath: string): LawEntry[] {
  const html = fs.readFileSync(path.join(sourcePath, "laws.html"), "utf-8");
  const $ = cheerio.load(html);
  const entries: LawEntry[] = [];
  let currentCategory = "";

  $("h2").each((_, h2) => {
    const catText = $(h2).text().trim().replace(/\s+/g, " ");
    if (catText) currentCategory = catText;
  });

  // Re-parse with category tracking via DOM order
  const categories: string[] = [];
  $('[id^="category-"]').each((_, catDiv) => {
    const catName = $(catDiv).find("h2").text().trim().replace(/\s+/g, " ");
    $(catDiv).find("h3 a").each((_, link) => {
      const href = $(link).attr("href") || "";
      const title = $(link).text().trim();
      const uidMatch = href.match(/page\/(\d+)\//);
      if (uidMatch && title) {
        entries.push({
          uid: uidMatch[1],
          title,
          category: catName,
          href,
        });
      }
    });
  });

  return entries;
}

// ── Step 2: Parse a single law page ──────────────────────────────────────────

function parseLawPage(sourcePath: string, uid: string, category: string): ParsedLaw | null {
  const pageDir = path.join(sourcePath, "page", uid);
  if (!fs.existsSync(pageDir)) {
    console.warn(`  ⚠ Page directory not found: ${pageDir}`);
    return null;
  }

  const htmlFiles = fs.readdirSync(pageDir).filter((f) => f.endsWith(".html"));
  if (htmlFiles.length === 0) {
    console.warn(`  ⚠ No HTML file in: ${pageDir}`);
    return null;
  }

  const htmlFile = htmlFiles[0];
  const html = fs.readFileSync(path.join(pageDir, htmlFile), "utf-8");
  const $ = cheerio.load(html);

  // Extract title
  const title = $("h1.post-title").text().trim() || $("title").text().split("|")[0].trim();

  // Extract adoption info from the div after h1
  let adoptionDate: string | null = null;
  let adoptionAuthority: string | null = null;
  const infoText = $("h1.post-title").parent().find("div.text-gray-600, div.mt-1").first().text().trim();
  if (infoText) {
    const match = infoText.match(/مصوب\s+([\d/]+)\s*(.*)/);
    if (match) {
      adoptionDate = match[1];
      adoptionAuthority = match[2]?.trim() || null;
    }
  }

  // Parse the tree of sections and articles
  const nodes: ParsedNode[] = [];
  let currentSection: ParsedNode | null = null;

  $("main [wire\\:key]").each((idx, el) => {
    const $el = $(el);
    const wireKey = $el.attr("wire:key") || `node-${idx}`;
    const tagName = el.tagName?.toLowerCase();

    if (tagName === "div" && $el.find("a span").length > 0) {
      // This is a section (فصل، باب، کتاب، جلد، مقدمه)
      const sectionTitle = $el.find("a").text().trim().replace(/^❯\s*/, "").replace(/^❯\s*/, "");
      if (sectionTitle) {
        currentSection = {
          uid: wireKey,
          type: "SECTION",
          title: sectionTitle,
          articleNumber: null,
          content: null,
          children: [],
        };
        nodes.push(currentSection);
      }
    } else if (tagName === "article") {
      // This is an article (ماده)
      const articleLink = $el.find("a").first();
      const articleTitle = articleLink.text().trim();
      const articleText = $el.find(".post-text").text().trim();

      const numMatch = articleTitle.match(/ماده\s+(\S+)/);
      const articleNumber = numMatch ? numMatch[1] : null;

      const articleNode: ParsedNode = {
        uid: wireKey,
        type: "ARTICLE",
        title: articleTitle,
        articleNumber,
        content: articleText || null,
        children: [],
      };

      if (currentSection) {
        currentSection.children.push(articleNode);
      } else {
        nodes.push(articleNode);
      }
    }
  });

  if (!title) return null;

  return {
    uid,
    title,
    adoptionDate,
    adoptionAuthority,
    category,
    nodes,
  };
}

// ── Step 3: For articles without content, read their individual pages ────────

async function enrichArticleContent(sourcePath: string, node: ParsedNode): Promise<void> {
  if (node.type === "ARTICLE" && !node.content) {
    const pageDir = path.join(sourcePath, "page", node.uid);
    if (fs.existsSync(pageDir)) {
      const htmlFiles = fs.readdirSync(pageDir).filter((f) => f.endsWith(".html") && f !== "list.html");
      if (htmlFiles.length > 0) {
        try {
          const html = fs.readFileSync(path.join(pageDir, htmlFiles[0]), "utf-8");
          const $ = cheerio.load(html);
          const text = $("article.post-text").text().trim();
          if (text) node.content = text;
        } catch {
          // skip
        }
      }
    }
  }
  for (const child of node.children) {
    await enrichArticleContent(sourcePath, child);
  }
}

// ── Step 4: Insert into database ─────────────────────────────────────────────

function makeSlug(title: string): string {
  return title
    .replace(/\s+/g, "-")
    .replace(/[^؀-ۿݐ-ݿa-zA-Z0-9\-]/g, "")
    .substring(0, 200);
}

async function insertLaw(parsed: ParsedLaw): Promise<void> {
  const lawSlug = makeSlug(parsed.title);

  // Check if law already exists
  const existing = await db.legalNode.findFirst({
    where: { type: "LAW", slug: lawSlug },
  });
  if (existing) {
    const childCount = await db.legalNode.count({ where: { lawId: existing.id, type: "ARTICLE" } });
    if (childCount >= parsed.nodes.reduce((s, n) => s + (n.type === "ARTICLE" ? 1 : 0) + n.children.length, 0)) {
      console.log(`  ⏭ Law already exists with ${childCount} articles: ${parsed.title}`);
      return;
    }
    // Replace sparse seed data with full import
    console.log(`  ♻ Replacing existing law (${childCount} articles) with full import...`);
    await db.legalNode.deleteMany({ where: { lawId: existing.id, id: { not: existing.id } } });
    await db.legalNode.delete({ where: { id: existing.id } });
  }

  // Create law node
  const law = await db.legalNode.create({
    data: {
      type: "LAW",
      title: parsed.title,
      slug: lawSlug,
      lawKey: `davoudabadi-${parsed.uid}`,
      adoptionDate: parsed.adoptionDate,
      adoptionAuthority: parsed.adoptionAuthority,
      sourceUrl: `https://davoudabadi.ir/page/${parsed.uid}`,
      orderIndex: 0,
    },
  });
  await db.legalNode.update({
    where: { id: law.id },
    data: { lawId: law.id },
  });

  let globalArticleOrder = 0;

  async function insertNodes(nodes: ParsedNode[], parentId: number, depth: number) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const slug = node.type === "ARTICLE" && node.articleNumber
        ? `ماده-${node.articleNumber}`
        : makeSlug(node.title);

      // Check for duplicate slug under same parent
      const existingChild = await db.legalNode.findFirst({
        where: { parentId, slug },
      });
      if (existingChild) continue;

      const created = await db.legalNode.create({
        data: {
          parentId,
          lawId: law.id,
          type: node.type,
          title: node.title,
          slug,
          articleNumber: node.articleNumber,
          content: node.content,
          orderIndex: node.type === "ARTICLE" ? globalArticleOrder++ : i,
          sourceUrl: `https://davoudabadi.ir/page/${node.uid}`,
        },
      });

      if (node.children.length > 0) {
        await insertNodes(node.children, created.id, depth + 1);
      }
    }
  }

  await insertNodes(parsed.nodes, law.id, 0);

  const articleCount = parsed.nodes.reduce(
    (sum, n) => sum + (n.type === "ARTICLE" ? 1 : 0) + n.children.length,
    0
  );
  console.log(`  ✓ Imported: ${parsed.title} (${articleCount} items)`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const sourcePath = args.includes("--source")
    ? args[args.indexOf("--source") + 1]
    : DEFAULT_SOURCE;

  const specificLaw = args.includes("--law")
    ? args[args.indexOf("--law") + 1]
    : null;

  const importAll = args.includes("--all");

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source path not found: ${sourcePath}`);
    process.exit(1);
  }

  console.log(`Source: ${sourcePath}`);
  console.log("Parsing laws index...");

  const lawEntries = parseLawsIndex(sourcePath);
  console.log(`Found ${lawEntries.length} laws in index`);

  const toImport = specificLaw
    ? lawEntries.filter((e) => e.uid === specificLaw)
    : importAll
      ? lawEntries
      : lawEntries.slice(0, 5); // default: first 5

  if (toImport.length === 0 && specificLaw) {
    console.error(`Law with UID ${specificLaw} not found in index`);
    process.exit(1);
  }

  console.log(`Importing ${toImport.length} law(s)...\n`);

  let imported = 0;
  let failed = 0;

  for (const entry of toImport) {
    console.log(`[${imported + failed + 1}/${toImport.length}] ${entry.title} (${entry.uid})`);

    try {
      const parsed = parseLawPage(sourcePath, entry.uid, entry.category);
      if (!parsed) {
        failed++;
        continue;
      }

      // Enrich articles that had no inline content
      for (const node of parsed.nodes) {
        await enrichArticleContent(sourcePath, node);
        for (const child of node.children) {
          await enrichArticleContent(sourcePath, child);
        }
      }

      await insertLaw(parsed);
      imported++;
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Imported: ${imported}, Failed: ${failed}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
