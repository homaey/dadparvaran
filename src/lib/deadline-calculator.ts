import {
  type JalaliParts,
  addDaysJalali,
  isFriday,
  isThursday,
  weekdayNameFa,
  jalaliKey,
  formatJalaliParts,
} from "@/lib/jalali";

export type Shift = {
  date: JalaliParts;
  dateStr: string;
  weekday: string;
  reason: string;
};

export type DeadlineResult = {
  startDate: JalaliParts;
  startDateStr: string;
  startWeekday: string;
  duration: number;
  rawDate: JalaliParts;
  rawDateStr: string;
  rawWeekday: string;
  finalDate: JalaliParts;
  finalDateStr: string;
  finalWeekday: string;
  shifts: Shift[];
  deadlineTitle: string;
  article: string | null;
  mode: "deadline" | "minimum";
  isForeign: boolean;
  legalBasis: string;
  disclaimer: string;
};

export type CalcOptions = {
  startDate: JalaliParts;
  days: number;
  holidaySet: Set<string>;
  thursdayOff: boolean;
  mode: "deadline" | "minimum";
  deadlineTitle: string;
  article: string | null;
  isForeign: boolean;
};

function holidayReason(
  j: JalaliParts,
  holidaySet: Set<string>,
  thursdayOff: boolean
): string {
  if (isFriday(j)) return "جمعه";
  if (thursdayOff && isThursday(j)) return "پنج‌شنبه تعطیل";
  if (holidaySet.has(jalaliKey(j))) return "تعطیل رسمی";
  return "";
}

export function calculateDeadline(opts: CalcOptions): DeadlineResult {
  // ماده ۴۴۵: روز ابلاغ و روز اقدام جزو مدت نیست → days + 1
  const raw = addDaysJalali(opts.startDate, opts.days + 1);
  let final = { ...raw };
  const shifts: Shift[] = [];

  let reason = holidayReason(final, opts.holidaySet, opts.thursdayOff);
  while (reason) {
    shifts.push({
      date: { ...final },
      dateStr: formatJalaliParts(final),
      weekday: weekdayNameFa(final),
      reason,
    });
    final = addDaysJalali(final, 1);
    reason = holidayReason(final, opts.holidaySet, opts.thursdayOff);
  }

  return {
    startDate: opts.startDate,
    startDateStr: formatJalaliParts(opts.startDate),
    startWeekday: weekdayNameFa(opts.startDate),
    duration: opts.days,
    rawDate: raw,
    rawDateStr: formatJalaliParts(raw),
    rawWeekday: weekdayNameFa(raw),
    finalDate: final,
    finalDateStr: formatJalaliParts(final),
    finalWeekday: weekdayNameFa(final),
    shifts,
    deadlineTitle: opts.deadlineTitle,
    article: opts.article,
    mode: opts.mode,
    isForeign: opts.isForeign,
    legalBasis: "ماده ۴۴۲ تا ۴۴۹ قانون آیین دادرسی مدنی (باب مواعد)",
    disclaimer:
      "این محاسبه صرفاً جنبه‌ی کمکی و تخمینی دارد. تعطیلات اعلامی موردی (مانند تعطیلات ناشی از آلودگی هوا یا بلایای طبیعی) ممکن است در سیستم ثبت نشده باشند. ملاک نهایی تشخیص مرجع قضایی صالح و بررسی شخصی وکیل است. مسئولیت از دست دادن مهلت بر عهده‌ی کاربر خواهد بود.",
  };
}
