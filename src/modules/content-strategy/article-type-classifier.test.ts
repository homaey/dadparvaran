import { describe, expect, it } from "vitest";
import { ArticleType } from "@/lib/content-enums";
import { classifyArticleType } from "./article-type-classifier";

describe("legal content title classification", () => {
  it.each([
    ["صفحه خدمت تخصصی وکیل خلع ید", ArticleType.SERVICE_PAGE],
    ["وکیل خلع ید در مشهد", ArticleType.LOCAL_SEO],
    ["شرایط فسخ قرارداد اجاره و آثار آن", ArticleType.LEGAL_GUIDE],
    ["آیا چک صیادی بدون ثبت قابل وصول است؟", ArticleType.LEGAL_QA],
    ["راهنمای گام‌به‌گام ثبت دادخواست", ArticleType.STEP_BY_STEP],
    ["اشتباهات رایج در تنظیم قرارداد مشارکت", ArticleType.PRACTICAL_CHECKLIST],
    ["تفاوت فسخ و ابطال قرارداد", ArticleType.COMPARISON],
    ["اصلاحیه جدید قانون کار از چه زمانی لازم‌الاجراست", ArticleType.LEGAL_UPDATE],
    ["تحلیل رأی وحدت رویه درباره خسارت تأخیر", ArticleType.RULING_ANALYSIS],
    ["مطالعه موردی یک پرونده واقعی مطالبه مهریه", ArticleType.CASE_STUDY],
    ["روش کار دفتر در پرونده‌های ملکی", ArticleType.TRUST_BUILDER],
  ])("classifies %s", (title, expected) => expect(classifyArticleType(title)).toBe(expected));

  it("prefers ruling analysis over a generic legal update for a new ruling", () =>
    expect(classifyArticleType("تحلیل رأی وحدت رویه جدید درباره چک")).toBe(ArticleType.RULING_ANALYSIS));

  it("uses the evergreen guide as the safe fallback", () =>
    expect(classifyArticleType("حقوق و تکالیف موجر و مستأجر")).toBe(ArticleType.LEGAL_GUIDE));
});
