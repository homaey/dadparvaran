import type { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";
import { servicesData } from "@/lib/services-data";
import { hasCompleteEnglish } from "@/lib/i18n-pages";
import { offices } from "@/lib/offices";

const BASE_URL = "https://www.dadparvaran.com";
const ALL_LOCALES = ["fa", "en"] as const;

const db = new PrismaClient();

export const revalidate = 86400;

function localesFor(pathWithoutLocale: string): string[] {
  return hasCompleteEnglish(pathWithoutLocale) ? [...ALL_LOCALES] : ["fa"];
}

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

  const staticEntries = staticPages.flatMap((page) =>
    localesFor(page.path).map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  const serviceEntries = localesFor("/services/x").flatMap((locale) =>
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
    articleEntries = articles.map((a) => ({
      url: `${BASE_URL}/fa/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {}

  let calcEntries: MetadataRoute.Sitemap = [];
  try {
    const calcs = await db.calculator.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    calcEntries = localesFor("/calculators/x").flatMap((locale) =>
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
    lawEntries = laws.map((l) => ({
      url: `${BASE_URL}/fa/laws/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {}

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

    lawArticleEntries = articleNodes.flatMap((a) => {
      const lawSlug = a.lawId != null ? lawSlugById.get(a.lawId) : undefined;
      if (!lawSlug) return [];
      return [
        {
          url: `${BASE_URL}/fa/laws/${lawSlug}/${a.slug}`,
          lastModified: a.updatedAt,
          changeFrequency: "yearly" as const,
          priority: 0.6,
        },
      ];
    });
  } catch {}

  let tagEntries: MetadataRoute.Sitemap = [];
  try {
    const tags = await db.tag.findMany({ select: { slug: true } });
    tagEntries = tags.map((t) => ({
      url: `${BASE_URL}/fa/tags/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {}

  let teamEntries: MetadataRoute.Sitemap = [];
  try {
    const members = await db.teamMember.findMany({
      where: { isActive: true, status: "APPROVED" },
      select: { id: true },
    });
    teamEntries = localesFor("/lawyers/1").flatMap((locale) =>
      members.map((m) => ({
        url: `${BASE_URL}/${locale}/lawyers/${m.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );
  } catch {}

  // صفحات شهری فقط FA — اولویت بالا چون هدف زودبازده‌ترین کلمات کلیدی است
  // («وکیل در اهواز» و «وکیل در اندیمشک» رقابت به‌مراتب پایین‌تر از تهران).
  const officeEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/fa/offices`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...offices.map((o) => ({
      url: `${BASE_URL}/fa/offices/${o.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];

  // صفحات اعتماد (fees + faq) — فقط FA. fees اولویت بالاتر چون پرکاربردترین
  // حوزه‌ی جست‌وجوی تازه‌کاران به سایت است.
  const trustEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/fa/fees`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/fa/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];

  return [
    ...staticEntries,
    ...serviceEntries,
    ...officeEntries,
    ...trustEntries,
    ...articleEntries,
    ...calcEntries,
    ...lawEntries,
    ...lawArticleEntries,
    ...tagEntries,
    ...teamEntries,
  ];
}
