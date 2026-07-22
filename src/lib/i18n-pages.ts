const BASE = "https://www.dadparvaran.com";

/**
 * Route patterns that have COMPLETE English content.
 * Every other public route under /en/ is considered incomplete and must be
 * noindex-ed, excluded from sitemap hreflang, and hidden from the language
 * switcher.
 *
 * Patterns use a simple convention:
 *   - exact path  →  "/services"
 *   - dynamic seg  →  "/services/*"   (one segment)
 *   - catch-all   →  "/laws/**"       (any depth — NOT used today)
 */
const COMPLETE_EN_PATTERNS: string[] = [
  "",
  "/services",
  "/services/*",
  "/lawyers",
  "/lawyers/*",
  "/team",
  "/calculators",
  "/calculators/*",
  "/contact",
  "/about",
  "/privacy",
  "/terms",
];

export function hasCompleteEnglish(pathWithoutLocale: string): boolean {
  // مسیر ریشه ("" یا "/") باید با الگوی "" تطبیق یابد؛ خانهٔ انگلیسی کامل است.
  const p =
    pathWithoutLocale === "" || pathWithoutLocale === "/"
      ? ""
      : pathWithoutLocale.startsWith("/")
        ? pathWithoutLocale
        : `/${pathWithoutLocale}`;

  return COMPLETE_EN_PATTERNS.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -2);
      const rest = p.slice(prefix.length + 1);
      return p.startsWith(prefix + "/") && rest.length > 0 && !rest.includes("/");
    }
    return p === pattern;
  });
}

export function canonicalUrl(locale: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}/${locale}${p}`;
}

export function hreflangLinks(
  locale: string,
  pathWithoutLocale: string,
): Record<string, string> | undefined {
  if (!hasCompleteEnglish(pathWithoutLocale)) {
    return undefined;
  }
  const p = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  return {
    fa: `${BASE}/fa${p}`,
    en: `${BASE}/en${p}`,
    "x-default": `${BASE}/fa${p}`,
  };
}

export function alternatesMetadata(
  locale: string,
  pathWithoutLocale: string,
): { canonical: string; languages?: Record<string, string> } {
  const p = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  const canonical = `${BASE}/${locale}${p}`;
  const languages = hreflangLinks(locale, pathWithoutLocale);
  return languages ? { canonical, languages } : { canonical };
}

export function shouldNoindexEnglish(
  locale: string,
  pathWithoutLocale: string,
): boolean {
  return locale === "en" && !hasCompleteEnglish(pathWithoutLocale);
}
