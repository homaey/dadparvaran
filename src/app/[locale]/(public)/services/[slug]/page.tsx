import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Phone, BookOpen } from "lucide-react";
import { servicesData, getServiceBySlug, getChildServices } from "@/lib/services-data";
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from "@/lib/schema";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { db } from "@/lib/db";
import { consultationHref, consultationLinkProps } from "@/lib/consultation-cta";

export async function generateStaticParams() {
  return servicesData.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  const isFA = locale === "fa";
  return {
    title: isFA ? service.metaTitleFA : service.metaTitleEN,
    description: isFA ? service.metaDescFA : service.metaDescEN,
    keywords: isFA ? service.keywordsFA : service.keywordsEN,
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/services/${slug}`,
      languages: { fa: `https://www.dadparvaran.com/fa/services/${slug}`, en: `https://www.dadparvaran.com/en/services/${slug}`, "x-default": `https://www.dadparvaran.com/fa/services/${slug}` },
    },
    openGraph: {
      title: isFA ? service.metaTitleFA : service.metaTitleEN,
      description: isFA ? service.metaDescFA : service.metaDescEN,
      url: `https://www.dadparvaran.com/${locale}/services/${slug}`,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Icon = service.icon;

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "خدمات" : "Services", url: `https://www.dadparvaran.com/${locale}/services` },
    { name: isRTL ? service.titleFA : service.titleEN, url: `https://www.dadparvaran.com/${locale}/services/${slug}` },
  ]);

  const faqs = isRTL ? service.faqsFA : service.faqsEN;
  const faqSchema = getFAQSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const serviceSchema = getServiceSchema({
    name: isRTL ? service.titleFA : service.titleEN,
    description: isRTL ? service.metaDescFA : service.metaDescEN,
    url: `https://www.dadparvaran.com/${locale}/services/${slug}`,
    locale,
  });

  const content = isRTL ? service.contentFA : service.contentEN;
  const points = isRTL ? service.pointsFA : service.pointsEN;

  // شماره واتساپ اولین وکیل فعال برای دکمه‌ی برجسته‌ی هدر
  const firstLawyer = await db.teamMember.findFirst({
    where: { isActive: true, status: "APPROVED", phone: { not: null } },
    orderBy: { order: "asc" },
    select: { phone: true },
  });
  const whatsappHref = toWhatsAppLink(firstLawyer?.phone);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-28 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL ? service.titleFA : service.titleEN}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {isRTL ? service.heroDescFA : service.heroDescEN}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href={consultationHref(locale)}
                {...consultationLinkProps()}
                className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-gold-500/25"
              >
                <Phone className="w-5 h-5" />
                {isRTL ? "مشاوره رایگان" : "Free Consultation"}
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-[#25D366]/25"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  {isRTL ? "مشاوره واتساپ" : "WhatsApp"}
                </a>
              )}
              <Link
                href={`/${locale}/services`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm"
              >
                {isRTL ? "سایر خدمات" : "Other Services"}
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              {content.map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-6 text-base">
                  {p}
                </p>
              ))}
            </div>

            {/* Services list */}
            <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h2 className={`text-2xl font-bold text-primary-900 mb-6 ${isRTL ? "font-fa" : "font-serif"}`}>
                {isRTL ? "خدمات تخصصی ما در این حوزه" : "Our Specialized Services"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {points.map((point) => (
                  <div key={point} className="flex items-center gap-3 py-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* لینک داخلی به مقالهٔ پشتیبان مرتبط */}
            {service.relatedArticleSlug && service.relatedArticleTitle && (
              <div className="mt-8">
                <Link
                  href={`/${locale}/articles/${service.relatedArticleSlug}`}
                  className="flex items-center gap-3 p-5 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 hover:border-primary-300 transition-all shadow-sm group"
                >
                  <BookOpen className="w-5 h-5 text-primary-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-primary-700 text-sm font-semibold">
                    {isRTL ? "مقالهٔ مرتبط: " : "Related article: "}{service.relatedArticleTitle}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold text-primary-900 mb-3 text-center ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL ? "سؤالات متداول" : "Frequently Asked Questions"}
            </h2>
            <p className="text-gray-500 text-center mb-12">
              {isRTL ? "پاسخ سؤالات رایج در این حوزه تخصصی" : "Answers to common questions in this specialty"}
            </p>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-primary-900 text-sm sm:text-base">{faq.q}</h3>
                    <span className="text-primary-600 group-open:rotate-180 transition-transform shrink-0 ms-4">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related services — children if parent page, siblings if sub-page */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-2xl font-bold text-primary-900 mb-8 text-center ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL
                ? service.parentSlug ? "خدمات مرتبط" : "زیرمجموعه‌های این خدمت"
                : service.parentSlug ? "Related Services" : "Sub-Services"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const children = service.parentSlug
                  ? servicesData.filter((s) => s.parentSlug === service.parentSlug && s.slug !== slug)
                  : getChildServices(slug);
                const related = children.length > 0
                  ? children.slice(0, 6)
                  : servicesData.filter((s) => s.slug !== slug && !s.parentSlug).slice(0, 3);
                return related.map((s) => {
                  const SIcon = s.icon;
                  return (
                    <Link
                      key={s.slug}
                      href={`/${locale}/services/${s.slug}`}
                      className="group flex items-start gap-4 bg-gray-50 hover:bg-primary-50 rounded-xl p-5 transition-colors border border-gray-100 hover:border-primary-200"
                    >
                      <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-700 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                        <SIcon className="w-6 h-6 text-primary-700 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary-900 text-sm mb-1">
                          {isRTL ? s.titleFA : s.titleEN}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-2">
                          {isRTL ? s.heroDescFA : s.heroDescEN}
                        </p>
                      </div>
                    </Link>
                  );
                });
              })()}
            </div>
          </div>
        </section>

        <ContactLawyersCTA />
      </div>
    </>
  );
}
