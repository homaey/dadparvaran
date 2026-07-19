const QUICK_ANSWER_KEYS = new Set(["quick_answer", "direct_answer"]);
const FAQ_BLOCK_KEYS = new Set(["faq", "related_questions"]);

type FaqItem = { q: string; a: string };

function parseFaqContent(content: string): FaqItem[] {
  const trimmed = content.trim();
  if (!trimmed) return [];
  try {
    const value = JSON.parse(trimmed);
    const items = Array.isArray(value) ? value : value?.items;
    if (Array.isArray(items)) return items.filter((i: any) => i?.q && i?.a);
  } catch {}
  const parts = trimmed.split(/(?:^|\n)(?:سؤال|پرسش|Q)\s*[۰-۹0-9]*[:.)\-–—]?\s*/i).filter(Boolean);
  const result: FaqItem[] = [];
  for (const part of parts) {
    const [q, ...rest] = part.split(/\n(?:پاسخ|جواب|A)\s*[:.)\-–—]?\s*/i);
    if (q && rest.length) result.push({ q: q.trim(), a: rest.join("\n").trim() });
  }
  return result;
}

/**
 * قالب نمایشی صفحه عمومی مقاله. صفحه روی block.type سوییچ می‌کند و هر نوع ناشناخته را
 * دور می‌اندازد، پس خروجی این ماژول باید دقیقاً همین چند نوع باشد.
 * منبع: src/app/[locale]/(public)/articles/[slug]/page.tsx
 */
export type RenderBlock =
  | { type: "heading"; content: string }
  | { type: "paragraph"; content: string }
  | { type: "callout"; variant: "info" | "tip" | "warning" | "danger"; title?: string; content: string }
  | { type: "faq"; items: Array<{ q: string; a: string }> };

export type SemanticBlock = { key: string; label: string; content: string; position?: number };

/**
 * بلوک‌هایی که به‌جای «تیتر + پاراگراف» به کادر رنگی تبدیل می‌شوند. پاسخ فوری و نظر وکیل
 * دو نقطه‌ای هستند که باید در نگاه اول از بقیه متن جدا دیده شوند.
 */
const CALLOUTS: Record<string, "info" | "tip"> = {
  quick_answer: "info",
  direct_answer: "info",
  lawyer_note: "tip",
};

function paragraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * بلوک‌های معنایی نویسنده ({key,label,position,content}) را به بلوک‌های نمایشی صفحه عمومی
 * ({type,content}) تبدیل می‌کند.
 *
 * این دو واژگان از ابتدا جدا بودند و مبدلی نداشتند؛ نتیجه‌اش این بود که مقاله منتشرشده از
 * خط تولید روی سایت کاملاً خالی رندر می‌شد، چون رندرکننده هر بلوک بدون type را کنار می‌گذارد.
 */
export function toRenderBlocks(blocks: SemanticBlock[]): RenderBlock[] {
  const ordered = [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const out: RenderBlock[] = [];

  for (const block of ordered) {
    const content = block.content?.trim();
    if (!content) continue;

    if (FAQ_BLOCK_KEYS.has(block.key)) {
      const items = parseFaqContent(content).filter((item) => item.q && item.a);
      if (items.length) out.push({ type: "faq", items });
      continue;
    }

    const callout = CALLOUTS[block.key];
    if (callout) {
      out.push({ type: "callout", variant: callout, title: block.label, content });
      continue;
    }

    // پاسخ فوری تیتر لازم ندارد چون در کادر خودش عنوان دارد؛ بقیه بلوک‌ها با تیتر می‌آیند
    // تا ساختار مقاله برای خواننده و برای موتور جست‌وجو پیدا باشد.
    out.push({ type: "heading", content: block.label });
    for (const paragraph of paragraphs(content)) out.push({ type: "paragraph", content: paragraph });
  }

  return out;
}

/** برای متن‌های آزادی که بلوک‌بندی معنایی ندارند (مثلاً پیش‌نویس دستی). */
export function textToRenderBlocks(text: string): RenderBlock[] {
  return paragraphs(text).map((content) => ({ type: "paragraph", content }));
}

export function isQuickAnswerKey(key: string) {
  return QUICK_ANSWER_KEYS.has(key);
}
