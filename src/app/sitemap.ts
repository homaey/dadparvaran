import type { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";
import { servicesData } from "@/lib/services-data";

const BASE_URL = "https://www.dadparvaran.com";
const locales = ["fa", "en"];

const db = new PrismaClient();

// The law-article set is large (~9k nodes → ~18k URLs). Cache the rendered
// sitemap for a day; with stale-while-revalidate, crawlers always get the
// cached copy instantly while it regenerates in the background.
// Per-URL hreflang alternates are intentionally omitted — every page already
// emits on-page <link rel="alternate" hreflang> via its metadata, so repeating
// them here would roughly double both the file size and the generation time
// (which caused Googlebot fetch timeouts on the 1-vCPU host).
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/services", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/lawyers", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/articles", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/laws", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/calculators", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  const serviceEntries = locales.flatMap((locale) =>
    servicesData.map((s) => ({
      url: `${BASE_URL}/${locale}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }))
  );

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    articleEntries = locales.flatMap((locale) =>
      articles.map((a) => ({
        url: `${BASE_URL}/${locale}/articles/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  } catch {}

  let calcEntries: MetadataRoute.Sitemap = [];
  try {
    const calcs = await db.calculator.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    calcEntries = locales.flatMap((locale) =>
      calcs.map((c) => ({
        url: `${BASE_URL}/${locale}/calculators/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }))
    );
  } catch {}

  let lawEntries: MetadataRoute.Sitemap = [];
  try {
    const laws = await db.legalNode.findMany({
      where: { type: "LAW" },
      select: { slug: true, updatedAt: true },
    });
    lawEntries = locales.flatMap((locale) =>
      laws.map((l) => ({
        url: `${BASE_URL}/${locale}/laws/${l.slug}`,
        lastModified: l.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    );
  } catch {}

  // Individual law articles (مواد قانون) — the bulk of the sitemap.
  let lawArticleEntries: MetadataRoute.Sitemap = [];
  try {
    const lawNodes = await db.legalNode.findMany({
      where: { type: "LAW" },
      select: { id: true, slug: true },
    });
    const lawSlugById = new Map(lawNodes.map((l) => [l.id, l.slug]));

    const articleNodes = await db.legalNode.findMany({
      where: { type: "ARTICLE", lawId: { not: null } },
      select: { slug: true, lawId: true, updatedAt: true },
    });

    lawArticleEntries = locales.flatMap((locale) =>
      articleNodes.flatMap((a) => {
        const lawSlug = a.lawId != null ? lawSlugById.get(a.lawId) : undefined;
        if (!lawSlug) return [];
        return [
          {
            url: `${BASE_URL}/${locale}/laws/${lawSlug}/${a.slug}`,
            lastModified: a.updatedAt,
            changeFrequency: "yearly" as const,
            priority: 0.6,
          },
        ];
      })
    );
  } catch {}

  let tagEntries: MetadataRoute.Sitemap = [];
  try {
    const tags = await db.tag.findMany({ select: { slug: true } });
    tagEntries = locales.flatMap((locale) =>
      tags.map((t) => ({
        url: `${BASE_URL}/${locale}/tags/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }))
    );
  } catch {}

  let teamEntries: MetadataRoute.Sitemap = [];
  try {
    const members = await db.teamMember.findMany({
      where: { isActive: true, status: "APPROVED" },
      select: { id: true },
    });
    teamEntries = locales.flatMap((locale) =>
      members.map((m) => ({
        url: `${BASE_URL}/${locale}/lawyers/${m.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );
  } catch {}

  return [
    ...staticEntries,
    ...serviceEntries,
    ...articleEntries,
    ...calcEntries,
    ...lawEntries,
    ...lawArticleEntries,
    ...tagEntries,
    ...teamEntries,
  ];
}
