"use client";

import { useState } from "react";
import { Calculator, AlertCircle } from "lucide-react";
import { PrintableResult } from "./PrintableResult";
import { CalcConsultationBridge } from "./CalcConsultationBridge";
import { trackEvent } from "@/lib/analytics";

type Result = {
  fullDiyeAmount: string;
  percentage: number;
  calculatedAmount: string;
  jalaliYear: number;
  formula: string;
  legalBasis: string;
  disclaimer: string;
};

const COMMON_PERCENTAGES = [
  { label: "دیه کامل", value: 100 },
  { label: "نصف دیه", value: 50 },
  { label: "ثلث دیه", value: 33.33 },
  { label: "ربع دیه", value: 25 },
  { label: "خُمس دیه", value: 20 },
  { label: "عُشر دیه", value: 10 },
  { label: "یک درصد دیه", value: 1 },
];

function fmtRial(s: string): string {
  try {
    return BigInt(s).toLocaleString("fa-IR") + " ریال";
  } catch {
    return s + " ریال";
  }
}

function fmtToman(s: string): string {
  try {
    const rialVal = BigInt(s);
    const tomanVal = rialVal / 10n;
    return tomanVal.toLocaleString("fa-IR") + " تومان";
  } catch {
    return s;
  }
}

export function DiyeCalc({ isRTL }: { isRTL: boolean }) {
  const [jalaliYear, setJalaliYear] = useState("");
  const [percentage, setPercentage] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/calculators/diye", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jalaliYear, percentage }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "خطا در محاسبه");
      return;
    }
    setResult(data);
    trackEvent("calculator_used", { calc: "diye" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className={`font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {isRTL ? "ورودی‌های محاسبه" : "Calculation Inputs"}
          </h2>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            {isRTL ? "ماده ۵۴۹ ق.م.ا" : "Article 549"}
          </span>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {isRTL ? "سال وقوع (شمسی)" : "Year of Occurrence (Jalali)"}
          </span>
          <input
            type="number"
            value={jalaliYear}
            onChange={(e) => setJalaliYear(e.target.value)}
            required
            min={1300}
            max={1500}
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="۱۴۰۴"
          />
          <p className="text-xs text-gray-400 mt-1">
            {isRTL ? "نرخ دیه بر اساس سال اعلامی قوه قضاییه محاسبه می‌شود" : "Diye rate based on annual judiciary directive"}
          </p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {isRTL ? "درصد دیه" : "Diye Percentage"}
          </span>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            required
            min={0.01}
            max={100}
            step={0.01}
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder="۱۰۰"
          />
        </label>

        <div>
          <span className="text-xs font-medium text-gray-500 mb-2 block">
            {isRTL ? "مقادیر رایج:" : "Common values:"}
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_PERCENTAGES.map((cp) => (
              <button
                key={cp.value}
                type="button"
                onClick={() => setPercentage(String(cp.value))}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  percentage === String(cp.value)
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isRTL ? cp.label : `${cp.value}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-700 leading-relaxed">
          {isRTL
            ? "نرخ دیه در ماه‌های حرام (محرم، رجب، ذی‌القعده، ذی‌الحجه) یک‌سوم افزایش می‌یابد (تغلیظ دیه). این محاسبه‌گر نرخ پایه (غیرحرام) را نشان می‌دهد."
            : "Diye increases by one-third during sacred months (Muharram, Rajab, Dhul-Qi'dah, Dhul-Hijjah). This calculator shows the base (non-sacred) rate."}
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
          title={isRTL ? "محاسبه دیه" : "Diye Calculation"}
          disclaimer={result.disclaimer}
          legalBasis={result.legalBasis}
          isRTL={isRTL}
        >
          <div className="grid gap-3">
            <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center">
              <span className="text-gray-500 text-sm">{isRTL ? "دیه کامل سال " : "Full Diye "}{result.jalaliYear}:</span>
              <div className="text-end">
                <b className="text-primary-900 block">{fmtToman(result.fullDiyeAmount)}</b>
                <span className="text-xs text-gray-400">{fmtRial(result.fullDiyeAmount)}</span>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center">
              <span className="text-gray-500 text-sm">{isRTL ? "درصد:" : "Percentage:"}</span>
              <b className="text-primary-900">{result.percentage}٪</b>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex justify-between items-center">
              <span className="text-emerald-700 text-sm font-medium">{isRTL ? "مبلغ دیه:" : "Diye Amount:"}</span>
              <div className="text-end">
                <b className="text-emerald-800 text-lg block">{fmtToman(result.calculatedAmount)}</b>
                <span className="text-xs text-emerald-600">{fmtRial(result.calculatedAmount)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600">
            <p><b className="text-primary-900">{isRTL ? "فرمول:" : "Formula:"}</b> {result.formula}</p>
            <p className="mt-1 text-xs text-gray-400">
              {isRTL
                ? "نرخ رسمی دیه توسط قوه قضاییه به ریال اعلام می‌شود. معادل تومانی برای سهولت نمایش داده شده."
                : "Official diye rate is announced in Rials by the judiciary. Toman equivalent shown for convenience."}
            </p>
          </div>
          <CalcConsultationBridge
            calcTitle={isRTL ? "مطالبه‌ی دیه" : "Diye Claim"}
            prefilledMessage={
              isRTL
                ? `سلام، از ماشین‌حساب دیه‌ی سایت استفاده کردم. مبلغ محاسبه‌شده: ${fmtToman(result.calculatedAmount)}. برای مشاوره تماس می‌گیرم.`
                : `Hi, I used the diye calculator on your site. Calculated amount: ${fmtToman(result.calculatedAmount)}. Reaching out for consultation.`
            }
            isRTL={isRTL}
          />
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
