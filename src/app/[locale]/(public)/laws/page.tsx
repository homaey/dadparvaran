import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Landmark, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllLaws } from "@/lib/laws";
import type { Metadata } from "next";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";
import { toPersianDigits } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.laws" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/laws`,
      languages: { fa: "https://www.dadparvaran.com/fa/laws", en: "https://www.dadparvaran.com/en/laws" },
    },
  };
}

export default async function LawsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "laws" });
  const laws = await getAllLaws();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="py-24 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              {t("title")}
            </span>
            <h1 className={`mt-3 text-3xl sm:text-4xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {t("title")}
            </h1>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          {laws.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {isRTL ? "هنوز قانونی ثبت نشده است." : "No laws registered yet."}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laws.map((law) => (
                <Link
                  key={law.id}
                  href={`/${locale}/laws/${law.slug}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    <Landmark className="w-6 h-6 text-primary-700" />
                  </div>
                  <h2 className="text-lg font-bold text-primary-900 mb-2 font-fa-display">
                    {toPersianDigits(law.title)}
                  </h2>
                  {law.adoptionDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{t("adoptionDate")}: {toPersianDigits(law.adoptionDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors">
                    {t("viewLaw")}
                    <Arrow className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ContactLawyersCTA />
    </div>
  );
}
