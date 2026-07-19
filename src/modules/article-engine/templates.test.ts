import { describe, expect, it } from "vitest";
import { ArticleType, resolveArticleType } from "@/lib/content-enums";
import { articleTypeRole } from "@/modules/content-strategy/constants";
import { DEFAULT_CATEGORY_PROMPTS } from "./category-prompts";
import {
  QUICK_ANSWER_KEYS,
  articleTypeToTemplate,
  getTemplate,
  isHumanOnlyBlock,
  templateForArticleType,
  templates,
} from "./templates";

describe("article template engine", () => {
  it("defines one template per current content type", () =>
    expect(Object.keys(templates)).toHaveLength(Object.values(ArticleType).length));
  it("maps every article type to a template", () =>
    expect(Object.values(ArticleType).every((type) => articleTypeToTemplate[type] in templates)).toBe(true));
  it("keeps block keys unique per template", () =>
    Object.values(templates).forEach((blocks) => expect(new Set(blocks.map((b) => b.key)).size).toBe(blocks.length)));
  it("rejects unknown templates", () => expect(() => getTemplate("foreign_law")).toThrow());

  it("defines the step-by-step guide blocks in order", () =>
    expect(getTemplate("step_by_step").map((b) => b.key)).toEqual([
      "quick_answer",
      "who_and_scope",
      "process_overview",
      "step_zero",
      "prerequisites",
      "steps",
      "decision_points",
      "required_documents",
      "deadlines",
      "timeline_cost",
      "common_mistakes",
      "after_process",
      "when_lawyer_needed",
      "faq",
      "legal_sources",
      "lawyer_note",
      "cta",
    ]));
});

describe("article spine holds across all content types", () => {
  const entries = Object.entries(templates);

  it("opens every template with a self-contained answer block", () =>
    entries.forEach(([name, blocks]) => expect(QUICK_ANSWER_KEYS.has(blocks[0].key), name).toBe(true)));

  it("gives every template a legal sources block", () =>
    entries.forEach(([name, blocks]) => expect(blocks.some((b) => b.key === "legal_sources"), name).toBe(true)));

  it("gives every template a human-only lawyer note", () =>
    entries.forEach(([name, blocks]) => {
      const note = blocks.find((b) => b.key === "lawyer_note");
      expect(note, name).toBeDefined();
      expect(note?.humanOnly, name).toBe(true);
    }));

  it("places legal sources before the lawyer note", () =>
    entries.forEach(([name, blocks]) =>
      expect(
        blocks.findIndex((b) => b.key === "legal_sources") < blocks.findIndex((b) => b.key === "lawyer_note"),
        name,
      ).toBe(true)));

  it("keeps the trust builder's experience and case story human-written", () => {
    // اگر مدل سابقه و روایت پرونده را بنویسد، کل هدف این تیپ از بین می‌رود.
    expect(isHumanOnlyBlock("trust_builder", "experience")).toBe(true);
    expect(isHumanOnlyBlock("trust_builder", "case_story")).toBe(true);
    expect(isHumanOnlyBlock("trust_builder", "commitment")).toBe(true);
    expect(isHumanOnlyBlock("trust_builder", "what_made_difference")).toBe(true);
    expect(isHumanOnlyBlock("trust_builder", "declined_cases")).toBe(true);
  });

  it("reports human-only blocks by template and key", () => {
    expect(isHumanOnlyBlock("comparison", "lawyer_note")).toBe(true);
    expect(isHumanOnlyBlock("practical_checklist", "checklist")).toBe(false);
    expect(isHumanOnlyBlock("foreign_law", "lawyer_note")).toBe(false);
  });
});

describe("retired taxonomy still resolves", () => {
  it.each([
    ["EDUCATIONAL", "LEGAL_GUIDE"],
    ["LAW_ANALYSIS", "LEGAL_UPDATE"],
    ["LEGAL_NEWS", "LEGAL_UPDATE"],
    ["LEGAL_SAMPLE", "PRACTICAL_CHECKLIST"],
    ["LEGAL_GLOSSARY", "LEGAL_GUIDE"],
  ])("maps retired %s to %s", (from, to) => expect(resolveArticleType(from)).toBe(to));

  it("passes current types through untouched", () =>
    Object.values(ArticleType).forEach((t) => expect(resolveArticleType(t)).toBe(t)));

  it("gives a template to records written before the taxonomy changed", () =>
    expect(templateForArticleType("EDUCATIONAL")).toBe("legal_guide"));

  it("never leaves an unknown type without a template", () =>
    expect(templateForArticleType("SOMETHING_WE_NEVER_HAD")).toBeTruthy());
});

describe("safeguards that must not quietly disappear", () => {
  it("makes ruling analysis state the ruling's binding scope", () => {
    // «رأی یک شعبه» را به‌جای «قاعده جاری» نوشتن، خطرناک‌ترین خطای این تیپ است.
    const keys = getTemplate("case_study").map((b) => b.key);
    expect(keys).toContain("scope");
    expect(keys).toContain("ruling_id");
  });

  it("makes ruling analysis separate the court's reasoning from the writer's critique", () => {
    const keys = getTemplate("case_study").map((b) => b.key);
    expect(keys.indexOf("court_reasoning")).toBeLessThan(keys.indexOf("critique"));
  });

  it("makes the law analysis pin down whether the rule is actually in force", () =>
    expect(getTemplate("law_analysis").map((b) => b.key)).toContain("status"));

  it("does not let AI invent the source of a real case study", () =>
    expect(isHumanOnlyBlock("client_case_study", "case_source")).toBe(true));

  it("makes the practical checklist separate red flags", () =>
    expect(getTemplate("practical_checklist").map((b) => b.key)).toContain("red_flags"));

  it("makes the service page own its risks and refuse to promise outcomes", () => {
    const keys = getTemplate("service_page").map((b) => b.key);
    expect(keys).toContain("risks");
    expect(keys).toContain("outcomes");
  });

  it("makes the trust builder say which cases get declined", () =>
    // این صراحت بیش از هر ادعای بزرگی اعتماد می‌سازد؛ حذفش یعنی برگشت به تبلیغات.
    expect(getTemplate("trust_builder").map((b) => b.key)).toContain("declined_cases"));

  it("makes the trust builder address confidentiality and conflicts", () =>
    expect(getTemplate("trust_builder").map((b) => b.key)).toContain("confidentiality"));

  it("makes local content carry real jurisdiction detail, not just a city name", () =>
    expect(getTemplate("local_seo").map((b) => b.key)).toContain("jurisdiction"));

  it("makes the step-by-step guide check feasibility before step one", () => {
    const keys = getTemplate("step_by_step").map((b) => b.key);
    expect(keys.indexOf("step_zero")).toBeLessThan(keys.indexOf("steps"));
    expect(keys).toContain("deadlines");
  });

  it("makes the QA template separate the rule from what actually decides a case", () =>
    expect(getTemplate("legal_qa").map((b) => b.key)).toContain("deciding_factors"));
});

describe("every type is fully wired", () => {
  it("has a dedicated prompt per type", () =>
    Object.values(ArticleType).forEach((t) => {
      expect(DEFAULT_CATEGORY_PROMPTS[t], t).toBeTruthy();
      expect(DEFAULT_CATEGORY_PROMPTS[t].length, t).toBeGreaterThan(200);
    }));

  it("gives no two types the same prompt", () => {
    const prompts = Object.values(ArticleType).map((t) => DEFAULT_CATEGORY_PROMPTS[t]);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("assigns every type a funnel role", () =>
    Object.values(ArticleType).forEach((t) => expect(articleTypeRole[t], t).toBeTruthy()));

  it("covers all three funnel roles", () =>
    expect(new Set(Object.values(ArticleType).map((t) => articleTypeRole[t]))).toEqual(
      new Set(["traffic", "conversion", "authority"]),
    ));
});
