import { db } from "@/lib/db";

export type LegalSourceContext = {
  title: string;
  articleNumber: string | null;
  lawKey: string | null;
  content: string;
  sourceUrl: string | null;
};

const GENERIC_TERMS = new Set([
  "چرا", "چیست", "است", "برای", "درباره", "راهنمای", "پرونده", "حقوقی", "قانونی", "وکیل",
  "متخصص", "سپردن", "تفاوت", "ایجاد", "بررسی", "نحوه", "روش", "مراحل", "موضوع", "مهم",
]);

const CATEGORY_TERMS: Record<string, string[]> = {
  FAMILY_LAW: ["خانواده", "ازدواج", "طلاق", "مهریه", "نفقه", "حضانت"],
  PROPERTY_LAW: ["املاک", "ملکی", "غیرمنقول", "اسناد", "ساختمان", "اجاره", "زمین", "مسکن", "آپارتمان", "اراضی", "افراز", "ثبتی"],
  CRIMINAL_LAW: ["جرم", "کیفری", "مجازات", "شکایت", "دادسرا"],
  CONTRACT_LAW: ["قرارداد", "تعهد", "فسخ", "بیع", "اجاره"],
  FINANCIAL_CLAIMS: ["مطالبه", "وجه", "محکومیت", "مالی", "چک", "سفته", "اعسار"],
  COMMERCIAL_LAW: ["تجارت", "تجاری", "شرکت", "ورشکستگی", "سهام"],
  INHERITANCE_LAW: ["ارث", "وراثت", "ترکه", "وصیت", "ماترک"],
  LABOR_LAW: ["کار", "کارگر", "کارفرما", "بیمه", "سنوات"],
  PROCEDURE_LAW: ["دادرسی", "دادخواست", "تجدیدنظر", "ابلاغ", "اجرا", "صلاحیت"],
  ADMINISTRATIVE_LAW: ["اداری", "دیوان", "شهرداری", "دولت", "استخدامی"],
};

function normalize(value: string) {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim().toLocaleLowerCase("fa");
}

function searchTerms(...values: string[]) {
  return [...new Set(
    normalize(values.join(" "))
      .match(/[\p{L}\p{N}]+/gu)
      ?.map((term) => term.trim())
      .filter((term) => term.length >= 3 && !GENERIC_TERMS.has(term)) ?? [],
  )].slice(0, 10);
}

function includes(text: string, term: string) {
  return text.includes(normalize(term));
}

export async function loadRelevantLegalSources(title: string, keyword: string, legalCategory = ""): Promise<LegalSourceContext[]> {
  const queryTerms = searchTerms(title, keyword);
  const categoryTerms = CATEGORY_TERMS[legalCategory] ?? [];
  const signals = [...new Set([...queryTerms, ...categoryTerms])].slice(0, 18);
  if (!signals.length) return [];

  const laws = await db.legalNode.findMany({
    where: {
      type: "LAW",
      OR: signals.map((term) => ({ title: { contains: term } })),
    },
    select: { id: true, title: true, lawKey: true, sourceUrl: true },
    take: 50,
  });
  if (!laws.length) return [];
  const lawsById = new Map(laws.map((law) => [law.id, law]));

  const candidates = await db.legalNode.findMany({
    where: {
      content: { not: null },
      type: "ARTICLE",
      lawId: { in: laws.map((law) => law.id) },
      OR: signals.flatMap((term) => [{ title: { contains: term } }, { content: { contains: term } }]),
    },
    select: {
      id: true,
      title: true,
      articleNumber: true,
      lawId: true,
      content: true,
      sourceUrl: true,
    },
    take: 160,
  });
  const exactKeyword = normalize(keyword);

  return candidates
    .map((node) => {
      const law = node.lawId ? lawsById.get(node.lawId) : null;
      if (!law || !node.content?.trim()) return null;
      const heading = normalize(`${law.title} ${node.title}`);
      const content = normalize(node.content);
      let score = 0;
      let queryScore = 0;
      for (const term of queryTerms) queryScore += includes(heading, term) ? 8 : includes(content, term) ? 1 : 0;
      score += queryScore;
      for (const term of categoryTerms) score += includes(heading, term) ? 5 : includes(content, term) ? 0.5 : 0;
      if (exactKeyword.length >= 3) score += includes(heading, exactKeyword) ? 12 : includes(content, exactKeyword) ? 3 : 0;
      // یک تطابق عمومی با حوزه (مثلاً صرفاً «ثبت») برای استناد کافی نیست.
      // منبع باید یا در عنوان قانون، یا با چند نشانه هم‌زمان در متن ماده به مسئله واقعی مقاله بخورد.
      if (queryScore < 2 || score < 8) return null;
      return {
        score,
        id: node.id,
        source: {
          title: law.title,
          articleNumber: node.articleNumber,
          lawKey: law.lawKey,
          content: node.content.slice(0, 1600),
          sourceUrl: node.sourceUrl ?? law.sourceUrl,
        } satisfies LegalSourceContext,
      };
    })
    .filter((item): item is { score: number; id: number; source: LegalSourceContext } => Boolean(item))
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, 8)
    .map((item) => item.source);
}

export function formatLegalSources(sources: LegalSourceContext[]) {
  if (!sources.length)
    return "منبع مرتبط و قابل‌اتکایی در بانک قوانین سایت پیدا نشد؛ هیچ نام قانون یا شماره ماده‌ای نساز و ادعای دقیق را با [نیازمند بررسی حقوقی] مشخص کن.";
  return sources
    .map(
      (source, index) =>
        `${index + 1}. عنوان رسمی قانون: ${source.title}\nماده: ${source.articleNumber ?? "نامشخص"}\nمتن ماده: ${source.content}${source.sourceUrl ? `\nپیوند منبع: ${source.sourceUrl}` : ""}`,
    )
    .join("\n\n");
}
