import { isValidJalaaliDate, toGregorian, toJalaali, isLeapJalaaliYear, jalaaliMonthLength } from "jalaali-js";

export type JalaliParts = { jy: number; jm: number; jd: number };
export { isLeapJalaaliYear };

export function normalizePersianDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function parseJalaliDate(input: string): JalaliParts {
  const normalized = normalizePersianDigits(input.trim()).replace(/-/g, "/");
  const [jy, jm, jd] = normalized.split("/").map(Number);
  if (!jy || !jm || !jd || !isValidJalaaliDate(jy, jm, jd)) {
    throw new Error("تاریخ شمسی نامعتبر است. نمونه درست: ۱۴۰۳/۰۴/۱۳");
  }
  return { jy, jm, jd };
}

export function jalaliToDateUtc(input: string): Date {
  const { jy, jm, jd } = parseJalaliDate(input);
  const g = toGregorian(jy, jm, jd);
  return new Date(Date.UTC(g.gy, g.gm - 1, g.gd));
}

export function jalaliYear(input: string): number {
  return parseJalaliDate(input).jy;
}

export function jalaliMonth(input: string): number {
  return parseJalaliDate(input).jm;
}

export function daysBetweenJalali(start: string, end: string): number {
  const a = jalaliToDateUtc(start).getTime();
  const b = jalaliToDateUtc(end).getTime();
  const days = Math.ceil((b - a) / 86_400_000);
  if (days < 0) throw new Error("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
  return days;
}

export function todayJalali(): string {
  const j = toJalaali(new Date());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`;
}

export function formatJalaliDate(jy: number, jm: number, jd: number): string {
  return `${jd} ${MONTH_NAMES_FA[jm - 1]} ${jy}`;
}

export const MONTH_NAMES_FA = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const WEEKDAY_NAMES_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];

function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const g = toGregorian(jy, jm, jd);
  const a = Math.floor((14 - g.gm) / 12);
  const y = g.gy + 4800 - a;
  const m = g.gm + 12 * a - 3;
  return g.gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function addDaysJalali(parts: JalaliParts, days: number): JalaliParts {
  const g = toGregorian(parts.jy, parts.jm, parts.jd);
  const d = new Date(Date.UTC(g.gy, g.gm - 1, g.gd));
  d.setUTCDate(d.getUTCDate() + days);
  const result = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  return { jy: result.jy, jm: result.jm, jd: result.jd };
}

export function weekdayIndex(parts: JalaliParts): number {
  const g = toGregorian(parts.jy, parts.jm, parts.jd);
  return new Date(g.gy, g.gm - 1, g.gd).getDay();
}

export function weekdayNameFa(parts: JalaliParts): string {
  return WEEKDAY_NAMES_FA[weekdayIndex(parts)];
}

export function isFriday(parts: JalaliParts): boolean {
  return weekdayIndex(parts) === 5;
}

export function isThursday(parts: JalaliParts): boolean {
  return weekdayIndex(parts) === 4;
}

export function jalaliKey(parts: JalaliParts): string {
  return `${parts.jy}/${String(parts.jm).padStart(2, "0")}/${String(parts.jd).padStart(2, "0")}`;
}

export function formatJalaliParts(parts: JalaliParts): string {
  return `${parts.jy}/${String(parts.jm).padStart(2, "0")}/${String(parts.jd).padStart(2, "0")}`;
}

export function jalaliMonthLen(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

/** «YYYY-MM-DD» میلادی → اجزای شمسی. برای ورودی‌های تاریخ که مقدارشان ISO ذخیره می‌شود. */
export function isoToJalaliParts(iso: string): JalaliParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!match) return null;
  const [, gy, gm, gd] = match;
  const j = toJalaali(Number(gy), Number(gm), Number(gd));
  return { jy: j.jy, jm: j.jm, jd: j.jd };
}

/** اجزای شمسی → «YYYY-MM-DD» میلادی، همان شکلی که سرور و اسکیما انتظار دارند. */
export function jalaliPartsToIso(parts: JalaliParts): string {
  const g = toGregorian(parts.jy, parts.jm, parts.jd);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}

export function todayJalaliParts(): JalaliParts {
  const now = new Date();
  const j = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return { jy: j.jy, jm: j.jm, jd: j.jd };
}
