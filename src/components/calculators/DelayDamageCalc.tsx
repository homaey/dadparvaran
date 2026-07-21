"use client";

import { useState, useEffect } from "react";
import { Calculator, AlertCircle } from "lucide-react";
import { PrintableResult } from "./PrintableResult";
import { CalcConsultationBridge } from "./CalcConsultationBridge";
import { trackEvent } from "@/lib/analytics";

const MONTH_NAMES_FA = [
  "", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

type Result = {
  principal: number;
  updatedAmount: number;
  damageAmount: number;
  startIndex: number;
  endIndex: number;
  startLabel: string;
  endLabel: string;
  fromDate: string;
  toDate: string;
  days: number;
  formula: string;
  legalBasis: string;
  disclaimer: string;
};

type AvailablePeriods = {
  years: number[];
  monthsByYear: Record<number, number[]>;
};

export function DelayDamageCalc({ isRTL }: { isRTL: boolean }) {
  const [principal, setPrincipal] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [toYear, setToYear] = useState("");
  const [toMonth, setToMonth] = useState("");
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
          setToYear(String(lastYear));
          setToMonth(String(lastMonths[lastMonths.length - 1] || 1));
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const fromDate = `${fromYear}/${String(fromMonth).padStart(2, "0")}/01`;
    const toDate = `${toYear}/${String(toMonth).padStart(2, "0")}/01`;

    const res = await fetch("/api/calculators/delay-damage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ principal, fromDate, toDate }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "خطا در محاسبه");
      return;
    }
    setResult(data);
    trackEvent("calculator_used", { calc: "delay-damage" });
  }

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("fa-IR") + " تومان";
  }

  const fromMonths = periods && fromYear ? (periods.monthsByYear[Number(fromYear)] || []) : [];
  const toMonths = periods && toYear ? (periods.monthsByYear[Number(toYear)] || []) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className={`font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {isRTL ? "ورودی‌های محاسبه" : "Calculation Inputs"}
          </h2>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            {isRTL ? "ماده ۵۲۲ ق.آ.د.م" : "Article 522"}
          </span>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {isRTL ? "مبلغ اصل دین (تومان)" : "Principal Amount (Toman)"}
          </span>
          <input
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            placeholder={isRTL ? "مثلاً ۱۰۰,۰۰۰,۰۰۰" : "e.g. 100,000,000"}
            dir="ltr"
          />
          <p className="text-xs text-gray-400 mt-1">
            {isRTL ? "اعداد فارسی و جداکننده پذیرفته می‌شود" : "Persian digits and separators accepted"}
          </p>
        </label>

        {/* From: Month + Year dropdowns */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            {isRTL ? "ماه و سال سررسید / مطالبه" : "Due Date (Month & Year)"}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="">{isRTL ? "ماه..." : "Month..."}</option>
              {fromMonths.map((m) => (
                <option key={m} value={m}>{isRTL ? MONTH_NAMES_FA[m] : `Month ${m}`}</option>
              ))}
            </select>
            <select
              value={fromYear}
              onChange={(e) => {
                setFromYear(e.target.value);
                setFromMonth("");
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

        {/* To: Month + Year dropdowns */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            {isRTL ? "ماه و سال پرداخت / محاسبه" : "Payment Date (Month & Year)"}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              <option value="">{isRTL ? "ماه..." : "Month..."}</option>
              {toMonths.map((m) => (
                <option key={m} value={m}>{isRTL ? MONTH_NAMES_FA[m] : `Month ${m}`}</option>
              ))}
            </select>
            <select
              value={toYear}
              onChange={(e) => {
                setToYear(e.target.value);
                setToMonth("");
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
          title={isRTL ? "خسارت تأخیر تأدیه" : "Late Payment Damages"}
          disclaimer={result.disclaimer}
          legalBasis={result.legalBasis}
          isRTL={isRTL}
        >
          <div className="grid gap-3">
            <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center">
              <span className="text-gray-500 text-sm">{isRTL ? "اصل مبلغ:" : "Principal:"}</span>
              <b className="text-primary-900">{fmt(result.principal)}</b>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center">
              <span className="text-gray-500 text-sm">{isRTL ? "مبلغ به‌روز شده:" : "Updated Amount:"}</span>
              <b className="text-primary-900">{fmt(result.updatedAmount)}</b>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex justify-between items-center">
              <span className="text-emerald-700 text-sm font-medium">{isRTL ? "میزان خسارت:" : "Damage Amount:"}</span>
              <b className="text-emerald-800 text-lg">{fmt(result.damageAmount)}</b>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600">
            <p><b className="text-primary-900">{isRTL ? "فرمول:" : "Formula:"}</b> {result.formula}</p>
            <p className="mt-1">
              <b className="text-primary-900">{isRTL ? "شاخص سررسید" : "Start Index"} ({result.startLabel}):</b> {result.startIndex}
              {" — "}
              <b className="text-primary-900">{isRTL ? "شاخص پرداخت" : "End Index"} ({result.endLabel}):</b> {result.endIndex}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {isRTL ? "منبع: بانک مرکزی جمهوری اسلامی ایران — سال پایه ۱۳۹۵ = ۱۰۰" : "Source: Central Bank of Iran — Base year 1395 = 100"}
            </p>
          </div>
          <CalcConsultationBridge
            calcTitle={isRTL ? "مطالبه‌ی خسارت تأخیر تأدیه" : "Delay Damage Claim"}
            prefilledMessage={
              isRTL
                ? `سلام، از ماشین‌حساب خسارت تأخیر تأدیه‌ی سایت استفاده کردم. مبلغ خسارت محاسبه‌شده: ${fmt(result.damageAmount)}. برای مشاوره تماس می‌گیرم.`
                : `Hi, I used the delay damage calculator on your site. Calculated damages: ${fmt(result.damageAmount)}. Reaching out for consultation.`
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
