import { describe, expect, it } from "vitest";
import { detectSensitivePersonalData } from "./pii";

describe("content PII gate", () => {
  it("detects Persian mobile numbers", () => {
    expect(detectSensitivePersonalData("شماره موکل ۰۹۱۲۱۲۳۴۵۶۷ است")).toContain("mobile");
  });
  it("does not flag ordinary legal article numbers", () => {
    expect(detectSensitivePersonalData("مطابق ماده ۱۰ قانون و تبصره ۲")).toEqual([]);
  });
});
