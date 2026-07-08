import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Calculator, ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.calculators" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/calculators`,
      languages: { fa: "https://www.dadparvaran.com/fa/calculators", en: "https://www.dadparvaran.com/en/calculators" },
    },
  };
}

export default async function CalculatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "calculators" });

  const calculators = await db.calculator.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="py-24 bg-gray-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              {t("badge")}
            </span>
            <h1 className={`mt-3 text-3xl sm:text-4xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {t("title")}
            </h1>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {calculators.length === 0 ? (
            <div className="text-center py-20">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{t("comingSoon")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={`/${locale}/calculators/${calc.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    <Calculator className="w-6 h-6 text-primary-700" />
                  </div>
                  <h3 className={`font-bold text-primary-900 mb-2 ${isRTL ? "font-fa-display" : "font-serif"}`}>
                    {isRTL ? calc.titleFA : calc.titleEN}
                  </h3>
                  {(isRTL ? calc.descriptionFA : calc.descriptionEN) && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {isRTL ? calc.descriptionFA : calc.descriptionEN}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-primary-600 font-medium group-hover:gap-2 transition-all">
                    {isRTL ? "محاسبه کنید" : "Calculate"}
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-amber-800 leading-relaxed">
              {isRTL
                ? "نتایج محاسبات صرفاً جنبه‌ی تخمینی دارند و جایگزین مشاوره حقوقی تخصصی نیستند. تشخیص نهایی با مرجع قضایی صالح است."
                : "Calculation results are estimates only and do not substitute professional legal advice. Final determination rests with the competent judicial authority."}
            </p>
          </div>
        </div>
      </div>

      <ContactLawyersCTA />
    </div>
  );
}
