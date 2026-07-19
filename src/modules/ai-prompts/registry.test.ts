import { describe, expect, it } from "vitest";
import { ArticleType } from "@/lib/content-enums";
import { DEFAULT_CATEGORY_PROMPTS } from "@/modules/article-engine/category-prompts";
import { getAllPromptEntries, getDefaultPrompt } from "./registry";

const ALL_PROMPTS = [
  ...getAllPromptEntries().map((e) => ({ name: e.key, text: e.defaultValue })),
  ...Object.values(ArticleType).map((t) => ({ name: `category:${t}`, text: DEFAULT_CATEGORY_PROMPTS[t] })),
];

describe("prompt registry", () => {
  it("gives every entry a non-empty default", () =>
    getAllPromptEntries().forEach((e) => expect(e.defaultValue.trim(), e.key).toBeTruthy()));

  it("returns an empty string for unknown keys rather than throwing", () =>
    expect(getDefaultPrompt("nope")).toBe(""));

  it("ships the source standard that every block generation leans on", () => {
    const standard = getDefaultPrompt("sys_source_standard");
    expect(standard).toContain("روزنامه رسمی");
    expect(standard).toContain("وحدت رویه");
    expect(standard).toContain("نظریه مشورتی");
    expect(standard).toContain("[نیازمند بررسی حقوقی]");
  });
});

describe("no prompt asks the model to do research it cannot do", () => {
  // callAi() هیچ دسترسی وب یا جست‌وجویی ندارد. اگر پرامپتی به مدل بگوید «جست‌وجو کن» یا
  // «سایت رقبا را تحلیل کن»، مدل وانمود می‌کند تحقیق کرده — و در محتوای حقوقی، تحقیقِ
  // ساختگی از نبود تحقیق بدتر است.
  const FORBIDDEN = [
    "نتایج جست‌وجو را بررسی",
    "صفحه رقیب",
    "صفحات رقیب",
    "رقبا را تحلیل",
    "منابع رسمی را بیاب",
    "جست‌وجو کن",
    "سرچ کن",
  ];

  it.each(ALL_PROMPTS)("$name does not instruct live research", ({ text }) =>
    FORBIDDEN.forEach((phrase) => expect(text).not.toContain(phrase)));

  it("tells the model plainly that it has no web access", () =>
    expect(getDefaultPrompt("sys_source_standard")).toContain("دسترسی نداری"));
});

describe("prompt budget", () => {
  // این سه پرامپت روی هر تولید بلوک با هم فرستاده می‌شوند — حتی برای بلوکی ۶۰ کلمه‌ای.
  // یک‌بار به ۴۶۶۶ کاراکتر رسیده بودند چون هر سه قاعده «ماده نساز» را تکرار می‌کردند.
  // سقف اینجاست تا آن تورم بی‌صدا برنگردد.
  const PREAMBLE_KEYS = ["sys_article_base", "sys_article_spine", "sys_source_standard"];

  it("keeps the per-block system preamble under 2500 characters", () => {
    const total = PREAMBLE_KEYS.reduce((sum, k) => sum + getDefaultPrompt(k).length, 0);
    expect(total, `preamble is ${total} chars`).toBeLessThan(2500);
  });

  it("keeps each type prompt under 900 characters", () =>
    Object.values(ArticleType).forEach((t) =>
      expect(DEFAULT_CATEGORY_PROMPTS[t].length, `${t} is ${DEFAULT_CATEGORY_PROMPTS[t].length} chars`).toBeLessThan(900),
    ));

  it("states the no-fabricated-citation rule in exactly one prompt", () => {
    // تکرار همین قاعده در سه پرامپت بود که مقدمه را دو برابر کرد.
    const owners = PREAMBLE_KEYS.filter((k) => getDefaultPrompt(k).includes("[نیازمند بررسی حقوقی]"));
    expect(owners).toEqual(["sys_source_standard"]);
  });
});
