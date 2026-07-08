import type { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";
import { servicesData } from "@/lib/services-data";

const BASE_URL = "https://www.dadparvaran.com";
const locales = ["fa", "en"];

const db = new PrismaClient();

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
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
        ),
      },
    }))
  );

  // Service specialty pages
  const serviceEntries = locales.flatMap((locale) =>
    servicesData.map((s) => ({
      url: `${BASE_URL}/${locale}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/services/${s.slug}`])
        ),
      },
    }))
  );

  // Dynamic: articles
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
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/articles/${a.slug}`])
          ),
        },
      }))
    );
  } catch {}

  // Dynamic: calculators
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
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/calculators/${c.slug}`])
          ),
        },
      }))
    );
  } catch {}

  // Dynamic: laws
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
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${BASE_URL}/${loc}/laws/${l.slug}`])
          ),
        },
      }))
    );
  } catch {}

  // Dynamic: team members
  let teamEntries: MetadataRoute.Sitemap = [];
  try {
    const members = await db.teamMember.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    teamEntries = locales.flatMap((locale) =>
      members.map((m) => ({
        url: `${BASE_URL}/${locale}/lawyers/${m.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/lawyers/${m.slug}`])
          ),
        },
      }))
    );
  } catch {}

  return [
    ...staticEntries,
    ...serviceEntries,
    ...articleEntries,
    ...calcEntries,
    ...lawEntries,
    ...teamEntries,
  ];
}
