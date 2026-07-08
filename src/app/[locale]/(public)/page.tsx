import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import LawyersSection from "@/components/sections/LawyersSection";
import ArticlesSection from "@/components/sections/ArticlesSection";
import LawyerCTASection from "@/components/sections/LawyerCTASection";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";
import FAQSection from "@/components/sections/FAQSection";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/schema";
import { faqs } from "@/lib/data";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: ["/og-image.jpg"],
      type: "website",
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}`,
      languages: { fa: "https://www.dadparvaran.com/fa", en: "https://www.dadparvaran.com/en" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [teamMembers, latestArticles] = await Promise.all([
    db.teamMember.findMany({
      where: { isActive: true, status: "APPROVED" },
      orderBy: { order: "asc" },
      select: { id: true, nameFA: true, nameEN: true, roleFA: true, roleEN: true, photoUrl: true, phone: true, experience: true },
    }),
    db.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        readTimeMin: true,
        publishedAt: true,
        author: { select: { nameFA: true, nameEN: true, photoUrl: true } },
        category: { select: { id: true, nameFA: true, nameEN: true } },
      },
    }),
  ]);

  const articlesData = latestArticles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt?.toISOString() ?? null,
  }));

  const faqSchema = getFAQSchema(
    faqs.map((f) => ({
      question: locale === "fa" ? f.questionFA : f.questionEN,
      answer: locale === "fa" ? f.answerFA : f.answerEN,
    }))
  );

  const breadcrumb = getBreadcrumbSchema([
    { name: locale === "fa" ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Hero locale={locale} />
      <Services />
      <LawyersSection members={teamMembers} />
      <ArticlesSection articles={articlesData} />
      <ContactLawyersCTA />
      <LawyerCTASection />
      <FAQSection />
    </>
  );
}
