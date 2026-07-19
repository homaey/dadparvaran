import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { getBreadcrumbSchema } from "@/lib/schema";
import { getServiceCategories, type ServiceCategory } from "@/lib/services-data";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFA = locale === "fa";
  return {
    title: isFA ? "خدمات حقوقی تخصصی | وکیل پایه یک دادگستری | دادپروران مهر ایران" : "Specialized Legal Services | Licensed Bar Attorney | Dadparvaraan Mehr Iran",
    description: isFA
      ? "خدمات جامع حقوقی: وکالت دعاوی حقوقی، کیفری، خانوادگی، تجاری، ملکی و تنظیم اوراق قضایی. مشاوره رایگان با وکیل پایه یک."
      : "Comprehensive legal services: civil, criminal, family, commercial, property litigation and legal document preparation. Free consultation.",
    keywords: isFA
      ? ["خدمات حقوقی", "وکیل", "وکیل پایه یک", "مشاوره حقوقی", "وکالت", "دعاوی حقوقی", "دعاوی کیفری", "وکیل خانواده"]
      : ["legal services", "lawyer", "attorney", "legal consultation", "civil litigation", "criminal defense", "family lawyer"],
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/services`,
      languages: { fa: "https://www.dadparvaran.com/fa/services", en: "https://www.dadparvaran.com/en/services", "x-default": "https://www.dadparvaran.com/fa/services" },
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "خدمات" : "Services", url: `https://www.dadparvaran.com/${locale}/services` },
  ]);

  const categories = getServiceCategories();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-32 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              {isRTL ? "خدمات ما" : "Our Services"}
            </span>
            <h1 className={`mt-3 text-4xl sm:text-5xl font-bold mb-4 ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL ? "خدمات حقوقی تخصصی" : "Specialized Legal Services"}
            </h1>
            <p className="text-gray-300 text-lg">
              {isRTL
                ? "جامع‌ترین خدمات حقوقی با بهترین وکلای متخصص"
                : "Most comprehensive legal services with the best specialist lawyers"}
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {categories.map((cat: ServiceCategory) => {
              const ParentIcon = cat.parent.icon;
              return (
                <div key={cat.parent.slug}>
                  {/* Parent category header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                      <ParentIcon className="w-7 h-7 text-primary-700" />
                    </div>
                    <div>
                      <Link
                        href={`/${locale}/services/${cat.parent.slug}`}
                        className="group flex items-center gap-2"
                      >
                        <h2 className={`text-2xl font-bold text-primary-900 group-hover:text-primary-700 transition-colors ${isRTL ? "font-fa" : "font-serif"}`}>
                          {isRTL ? cat.parent.titleFA : cat.parent.titleEN}
                        </h2>
                        <Arrow className="w-5 h-5 text-primary-400 group-hover:text-primary-700 transition-colors" />
                      </Link>
                      <p className="text-gray-500 text-sm mt-1">
                        {isRTL ? cat.parent.heroDescFA : cat.parent.heroDescEN}
                      </p>
                    </div>
                  </div>

                  {/* Children grid */}
                  {cat.children.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ps-4 border-s-2 border-primary-100">
                      {cat.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.slug}
                            href={`/${locale}/services/${child.slug}`}
                            className="group bg-gray-50 hover:bg-primary-50 rounded-xl p-6 border border-gray-100 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-white group-hover:bg-primary-700 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-sm">
                                <ChildIcon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                              </div>
                              <h3 className={`font-bold text-primary-900 text-sm pt-2 ${isRTL ? "font-fa" : ""}`}>
                                {isRTL ? child.titleFA : child.titleEN}
                              </h3>
                            </div>
                            <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                              {isRTL ? child.heroDescFA : child.heroDescEN}
                            </p>
                            <ul className="space-y-1.5">
                              {(isRTL ? child.pointsFA : child.pointsEN).slice(0, 3).map((p) => (
                                <li key={p} className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                            <span className="mt-4 flex items-center gap-1 text-primary-600 text-xs font-medium group-hover:text-primary-800">
                              {isRTL ? "اطلاعات بیشتر" : "Learn More"}
                              <Chevron className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ps-4 border-s-2 border-primary-100">
                      <Link
                        href={`/${locale}/services/${cat.parent.slug}`}
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        {isRTL ? "مشاهده جزئیات" : "View Details"}
                        <Arrow className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <ContactLawyersCTA />
      </div>
    </>
  );
}
