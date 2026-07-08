"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function FAQSection() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="py-24 bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
      id="faq"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
            {isRTL ? "سوالات متداول" : "FAQ"}
          </span>
          <h2 className={`mt-3 text-3xl font-bold text-primary-900 ${isRTL ? "font-fa" : "font-serif"}`}>
            {isRTL ? "پرسش‌های متداول" : "Frequently Asked Questions"}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-start"
              >
                <span className={`font-semibold text-primary-900 ${isRTL ? "font-fa" : ""}`}>
                  {isRTL ? faq.questionFA : faq.questionEN}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform shrink-0 ms-4",
                    open === idx && "rotate-180"
                  )}
                />
              </button>
              {open === idx && (
                <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
                  {isRTL ? faq.answerFA : faq.answerEN}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
