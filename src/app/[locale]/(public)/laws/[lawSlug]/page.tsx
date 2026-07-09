import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, Building2 } from "lucide-react";
import { getLawBySlug, getLawTree, getTagsForLegalNode } from "@/lib/laws";
import type { Metadata } from "next";
import { toPersianDigits } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; lawSlug: string }>;
}): Promise<Metadata> {
  const { locale, lawSlug } = await params;
  const slug = decodeURIComponent(lawSlug);
  const law = await getLawBySlug(slug);
  if (!law) return { title: "Not Found" };
  const isFA = locale === "fa";
  return {
    title: law.title,
    description: isFA
      ? `متن کامل ${law.title} با ساختار درختی — دادپروران مهر ایران`
      : `Full text of ${law.title} with tree structure — Dadparvaraan Mehr Iran`,
    openGraph: {
      title: law.title,
      type: "article",
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/laws/${slug}`,
      languages: {
        fa: `https://www.dadparvaran.com/fa/laws/${slug}`,
        en: `https://www.dadparvaran.com/en/laws/${slug}`,
      },
    },
  };
}

export default async function LawDetailPage({
  params,
}: {
  params: Promise<{ locale: string; lawSlug: string }>;
}) {
  const { locale, lawSlug } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "laws" });
  const decodedSlug = decodeURIComponent(lawSlug);

  const law = await getLawBySlug(decodedSlug);
  if (!law) notFound();

  const tree = await getLawTree(law.id);
  const tags = await getTagsForLegalNode(law.id);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href={`/${locale}/laws`} className="hover:text-primary-600 transition-colors">
            {t("title")}
          </Link>
          <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
          <span className="text-primary-900 font-medium font-fa">{toPersianDigits(law.title)}</span>
        </nav>

        {/* Header */}
        <div dir="rtl" className="bg-white border border-gray-200 px-6 sm:px-8 py-6 font-fa">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-4 font-fa-display">
            {toPersianDigits(law.title)}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {law.adoptionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span>{t("adoptionDate")}: {toPersianDigits(law.adoptionDate)}</span>
              </div>
            )}
            {law.adoptionAuthority && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold-500" />
                <span>{t("adoptionAuthority")}: {law.adoptionAuthority}</span>
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/${locale}/tags/${tag.slug}`}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
                >
                  {isRTL ? tag.nameFA : tag.nameEN}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Full law text */}
        <div dir="rtl" className="bg-white border-x border-b border-gray-200 px-6 sm:px-8 font-fa">
          {(() => {
            const sections = tree.filter((n) => n.type === "SECTION");
            const directArticles = tree.filter((n) => n.type === "ARTICLE");

            const renderArticleLink = (article: (typeof tree)[number]) => (
              <section
                key={article.id}
                id={article.slug}
                className="py-5 border-b border-gray-200 last:border-b-0"
              >
                <Link
                  href={`/${locale}/laws/${decodedSlug}/${article.slug}`}
                  className="inline-block text-primary-600 hover:text-primary-800 font-semibold mb-3"
                >
                    {toPersianDigits(article.title)}
                </Link>
                {article.content && (
                  <p className="whitespace-pre-wrap text-gray-900 text-base sm:text-lg leading-[2.15] text-justify">
                    {toPersianDigits(article.content)}
                  </p>
                )}
              </section>
            );

            const renderSection = (section: (typeof tree)[number]) => (
              <section key={section.id}>
                <div className="py-5 border-b border-gray-200">
                  <h2 className="text-primary-600 text-lg sm:text-xl font-semibold font-fa-display">
                    {toPersianDigits(section.title)}
                  </h2>
                  {section.content && (
                    <p className="mt-3 whitespace-pre-wrap text-gray-900 text-base sm:text-lg leading-[2.15] text-justify">
                      {toPersianDigits(section.content)}
                    </p>
                  )}
                </div>
                <div>
                  {section.children.map((child) =>
                    child.type === "SECTION" ? renderSection(child) : renderArticleLink(child)
                  )}
                </div>
              </section>
            );

            return (
              <>
                {directArticles.length > 0 && (
                  <div>{directArticles.map(renderArticleLink)}</div>
                )}
                {sections.map(renderSection)}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
