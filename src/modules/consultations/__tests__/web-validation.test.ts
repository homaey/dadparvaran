import { describe, expect, it } from "vitest";
import {
  normalizeDigits,
  normalizeIranMobile,
  webConsultationInputSchema,
} from "../web-validation";

describe("normalizeDigits", () => {
  it("converts Persian digits to ASCII", () => {
    expect(normalizeDigits("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
  });

  it("converts Arabic-Indic digits to ASCII", () => {
    expect(normalizeDigits("٠٩١٢٣٤٥٦٧٨٩")).toBe("09123456789");
  });

  it("leaves ASCII digits and other characters untouched", () => {
    expect(normalizeDigits("0912-345 6789")).toBe("0912-345 6789");
  });
});

describe("normalizeIranMobile", () => {
  it.each([
    ["09123456789", "09123456789"],
    ["۰۹۱۲۳۴۵۶۷۸۹", "09123456789"],
    ["+989123456789", "09123456789"],
    ["00989123456789", "09123456789"],
    ["989123456789", "09123456789"],
    ["9123456789", "09123456789"],
    ["0912 345 6789", "09123456789"],
    ["0912-345-6789", "09123456789"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeIranMobile(input)).toBe(expected);
  });

  it.each([
    ["0212345678"], // خط ثابت
    ["091234567"], // کوتاه
    ["091234567890"], // بلند
    ["08123456789"], // پیش‌شماره نامعتبر
    ["hello"],
    [""],
  ])("rejects %s", (input) => {
    expect(normalizeIranMobile(input)).toBeNull();
  });
});

const validInput = {
  clientName: "محمد رضایی",
  phone: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "",
  preferredContact: "تماس تلفنی" as const,
  category: "خانواده" as const,
  subCategory: "",
  city: "اهواز",
  clientRole: "خواهان",
  caseStage: "پیش از طرح دعوا" as const,
  urgency: "عادی" as const,
  summary: "همسرم دو سال است که منزل را ترک کرده و برای طلاق غیابی نیاز به راهنمایی دارم.",
  acceptedTerms: true as const,
};

describe("webConsultationInputSchema", () => {
  it("accepts a complete valid submission and normalizes the phone", () => {
    const parsed = webConsultationInputSchema.parse(validInput);
    expect(parsed.phone).toBe("09123456789");
    expect(parsed.clientName).toBe("محمد رضایی");
  });

  it("rejects a landline — the lawyer must be able to reach a mobile", () => {
    expect(() =>
      webConsultationInputSchema.parse({ ...validInput, phone: "06133334444" })
    ).toThrow();
  });

  it("rejects a summary shorter than 40 characters", () => {
    expect(() =>
      webConsultationInputSchema.parse({ ...validInput, summary: "کمک می‌خواهم" })
    ).toThrow();
  });

  it("requires the terms checkbox", () => {
    expect(() =>
      webConsultationInputSchema.parse({ ...validInput, acceptedTerms: false })
    ).toThrow();
  });

  it("rejects a category outside the fixed list", () => {
    expect(() =>
      webConsultationInputSchema.parse({ ...validInput, category: "چیز دیگری" })
    ).toThrow();
  });

  it("treats email as optional", () => {
    const parsed = webConsultationInputSchema.parse({ ...validInput, email: "" });
    expect(parsed.email).toBe("");
  });

  it("rejects a malformed email when one is supplied", () => {
    expect(() =>
      webConsultationInputSchema.parse({ ...validInput, email: "not-an-email" })
    ).toThrow();
  });
});
