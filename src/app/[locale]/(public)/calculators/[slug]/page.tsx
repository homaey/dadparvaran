import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { DelayDamageCalc } from "@/components/calculators/DelayDamageCalc";
import { DowryCalc } from "@/components/calculators/DowryCalc";
import { DiyeCalc } from "@/components/calculators/DiyeCalc";
import { DeadlineCalc } from "@/components/calculators/DeadlineCalc";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const calc = await db.calculator.findUnique({
    where: { slug: decodeURIComponent(slug) },
  });
  if (!calc) return { title: "Not Found" };
  const decodedSlug = decodeURIComponent(slug);
  return {
    title: locale === "fa" ? calc.titleFA : calc.titleEN,
    description: locale === "fa" ? calc.descriptionFA : calc.descriptionEN,
    openGraph: {
      title: locale === "fa" ? calc.titleFA : calc.titleEN,
      description: (locale === "fa" ? calc.descriptionFA : calc.descriptionEN) ?? undefined,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/calculators/${decodedSlug}`,
      languages: {
        fa: `https://www.dadparvaran.com/fa/calculators/${decodedSlug}`,
        en: `https://www.dadparvaran.com/en/calculators/${decodedSlug}`,
        "x-default": `https://www.dadparvaran.com/fa/calculators/${decodedSlug}`,
      },
    },
  };
}

const CALCULATOR_COMPONENTS: Record<string, React.ComponentType<{ isRTL: boolean }>> = {
  "delay-damage": DelayDamageCalc,
  "dowry": DowryCalc,
  "diye": DiyeCalc,
  "deadlines": DeadlineCalc,
};

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "calculators" });
  const decodedSlug = decodeURIComponent(slug);

  const calc = await db.calculator.findUnique({
    where: { slug: decodedSlug },
  });

  if (!calc || !calc.isPublished) notFound();

  const CalcComponent = CALCULATOR_COMPONENTS[decodedSlug];
  if (!CalcComponent) notFound();

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="py-24 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}/calculators`} className="hover:text-primary-600 transition-colors">
            {t("title")}
          </Link>
          <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
          <span className="text-primary-900 font-medium">
            {isRTL ? calc.titleFA : calc.titleEN}
          </span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {isRTL ? calc.titleFA : calc.titleEN}
          </h1>
          {(isRTL ? calc.descriptionFA : calc.descriptionEN) && (
            <p className="mt-3 text-gray-500 max-w-3xl leading-relaxed">
              {isRTL ? calc.descriptionFA : calc.descriptionEN}
            </p>
          )}
        </div>

        {/* Calculator */}
        <CalcComponent isRTL={isRTL} />
      </div>
    </div>
  );
}
