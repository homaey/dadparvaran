export type FaqItem = { q: string; a: string };

export const FAQ_BLOCK_KEYS = new Set(["faq", "related_questions"]);

function cleanItem(value: unknown): FaqItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as { q?: unknown; a?: unknown; question?: unknown; answer?: unknown };
  const q = String(item.q ?? item.question ?? "").trim();
  const a = String(item.a ?? item.answer ?? "").trim();
  return q || a ? { q, a } : null;
}

function parseJson(content: string): FaqItem[] | null {
  try {
    const value = JSON.parse(content) as unknown;
    const items = Array.isArray(value)
      ? value
      : value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)
        ? (value as { items: unknown[] }).items
        : null;
    if (!items) return null;
    return items.map(cleanItem).filter((item): item is FaqItem => Boolean(item));
  } catch {
    return null;
  }
}

/**
 * Accepts the canonical JSON format plus legacy AI text such as:
 * سؤال: ...\nپاسخ: ... or numbered questions followed by پاسخ.
 */
export function parseFaqContent(content: string): FaqItem[] {
  const trimmed = content.trim();
  if (!trimmed) return [];
  const jsonItems = parseJson(trimmed);
  if (jsonItems) return jsonItems;

  const normalized = trimmed
    .replace(/\r/g, "")
    .replace(/(?:^|\n)\s*[۰-۹0-9]+[.)\-–—:]\s*/g, "\nسؤال: ")
    .trim();
  const explicitPairs = [...normalized.matchAll(/(?:^|\n)\s*(?:س[ؤو]ال|پرسش)\s*[:：]\s*([\s\S]*?)\s*(?:\n|\s)+(?:پاسخ|جواب)\s*[:：]\s*([\s\S]*?)(?=(?:\n\s*(?:س[ؤو]ال|پرسش)\s*[:：])|$)/g)];
  if (explicitPairs.length) {
    return explicitPairs
      .map((match) => ({ q: match[1].trim(), a: match[2].trim() }))
      .filter((item) => item.q || item.a);
  }

  const inlinePairs = [...normalized.matchAll(/([^؟?\n]{5,}[؟?])\s*(?:پاسخ|جواب)\s*[:：]?\s*([\s\S]*?)(?=(?:[^؟?\n]{5,}[؟?]\s*(?:پاسخ|جواب))|$)/g)];
  return inlinePairs
    .map((match) => ({ q: match[1].trim(), a: match[2].trim() }))
    .filter((item) => item.q || item.a);
}

export function serializeFaqItems(items: FaqItem[]) {
  const cleaned = items
    .map((item) => ({ q: item.q.trim(), a: item.a.trim() }))
    .filter((item) => item.q || item.a)
    .slice(0, 12);
  return JSON.stringify({ items: cleaned });
}

export function faqContentToText(content: string) {
  const items = parseFaqContent(content);
  if (!items.length) return content.trim();
  return items.map((item) => `سؤال: ${item.q}\nپاسخ: ${item.a}`).join("\n\n");
}

export function isCompleteFaqContent(content: string) {
  const items = parseFaqContent(content);
  return items.length >= 1 && items.every(
    (item) => item.q.length >= 3 && item.a.length >= 3 && !hasEditorialPlaceholder(item.q) && !hasEditorialPlaceholder(item.a),
  );
}

export function hasEditorialPlaceholder(content: string) {
  return /\[\s*نیازمند\s+(?:تکمیل|بررسی)/.test(content);
}

export function normalizeFaqContent(content: string) {
  const items = parseFaqContent(content);
  if (!items.length || items.some((item) => !item.q.trim() || !item.a.trim()))
    throw new Error("هر سؤال متداول باید یک پاسخ متناظر داشته باشد");
  return serializeFaqItems(items);
}
