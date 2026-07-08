"use client";

import { Printer } from "lucide-react";

interface PrintableResultProps {
  title: string;
  children: React.ReactNode;
  disclaimer: string;
  legalBasis: string;
  isRTL: boolean;
}

export function PrintableResult({ title, children, disclaimer, legalBasis, isRTL }: PrintableResultProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-area">
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className={`font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {isRTL ? "نتیجه محاسبه" : "Calculation Result"}
          </h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            {isRTL ? "چاپ / ذخیره PDF" : "Print / Save PDF"}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Print header — hidden on screen */}
          <div className="hidden print:block mb-6 text-center border-b pb-4">
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString(isRTL ? "fa-IR" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {children}

          <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm leading-7 text-primary-800">
            <span className="font-bold">{isRTL ? "مبنای حقوقی:" : "Legal Basis:"}</span>{" "}
            {legalBasis}
          </div>

          <p className="text-xs leading-6 text-gray-500 border-t pt-4">
            {disclaimer}
          </p>

          {/* Print footer */}
          <div className="hidden print:block mt-6 pt-4 border-t text-center text-xs text-gray-400">
            {isRTL ? "دادپروران مهر ایران — ابزارهای محاسباتی حقوقی" : "Dadparvaraan Mehr Iran — Legal Calculation Tools"}
          </div>
        </div>
      </div>
    </div>
  );
}
