import { normalizePersianDigits } from "./jalali";

export function parseMoney(input: string | number): number {
  if (typeof input === "number") return input;
  const normalized = normalizePersianDigits(
    input.replace(/[٬,،\s]/g, "")
  );
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("مبلغ نامعتبر است");
  }
  return value;
}

export function formatToman(value: number): string {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}

export function formatRial(value: number): string {
  return `${Math.round(value).toLocaleString("fa-IR")} ریال`;
}
