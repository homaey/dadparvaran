import { describe, expect, it } from "vitest";
import { toRenderBlocks, textToRenderBlocks } from "./render-blocks";

const RENDERABLE = new Set(["heading", "paragraph", "callout", "faq", "steps", "figure", "legal_ref"]);

describe("semantic blocks to render blocks", () => {
  it("gives every emitted block a type the public page can render", () => {
    const out = toRenderBlocks([
      { key: "quick_answer", label: "پاسخ فوری", position: 0, content: "پاسخ کوتاه." },
      { key: "summary", label: "خلاصه", position: 1, content: "خلاصه مقاله." },
      { key: "lawyer_note", label: "نظر وکیل", position: 2, content: "تجربه عملی." },
    ]);
    expect(out.length).toBeGreaterThan(0);
    out.forEach((block) => expect(RENDERABLE.has(block.type)).toBe(true));
  });

  it("turns the quick answer and lawyer note into callouts", () => {
    const out = toRenderBlocks([
      { key: "quick_answer", label: "پاسخ فوری", position: 0, content: "پاسخ." },
      { key: "lawyer_note", label: "نظر وکیل", position: 1, content: "نظر." },
    ]);
    expect(out).toEqual([
      { type: "callout", variant: "info", title: "پاسخ فوری", content: "پاسخ." },
      { type: "callout", variant: "tip", title: "نظر وکیل", content: "نظر." },
    ]);
  });

  it("treats the legacy direct_answer key as a quick answer", () => {
    const [block] = toRenderBlocks([{ key: "direct_answer", label: "پاسخ کوتاه", position: 0, content: "پاسخ." }]);
    expect(block).toMatchObject({ type: "callout", variant: "info" });
  });

  it("emits a heading then one paragraph per blank-line-separated part", () => {
    const out = toRenderBlocks([{ key: "explanation", label: "توضیح", position: 0, content: "بند اول.\n\nبند دوم." }]);
    expect(out).toEqual([
      { type: "heading", content: "توضیح" },
      { type: "paragraph", content: "بند اول." },
      { type: "paragraph", content: "بند دوم." },
    ]);
  });

  it("drops empty blocks so no stray heading is published", () => {
    expect(toRenderBlocks([{ key: "legal_sources", label: "مستندات قانونی", position: 0, content: "   " }])).toEqual([]);
  });

  it("exports every FAQ question with its matching answer", () => {
    const out = toRenderBlocks([
      {
        key: "faq",
        label: "سؤالات متداول",
        position: 0,
        content: '{"items":[{"q":"هزینه چگونه تعیین می‌شود؟","a":"پس از بررسی اسناد."}]}',
      },
    ]);
    expect(out).toEqual([
      { type: "faq", items: [{ q: "هزینه چگونه تعیین می‌شود؟", a: "پس از بررسی اسناد." }] },
    ]);
  });

  it("orders by position, not array order", () => {
    const out = toRenderBlocks([
      { key: "cta", label: "دعوت", position: 2, content: "دوم." },
      { key: "summary", label: "خلاصه", position: 1, content: "اول." },
    ]);
    expect(out.map((b) => "content" in b ? b.content : "")).toEqual(["خلاصه", "اول.", "دعوت", "دوم."]);
  });

  it("converts free text into paragraphs", () => {
    expect(textToRenderBlocks("یک.\n\nدو.")).toEqual([
      { type: "paragraph", content: "یک." },
      { type: "paragraph", content: "دو." },
    ]);
  });
});
