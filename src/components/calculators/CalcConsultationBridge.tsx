"use client";

import Link from "next/link";
import { Phone, ArrowLeft } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { primaryOffice } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { consultationHref, consultationLinkProps } from "@/lib/consultation-cta";

/**
 * پل «بعد از محاسبه → مشاوره». فاز D سند v2 پیشنهاد کرده که زیر نتیجه‌ی هر
 * ماشین‌حساب یک CTA زمینه‌دار قرار گیرد — مطابق موضوع محاسبه — تا کاربر از
 * ابزار به مشاوره حرکت کند. ماشین‌حساب‌ها بهترین دارایی جذب سایت‌اند اما در
 * حال حاضر به مسیر تبدیل وصل نیستند.
 *
 * پیام پیش‌فرض واتساپ حاوی نوع محاسبه است تا وکیل بلافاصله بداند موضوع چیست.
 * اگر office.whatsapp تنظیم نشده باشد، به‌جای واتساپ فقط لینک تلفن + فرم
 * تماس نشان داده می‌شود.
 */
export function CalcConsultationBridge({
  calcTitle,
  prefilledMessage,
  isRTL,
}: {
  calcTitle: string;
  prefilledMessage: string;
  isRTL: boolean;
}) {
  const office = primaryOffice();
  const waBase = toWhatsAppLink(office.whatsapp);
  const waHref = waBase ? `${waBase}?text=${encodeURIComponent(prefilledMessage)}` : null;

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-950 text-white p-6 sm:p-7 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center shrink-0">
          <ArrowLeft className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h3 className={`font-bold text-white mb-1 ${isRTL ? "font-fa" : "font-serif"}`}>
            {isRTL ? `برای پیگیری ${calcTitle} با وکیل مشورت کنید` : `Consult a Lawyer About ${calcTitle}`}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {isRTL
              ? "این محاسبه فقط اطلاعات پایه است. برای مطالبه‌ی این مبلغ (نحوه‌ی طرح دعوا، شانس موفقیت، مدارک لازم) با تیم دادپروران مهر ایران مشورت کنید. جلسه‌ی اول رایگان است."
              : "This is only a rough estimate. Consult our team about how to pursue this claim, chance of success, and required evidence. First consultation is free."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {/* الگوی مشترک CTA سایت: طلایی + واتساپ برند + شیشه‌ای */}
        <a
          href={`tel:${office.phone}`}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-gold-500/25"
          data-cta="calc-bridge-tel"
          dir="ltr"
        >
          <Phone className="w-4 h-4" />
          {office.phoneDisplay[isRTL ? "fa" : "en"]}
        </a>
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#25D366]/25"
            data-cta="calc-bridge-whatsapp"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {isRTL ? "مشاوره در واتساپ" : "WhatsApp Consultation"}
          </a>
        )}
        <a
          href={consultationHref(isRTL ? "fa" : "en")}
          {...consultationLinkProps()}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all backdrop-blur-sm"
        >
          {isRTL ? "درخواست مشاوره" : "Request Consultation"}
        </a>
      </div>
    </div>
  );
}
