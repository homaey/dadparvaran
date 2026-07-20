"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

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
    } catch {
      alert(isRTL ? "خطا در ارسال پیام. لطفاً دوباره تلاش کنید." : "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const contactItems = [
    { icon: MapPin, label: t("address"), value: t("addressValue") },
    { icon: Phone, label: t("phone"), value: t("phoneValue"), href: "tel:+986191010285" },
    { icon: Clock, label: t("hours"), value: t("hoursValue") },
  ];

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

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className={`text-2xl font-bold text-primary-900 mb-8 ${isRTL ? "font-fa" : "font-serif"}`}>
                {isRTL ? "اطلاعات تماس" : "Contact Information"}
              </h2>
              <div className="space-y-6">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-gray-700 hover:text-primary-700 transition-colors font-medium">
                          {value}
                        </a>
                      ) : (
                        <p className="text-gray-700 font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-10 h-64 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">{isRTL ? "نقشه در نسخه نهایی نمایش داده می‌شود" : "Map will be displayed in final version"}</p>
                </div>
              </div>
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
