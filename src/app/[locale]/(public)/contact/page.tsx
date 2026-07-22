"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { offices } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export default function ContactPage() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const body = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      // تله ربات — کاربر واقعی این را نمی‌بیند، پس همیشه خالی می‌ماند
      website: (form.elements.namedItem("website") as HTMLInputElement)?.value || undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      trackEvent("contact_submit", { locale });
    } catch {
      setError(isRTL ? "خطا در ارسال پیام. لطفاً دوباره تلاش کنید." : "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const lang = isRTL ? "fa" : "en";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-32 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
            {isRTL ? "ارتباط با ما" : "Get in Touch"}
          </span>
          <h1 className={`mt-3 text-4xl sm:text-5xl font-bold mb-4 ${isRTL ? "font-fa" : "font-serif"}`}>
            {t("title")}
          </h1>
          <p className="text-gray-300 text-lg">{t("subtitle")}</p>
        </div>
      </section>

      {/* سه کارت شعبه — منبع همه از src/lib/offices.ts. تناقض NAP قدیمی
          (آدرس تهران/تلفن کد اهواز) با این ساختار غیرممکن است. */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl font-bold text-primary-900 mb-3 text-center ${isRTL ? "font-fa" : "font-serif"}`}>
            {isRTL ? "دفاتر ما" : "Our Offices"}
          </h2>
          {isRTL && (
            <p className="text-center text-sm text-gray-500 mb-8">
              <Link href="/fa/offices" className="text-primary-700 hover:text-primary-800 font-medium underline underline-offset-4">
                مشاهده صفحه اختصاصی هر دفتر ←
              </Link>
            </p>
          )}
          {!isRTL && <div className="mb-8" />}
          <div className="grid md:grid-cols-3 gap-6">
            {offices.map((office) => {
              const waLink = office.whatsapp ? toWhatsAppLink(office.whatsapp) : null;
              return (
                <div key={office.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                  <h3 className={`text-lg font-bold text-primary-900 mb-4 ${isRTL ? "font-fa" : "font-serif"}`}>
                    {isRTL ? `دفتر ${office.city.fa}` : `${office.city.en} Office`}
                  </h3>
                  <div className="space-y-3 text-sm flex-1">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{office.street[lang]}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-primary-600 shrink-0" />
                      <a
                        href={`tel:${office.phone}`}
                        className="text-gray-700 hover:text-primary-700 transition-colors font-medium"
                        dir="ltr"
                      >
                        {office.phoneDisplay[lang]}
                      </a>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                      <span className="text-gray-600 text-xs leading-relaxed">{office.hours[lang]}</span>
                    </div>
                  </div>
                  {/* دکمه‌های اقدام — mapUrl و whatsapp اختیاری‌اند و اگر تنظیم نشدند، رندر نمی‌شوند. */}
                  <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                    {office.mapUrl && (
                      <a
                        href={office.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isRTL ? "مسیریابی" : "Directions"}
                      </a>
                    )}
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                        className="inline-flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact hint */}
            <div>
              <h2 className={`text-2xl font-bold text-primary-900 mb-4 ${isRTL ? "font-fa" : "font-serif"}`}>
                {isRTL ? "چطور کمک کنیم؟" : "How Can We Help?"}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {isRTL
                  ? "اگر ترجیح می‌دهید ابتدا موضوع پرونده را بنویسید، پیام خود را از این طریق برای ما بفرستید. تیم ما در ساعات کاری در اسرع وقت پاسخ می‌دهد."
                  : "Prefer to describe your case first? Send us a message and our team will get back to you during business hours."}
              </p>
            </div>

            {/* Contact form */}
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
              <h2 className={`text-2xl font-bold text-primary-900 mb-8 ${isRTL ? "font-fa" : "font-serif"}`}>
                {isRTL ? "ارسال پیام" : "Send a Message"}
              </h2>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">
                    {isRTL ? "پیام ارسال شد!" : "Message Sent!"}
                  </h3>
                  <p className="text-gray-500 text-sm">{t("form.success")}</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    {isRTL ? "ارسال پیام جدید" : "Send New Message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* تله ربات: از دید کاربر و صفحه‌خوان پنهان است؛ اگر پر شود سرور پیام را دور می‌ریزد */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute w-px h-px -m-px overflow-hidden opacity-0 pointer-events-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("form.name")}</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("form.phone")}</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("form.email")}</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("form.message")}</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white resize-none"
                    />
                  </div>
                  {error && (
                    <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isRTL ? "در حال ارسال..." : "Sending..."}
                      </>
                    ) : (
                      t("form.submit")
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
