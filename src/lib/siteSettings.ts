import { db } from "./db";

export interface SiteData {
  siteName_fa?: string;
  siteName_en?: string;
  hero_badge_fa?: string;
  hero_title_fa?: string;
  hero_titleHighlight_fa?: string;
  hero_subtitle_fa?: string;
  hero_badge_en?: string;
  hero_title_en?: string;
  hero_titleHighlight_en?: string;
  hero_subtitle_en?: string;
  stats_cases?: string;
  stats_clients?: string;
  stats_experience?: string;
  stats_lawyers?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address_fa?: string;
  contact_address_en?: string;
}

let cache: { data: SiteData; ts: number } | null = null;
const TTL = 60_000; // 1 minute cache

export async function getSiteSettings(): Promise<SiteData> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;

  try {
    const row = await db.siteSettings.findUnique({ where: { id: "singleton" } });
    const data: SiteData = row ? JSON.parse(row.data) : {};
    cache = { data, ts: Date.now() };
    return data;
  } catch {
    return {};
  }
}
