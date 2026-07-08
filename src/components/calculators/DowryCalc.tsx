"use client";

import { useState, useEffect } from "react";
import { Calculator, AlertCircle } from "lucide-react";
import { PrintableResult } from "./PrintableResult";

const MONTH_NAMES_FA = [
  "", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

type Result = {
  originalAmount: number;
  currentValue: number;
  difference: number;
  startIndex: number;
  endIndex: number;
  startLabel: string;
  endLabel: string;
  formula: string;
  legalBasis: string;
  disclaimer: string;
};

type AvailablePeriods = {
  years: number[];
  monthsByYear: Record<number, number[]>;
};

export function DowryCalc({ isRTL }: { isRTL: boolean }) {
  const [originalAmount, setOriginalAmount] = useState("");
  const [marriageYear, setMarriageYear] = useState("");
  const [marriageMonth, setMarriageMonth] = useState("");
  const [demandYear, setDemandYear] = useState("");
  const [demandMonth, setDemandMonth] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState<AvailablePeriods | null>(null);

  useEffect(() => {
    fetch("/api/calculators/available-periods")
      .then((r) => r.json())
      .then((data: AvailablePeriods) => {
        setPeriods(data);
        if (data.years.length > 0) {
          const lastYear = data.years[data.years.length - 1];
          const lastMonths = data.monthsByYear[lastYear] || [];
          setDemandYear(String(lastYear));
          setDemandMonth(String(lastMonths[lastMonths.length - 1] || 1));
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/calculators/dowry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalAmount,
        marriageYear,
        marriageMonth,
        demandYear,
        demandMonth,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "خطا در محاسبه");
      return;
    }
    setResult(data);
  }

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("fa-IR") + " تومان";
  }

  const marriageMonths = periods && marriageYear ? (periods.monthsByYear[Number(marriageYear)] || []) : [];
  const demandMonths = periods && demandYear ? (periods.monthsByYear[Number(demandYear)] || []) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className={`font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {isRTL ? "ورودی‌های محاسبه" : "Calculation Inputs"}
          </h2>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            {isRTL ? "تبصره‌ی ماده ۱۰۸۲ ق.م" : "Art. 1082 Note"}
          </span>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {isRTL ? "مبلغ مهریه در عقدنامه (تومان)" : "Dowry Amount in Contract (Toman)"}
          </span>
          <input
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder={isRTL ? "مثلاً ۵,۰۰۰,۰۰۰" : "e.g. 5,000,000"}
            dir="ltr"
          />
          <p className="text-xs text-gray-400 mt-1">
            {isRTL ? "مبلغ به تومان وارد شود. اگر ریال است، تقسیم بر ۱۰ کنید." : "Enter in Toman. If in Rials, divide by 10."}
          </p>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            {isRTL ? "تاریخ عقد" : "Marriage Date (Month & Year)"}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={marriageMonth}
              onChange={(e) => setMarriageMonth(e.target.value)}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="">{isRTL ? "ماه..." : "Month..."}</option>
              {marriageMonths.map((m) => (
                <option key={m} value={m}>{isRTL ? MONTH_NAMES_FA[m] : `Month ${m}`}</option>
              ))}
            </select>
            <select
              value={marriageYear}
              onChange={(e) => {
                setMarriageYear(e.target.value);
                setMarriageMonth("");
              }}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="">{isRTL ? "سال..." : "Year..."}</option>
              {periods?.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            {isRTL ? "تاریخ مطالبه" : "Demand Date (Month & Year)"}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={demandMonth}
              onChange={(e) => setDemandMonth(e.target.value)}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="">{isRTL ? "ماه..." : "Month..."}</option>
              {demandMonths.map((m) => (
                <option key={m} value={m}>{isRTL ? MONTH_NAMES_FA[m] : `Month ${m}`}</option>
              ))}
            </select>
            <select
              value={demandYear}
              onChange={(e) => {
                setDemandYear(e.target.value);
                setDemandMonth("");
              }}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="">{isRTL ? "سال..." : "Year..."}</option>
              {periods?.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-700 leading-relaxed">
          {isRTL
            ? "این ابزار فقط مهریه‌ی وجه نقد (تومان) را پوشش می‌دهد. محاسبه‌ی مهریه‌ی سکه نیازمند نرخ روز سکه است و به‌زودی اضافه خواهد شد."
            : "This tool only covers cash dowry (Toman). Gold coin dowry calculation requires current coin prices and will be added soon."}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary-900 text-white py-3.5 font-bold text-sm hover:bg-primary-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          {loading
            ? (isRTL ? "در حال محاسبه..." : "Calculating...")
            : (isRTL ? "محاسبه کن" : "Calculate")}
        </button>
      </form>

      {result ? (
        <PrintableResult
          title={isRTL ? "مهریه به نرخ روز" : "Dowry at Current Rate"}
          disclaimer={result.disclaimer}
          legalBasis={result.legalBasis}
          isRTL={isRTL}
        >
          <div className="grid gap-3">
            <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center">
              <span className="text-gray-500 text-sm">{isRTL ? "مبلغ مهریه:" : "Original Dowry:"}</span>
              <b className="text-primary-900">{fmt(result.originalAmount)}</b>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex justify-between items-center">
              <span className="text-emerald-700 text-sm font-medium">{isRTL ? "ارزش فعلی:" : "Current Value:"}</span>
              <b className="text-emerald-800 text-lg">{fmt(result.currentValue)}</b>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 flex justify-between items-center">
              <span className="text-blue-700 text-sm">{isRTL ? "مابه‌التفاوت:" : "Difference:"}</span>
              <b className="text-blue-800">{fmt(result.difference)}</b>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600">
            <p><b className="text-primary-900">{isRTL ? "فرمول:" : "Formula:"}</b> {result.formula}</p>
            <p className="mt-1">
              <b className="text-primary-900">{isRTL ? "شاخص زمان عقد" : "Marriage Index"} ({result.startLabel}):</b> {result.startIndex}
              {" — "}
              <b className="text-primary-900">{isRTL ? "شاخص زمان مطالبه" : "Demand Index"} ({result.endLabel}):</b> {result.endIndex}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {isRTL ? "منبع: بانک مرکزی جمهوری اسلامی ایران — سال پایه ۱۳۹۵ = ۱۰۰" : "Source: Central Bank of Iran — Base year 1395 = 100"}
            </p>
          </div>
        </PrintableResult>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-gray-400 flex flex-col items-center justify-center">
          <Calculator className="w-12 h-12 mb-3 text-gray-300" />
          <p>{isRTL ? "پس از محاسبه، نتیجه اینجا نمایش داده می‌شود" : "Results will appear here after calculation"}</p>
        </div>
      )}
    </div>
  );
}
