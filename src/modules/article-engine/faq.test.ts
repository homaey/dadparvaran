import { describe, expect, it } from "vitest";
import { faqContentToText, isCompleteFaqContent, normalizeFaqContent, parseFaqContent } from "./faq";

describe("structured FAQ content", () => {
  it("round-trips canonical question and answer pairs", () => {
    const content = normalizeFaqContent("سؤال: هزینه چگونه تعیین می‌شود؟\nپاسخ: پس از بررسی اسناد و حدود خدمات.");
    expect(parseFaqContent(content)).toEqual([
      { q: "هزینه چگونه تعیین می‌شود؟", a: "پس از بررسی اسناد و حدود خدمات." },
    ]);
    expect(isCompleteFaqContent(content)).toBe(true);
  });

  it("rejects a question without its matching answer", () => {
    expect(() => normalizeFaqContent("سؤال: زمان پاسخ چقدر است؟")).toThrow(/پاسخ متناظر/);
  });

  it("keeps office placeholders incomplete until the assignee replaces them", () => {
    const content = normalizeFaqContent("سؤال: زمان پاسخ چقدر است؟\nپاسخ: [نیازمند تکمیل توسط دفتر]");
    expect(isCompleteFaqContent(content)).toBe(false);
  });

  it("converts canonical storage into reviewer-friendly text", () => {
    expect(faqContentToText('{"items":[{"q":"پرسش؟","a":"پاسخ."}]}')).toBe("سؤال: پرسش؟\nپاسخ: پاسخ.");
  });
});
