"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Calculator, AlertCircle, Info, ChevronLeft, ChevronRight, Calendar, X, Plus } from "lucide-react";
import { PrintableResult } from "./PrintableResult";
import { CalcConsultationBridge } from "./CalcConsultationBridge";
import { trackEvent } from "@/lib/analytics";

type DeadlineItem = {
  id: number;
  category: string;
  title: string;
  days: number;
  foreignDays: number | null;
  article: string | null;
  defaultMode: string | null;
  orderIndex: number;
};

type Categories = Record<string, { label: string; items: DeadlineItem[] }>;

type Shift = { dateStr: string; weekday: string; reason: string };

type Result = {
  startDateStr: string;
  startWeekday: string;
  duration: number;
  rawDateStr: string;
  rawWeekday: string;
  finalDateStr: string;
  finalWeekday: string;
  shifts: Shift[];
  deadlineTitle: string;
  article: string | null;
  mode: string;
  isForeign: boolean;
  legalBasis: string;
  disclaimer: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  civil: "آیین دادرسی مدنی",
  executionCivil: "اجرای احکام مدنی",
  criminal: "آیین دادرسی کیفری",
};

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const WEEKDAY_SHORT = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

// ── Jalali helpers ──────────────────────────────────────────────────

function gregToJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

function jalaliToGreg(jy: number, jm: number, jd: number) {
  const jy1 = jy - 979;
  const jm1 = jm - 1;
  const jDayNo = 365 * jy1 + Math.floor(jy1 / 33) * 8 + Math.floor((jy1 % 33 + 3) / 4) + (jm1 < 6 ? jm1 * 31 : jm1 * 30 + 6) + jd - 1;
  let gDayNo = jDayNo + 79;
  let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
  gDayNo %= 146097;
  if (gDayNo >= 36525) { gDayNo--; gy += 100 * Math.floor(gDayNo / 36524); gDayNo %= 36524; if (gDayNo >= 365) gDayNo++; }
  gy += 4 * Math.floor(gDayNo / 1461); gDayNo %= 1461;
  if (gDayNo >= 366) { gy += Math.floor((gDayNo - 1) / 365); gDayNo = (gDayNo - 1) % 365; }
  const gd_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13 && gDayNo >= gd_m[gm]; gm++) gDayNo -= gd_m[gm];
  return { gy, gm, gd: gDayNo + 1 };
}

function isJalaliLeap(jy: number) {
  const r = ((jy - 474) % 2820 + 2820) % 2820;
  return ((r + 474) * 682) % 2816 < 682;
}

function jalaliMonthDays(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

function jalaliWeekday(jy: number, jm: number, jd: number) {
  const g = jalaliToGreg(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd).getDay();
}

function formatJalali(jy: number, jm: number, jd: number) {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

function todayJalali() {
  const now = new Date();
  return gregToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// ── Toggle Switch ───────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
        checked ? "bg-primary-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "start-5" : "start-0.5"
        }`}
      />
    </button>
  );
}

// ── Jalali Calendar Picker ──────────────────────────────────────────

function JalaliDatePicker({
  value,
  onChange,
  isRTL,
}: {
  value: string;
  onChange: (v: string) => void;
  isRTL: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => {
    const m = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (m) return { jy: +m[1], jm: +m[2], jd: +m[3] };
    return todayJalali();
  }, [value]);

  const [viewYear, setViewYear] = useState(parsed.jy);
  const [viewMonth, setViewMonth] = useState(parsed.jm);

  useEffect(() => {
    setViewYear(parsed.jy);
    setViewMonth(parsed.jm);
  }, [parsed.jy, parsed.jm]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = jalaliMonthDays(viewYear, viewMonth);
  const firstWeekday = jalaliWeekday(viewYear, viewMonth, 1);
  const startOffset = (firstWeekday + 1) % 7; // Shamsi week starts Saturday

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function selectDay(d: number) {
    onChange(formatJalali(viewYear, viewMonth, d));
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="1405/04/13"
          dir="ltr"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary-900 font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors cursor-pointer"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {isRTL ? "می‌توانید تاریخ را با آیکن تقویم هم انتخاب کنید." : "You can also pick the date using the calendar icon."}
      </p>

      {open && (
        <div className="absolute z-50 mt-2 w-[300px] bg-white rounded-2xl border border-gray-200 shadow-xl p-4 end-0" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(+e.target.value)}
                className="text-sm font-bold text-primary-900 bg-transparent cursor-pointer focus:outline-none"
              >
                {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
              </select>
              <input
                type="number"
                value={viewYear}
                onChange={(e) => setViewYear(+e.target.value)}
                className="w-16 text-sm font-bold text-primary-900 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAY_SHORT.map((w, i) => (
              <div key={i} className={`text-center text-xs font-medium py-1 ${i === 5 ? "text-red-400" : "text-gray-400"}`}>
                {w}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isSelected = viewYear === parsed.jy && viewMonth === parsed.jm && d === parsed.jd;
              const wd = jalaliWeekday(viewYear, viewMonth, d);
              const isFri = wd === 5;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-colors cursor-pointer
                    ${isSelected ? "bg-primary-600 text-white font-bold" : isFri ? "text-red-400 hover:bg-red-50" : "text-gray-700 hover:bg-primary-50"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => { const t = todayJalali(); onChange(formatJalali(t.jy, t.jm, t.jd)); setOpen(false); }}
            className="mt-2 w-full text-center text-xs text-primary-600 hover:text-primary-800 py-1.5 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
          >
            {isRTL ? "امروز" : "Today"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function DeadlineCalc({ isRTL }: { isRTL: boolean }) {
  const [categories, setCategories] = useState<Categories | null>(null);
  const [activeCategory, setActiveCategory] = useState("civil");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [isForeign, setIsForeign] = useState(false);
  const [thursdayOff, setThursdayOff] = useState(false);
  const [customHolidays, setCustomHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calculators/deadlines")
      .then((r) => r.json())
      .then((data: Categories) => {
        setCategories(data);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));

    const t = todayJalali();
    setStartDate(formatJalali(t.jy, t.jm, t.jd));
  }, []);

  const categoryItems = useMemo(() => {
    if (!categories) return [];
    return categories[activeCategory]?.items || [];
  }, [categories, activeCategory]);

  const selectedItem = useMemo(() => {
    if (!categories || !selectedId) return null;
    for (const cat of Object.values(categories)) {
      const found = cat.items.find((d) => d.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [categories, selectedId]);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setSelectedId(null);
    setResult(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setError(isRTL ? "لطفاً نوع مهلت را انتخاب کنید" : "Please select a deadline type");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/calculators/deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadlineId: selectedId, startDate, isForeign, thursdayOff, customHolidays }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "خطا در محاسبه"); return; }
    setResult(data);
    trackEvent("calculator_used", { calc: "deadline" });
  }

  function addCustomHoliday() {
    if (newHoliday.trim() && !customHolidays.includes(newHoliday.trim())) {
      setCustomHolidays([...customHolidays, newHoliday.trim()]);
      setNewHoliday("");
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Info box */}
      <div className="flex gap-3 rounded-2xl bg-primary-50 border border-primary-200 p-5">
        <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-sm text-primary-900 leading-relaxed">
          {isRTL
            ? "با استفاده از فرم زیر می‌توانید نسبت به محاسبه مهلت‌ها و مواعد قانونی اعم از مهلت‌های آیین دادرسی مدنی، کیفری یا اجرای احکام مدنی اقدام کنید. برای انجام این کار کافیست دسته‌بندی، نوع مهلت، تاریخ مبدأ و سایر تنظیمات را انتخاب کنید. اپلیکیشن به صورت خودکار تعطیلات آخر هفته و همچنین سایر تعطیلات رسمی را در محاسبات مد نظر قرار می‌دهد."
            : "Use the form below to calculate legal deadlines including civil procedure, criminal procedure, and civil execution deadlines. Simply select the category, deadline type, start date, and settings. The app automatically accounts for weekends and official holidays."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Category select */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            {isRTL ? "دسته بندی" : "Category"}
          </label>
          <select
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary-900 font-medium appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:left_12px_center] bg-no-repeat focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Deadline type select */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            {isRTL ? "نوع مهلت" : "Deadline Type"}
          </label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => { setSelectedId(e.target.value ? +e.target.value : null); setResult(null); }}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary-900 font-medium appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:left_12px_center] bg-no-repeat focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer"
          >
            <option value="">{isRTL ? "انتخاب کنید..." : "Select..."}</option>
            {categoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            {isRTL ? "تاریخ ابلاغ" : "Notification Date"}
          </label>
          <JalaliDatePicker value={startDate} onChange={setStartDate} isRTL={isRTL} />
        </div>

        {/* Toggles */}
        <div className="space-y-4 py-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {isRTL ? "حداقل یکی از مخاطبین مقیم خارج است" : "At least one party resides abroad"}
            </span>
            <Toggle checked={isForeign} onChange={setIsForeign} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {isRTL ? "پنج‌شنبه‌ها روز تعطیل محسوب شود" : "Consider Thursdays as holidays"}
            </span>
            <Toggle checked={thursdayOff} onChange={setThursdayOff} />
          </div>
        </div>

        {/* Custom holidays */}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="w-full rounded-xl border border-gray-200 py-3 text-sm text-primary-700 font-medium hover:bg-primary-50 transition-colors cursor-pointer"
        >
          {isRTL ? "تعطیلات دلخواه" : "Custom Holidays"}
          {customHolidays.length > 0 && (
            <span className="bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs ms-2">{customHolidays.length}</span>
          )}
        </button>

        {showCustom && (
          <div className="space-y-2 -mt-3">
            <div className="flex gap-2">
              <input
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                placeholder="1405/05/13"
                dir="ltr"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 outline-none"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomHoliday(); } }}
              />
              <button type="button" onClick={addCustomHoliday} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {customHolidays.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customHolidays.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 rounded-full px-2.5 py-1 text-xs">
                    {h}
                    <button type="button" onClick={() => setCustomHolidays(customHolidays.filter((_, j) => j !== i))} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">
              {isRTL ? "تعطیلات موردی اعلامی که در سیستم ثبت نشده‌اند را اینجا اضافه کنید." : "Add ad-hoc holidays not registered in the system."}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !selectedId}
          className="w-full rounded-xl bg-primary-900 text-white py-3.5 font-bold text-sm hover:bg-primary-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          {loading
            ? (isRTL ? "در حال محاسبه..." : "Calculating...")
            : (isRTL ? "محاسبه" : "Calculate")}
        </button>
      </form>

      {/* Result */}
      {result && (
        <PrintableResult
          title={isRTL ? "محاسبه مواعد قضایی" : "Legal Deadline Calculation"}
          disclaimer={result.disclaimer}
          legalBasis={result.legalBasis}
          isRTL={isRTL}
        >
          <div className="grid gap-3">
            {/* Final date */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
              <p className="text-sm text-emerald-600 mb-1">
                {isRTL
                  ? (result.mode === "minimum" ? "اولین تاریخ مجاز" : "آخرین مهلت اقدام")
                  : (result.mode === "minimum" ? "Earliest Allowed Date" : "Last Day to Act")}
              </p>
              <p className="text-2xl font-bold text-emerald-800" dir="ltr">{result.finalDateStr}</p>
              <p className="text-sm text-emerald-600 mt-1">{result.finalWeekday}</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{isRTL ? "مدت قانونی" : "Duration"}</p>
                <p className="font-bold text-primary-900">{result.duration} {isRTL ? "روز" : "days"}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{isRTL ? "تاریخ مبدأ" : "Start"}</p>
                <p className="font-bold text-primary-900 text-xs" dir="ltr">{result.startDateStr}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{isRTL ? "تاریخ خام" : "Raw Date"}</p>
                <p className="font-bold text-primary-900 text-xs" dir="ltr">{result.rawDateStr}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2 mt-2">
              <p className="text-sm font-medium text-gray-700">{isRTL ? "مراحل محاسبه:" : "Steps:"}</p>
              <div className="rounded-xl bg-gray-50 p-3 text-sm leading-7 text-gray-600 space-y-1.5">
                <p>
                  {isRTL ? "تاریخ مبدأ:" : "Start date:"}{" "}
                  <b className="text-primary-900">{result.startWeekday} {result.startDateStr}</b>
                </p>
                <p className="text-xs text-gray-500">
                  {isRTL
                    ? "طبق ماده ۴۴۵، روز ابلاغ و روز اقدام جزء مدت محسوب نشد."
                    : "Per Article 445, notification day and action day are excluded."}
                </p>
                <p>
                  {isRTL ? `مدت ${result.duration} روزه → تاریخ خام:` : `${result.duration}-day period → Raw date:`}{" "}
                  <b className="text-primary-900">{result.rawWeekday} {result.rawDateStr}</b>
                </p>

                {result.shifts.length > 0 ? (
                  <>
                    {result.shifts.map((s, i) => (
                      <p key={i} className="text-red-600 text-xs">
                        {s.weekday} {s.dateStr} {isRTL ? `— ${s.reason}، قابل اقدام نیست` : `— ${s.reason}, not actionable`}
                      </p>
                    ))}
                    <p className="text-emerald-700 font-medium">
                      {isRTL ? "مهلت نهایی:" : "Final deadline:"}{" "}
                      <b>{result.finalWeekday} {result.finalDateStr}</b>
                    </p>
                  </>
                ) : (
                  <p className="text-emerald-700">
                    {isRTL
                      ? "تاریخ خام مصادف با تعطیلی نبود — همان تاریخ نهایی است."
                      : "Raw date is not a holiday — it's the final deadline."}
                  </p>
                )}

                {result.isForeign && (
                  <p className="text-xs text-amber-600">
                    {isRTL ? "مهلت مخصوص مقیم خارج از کشور اعمال شد." : "Foreign resident deadline applied."}
                  </p>
                )}
              </div>
            </div>

            {/* Legal reference */}
            {result.article && (
              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                <b>{isRTL ? "مستند:" : "Reference:"}</b> {result.article}
              </div>
            )}
          </div>
          <CalcConsultationBridge
            calcTitle={isRTL ? "پیگیری مواعد قانونی" : "Legal Deadline Follow-up"}
            prefilledMessage={
              isRTL
                ? "سلام، از ماشین‌حساب مواعد قانونی سایت استفاده کردم و نیاز به مشاوره درباره‌ی مهلت‌های پرونده‌ام دارم."
                : "Hi, I used the legal deadline calculator on your site and need consultation about my case deadlines."
            }
            isRTL={isRTL}
          />
        </PrintableResult>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 leading-relaxed">
        {isRTL
          ? "⚠️ از دست دادن مهلت قضایی عواقب جبران‌ناپذیر دارد. این محاسبه صرفاً جنبه‌ی کمکی دارد. تعطیلات اعلامی موردی ممکن است در سیستم ثبت نشده باشند. بررسی نهایی با وکیل یا مرجع قضایی صالح الزامی است."
          : "⚠️ Missing a legal deadline can have irreversible consequences. This calculation is for reference only. Ad-hoc holidays may not be registered. Always verify with your attorney or the competent court."}
      </div>
    </div>
  );
}
