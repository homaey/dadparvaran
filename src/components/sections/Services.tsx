import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Scale, Shield, Building2, FileText, Home, Heart, ArrowLeft, ArrowRight } from "lucide-react";

const icons = [Scale, Shield, Building2, FileText, Home, Heart];

export default function Services() {
  const t = useTranslations("services");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const serviceKeys = ["civil", "criminal", "commercial", "documents", "estate", "family"] as const;

  return (
    <section
      className="py-24 bg-white"
      dir={isRTL ? "rtl" : "ltr"}
      id="services"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
            {isRTL ? "خدمات ما" : "Our Services"}
          </span>
          <h2 className={`mt-3 text-3xl sm:text-4xl font-bold text-primary-900 ${isRTL ? "font-fa" : "font-serif"}`}>
            {t("title")}
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceKeys.map((key, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={key}
                className="group relative bg-white border border-gray-100 hover:border-primary-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-primary-50 group-hover:bg-primary-700 rounded-xl flex items-center justify-center mb-6 transition-colors">
                  <Icon className="w-7 h-7 text-primary-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className={`text-xl font-bold text-primary-900 mb-3 ${isRTL ? "font-fa" : ""}`}>
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {t(`items.${key}.desc`)}
                </p>
                <Link
                  href={`/${locale}/services`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium group/link"
                >
                  {isRTL ? "بیشتر بدانید" : "Learn More"}
                  <Arrow className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>

                {/* Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-gold-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-primary-700/25"
          >
            {isRTL ? "تماس با ما" : "Contact Us"}
            <Arrow className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
