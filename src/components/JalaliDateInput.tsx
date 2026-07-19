"use client";

import { useMemo, useState } from "react";
import {
  MONTH_NAMES_FA,
  isoToJalaliParts,
  jalaliMonthLen,
  jalaliPartsToIso,
  todayJalaliParts,
  type JalaliParts,
} from "@/lib/jalali";

/**
 * انتخاب تاریخ شمسی که مقدارش را میلادی تحویل فرم می‌دهد.
 *
 * ورودی بومی <input type="date"> همیشه میلادی است و راهی برای شمسی کردنش نیست؛ کاربر ایرانی
 * ۰۴/۱۷/۲۰۲۶ می‌دید. اینجا سه انتخابگر شمسی نشان داده می‌شود ولی مقدار در یک input مخفی با
 * همان name به شکل ISO می‌نشیند، پس کدی که فرم را می‌خواند دست‌نخورده کار می‌کند.
 */
export default function JalaliDateInput({
  name,
  defaultValue,
  disabled,
  required,
  yearsBack = 1,
  yearsAhead = 2,
}: {
  name: string;
  /** تاریخ میلادی به شکل YYYY-MM-DD (یا خالی برای امروز) */
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  yearsBack?: number;
  yearsAhead?: number;
}) {
  const initial = useMemo<JalaliParts>(
    () => (defaultValue ? isoToJalaliParts(defaultValue) ?? todayJalaliParts() : todayJalaliParts()),
    [defaultValue],
  );

  const [parts, setParts] = useState<JalaliParts>(initial);

  const years = useMemo(() => {
    const base = todayJalaliParts().jy;
    const from = Math.min(base - yearsBack, initial.jy);
    const to = Math.max(base + yearsAhead, initial.jy);
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [initial.jy, yearsBack, yearsAhead]);

  const daysInMonth = jalaliMonthLen(parts.jy, parts.jm);

  function update(next: Partial<JalaliParts>) {
    setParts((prev) => {
      const merged = { ...prev, ...next };
      // ۳۱ اسفند بعد از تغییر ماه یا سال کبیسه می‌تواند وجود نداشته باشد.
      const maxDay = jalaliMonthLen(merged.jy, merged.jm);
      return { ...merged, jd: Math.min(merged.jd, maxDay) };
    });
  }

  const selectClass =
    "rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm focus:border-navy-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="روز"
        className={selectClass}
        value={parts.jd}
        disabled={disabled}
        onChange={(e) => update({ jd: Number(e.target.value) })}
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        aria-label="ماه"
        className={`${selectClass} flex-1`}
        value={parts.jm}
        disabled={disabled}
        onChange={(e) => update({ jm: Number(e.target.value) })}
      >
        {MONTH_NAMES_FA.map((label, i) => (
          <option key={label} value={i + 1}>{label}</option>
        ))}
      </select>
      <select
        aria-label="سال"
        className={selectClass}
        value={parts.jy}
        disabled={disabled}
        onChange={(e) => update({ jy: Number(e.target.value) })}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <input type="hidden" name={name} value={jalaliPartsToIso(parts)} required={required} />
    </div>
  );
}
