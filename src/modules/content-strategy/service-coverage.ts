import { servicesData } from "@/lib/services-data";

/**
 * صفحات خدماتی که همین الان روی سایت هستند و کلیدواژه تجاری‌شان را گرفته‌اند.
 *
 * بدون این فهرست، تقویم برای «مطالبه مهریه» مقاله پیشنهاد می‌داد در حالی که
 * /services/dowry-claim همان کلیدواژه را هدف گرفته — یعنی سایت با خودش رقابت می‌کرد.
 * تقویم باید شکاف‌ها را پیدا کند، نه چیزی که پوشش دارد.
 */
export type ServiceCoverage = { slug: string; title: string; keywords: string[] };

export function currentServiceCoverage(): ServiceCoverage[] {
  return servicesData.map((service) => ({
    slug: service.slug,
    title: service.titleFA,
    keywords: service.keywordsFA ?? [],
  }));
}

/**
 * فقط عنوان و اسلاگ. عنوان خودش کلیدواژه تجاری را در خود دارد («وکیل خانواده و طلاق»)، پس
 * افزودن فهرست کلیدواژه‌ها فقط پرامپت را سنگین می‌کرد بی‌آنکه چیزی به تشخیص هم‌پوشانی اضافه کند.
 */
export function formatServiceCoverage(coverage: ServiceCoverage[]): string {
  if (!coverage.length) return "هنوز صفحه خدماتی روی سایت نیست.";
  return coverage.map((s) => `${s.title} (/${s.slug})`).join(" · ");
}
