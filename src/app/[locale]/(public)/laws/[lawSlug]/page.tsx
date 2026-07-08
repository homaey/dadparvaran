import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, Building2, BookOpen } from "lucide-react";
import { getLawBySlug, getLawTree, getTagsForLegalNode } from "@/lib/laws";
import type { Metadata } from "next";

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href={`/${locale}/laws`} className="hover:text-primary-600 transition-colors">
            {t("title")}
          </Link>
          <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
          <span className="text-primary-900 font-medium">{law.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold text-primary-900 mb-4 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {law.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {law.adoptionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span>{t("adoptionDate")}: {law.adoptionDate}</span>
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

        {/* Tree */}
        <div className="space-y-4">
          {(() => {
            const sections = tree.filter((n) => n.type === "SECTION");
            const directArticles = tree.filter((n) => n.type === "ARTICLE");

            const renderArticleLink = (article: (typeof tree)[number]) => (
              <Link
                key={article.id}
                href={`/${locale}/laws/${decodedSlug}/${article.slug}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="w-4 h-4 text-gold-500 shrink-0" />
                  <span className="text-gray-800 group-hover:text-primary-700 transition-colors">
                    {article.title}
                  </span>
                </div>
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-primary-600 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 shrink-0" />
                )}
              </Link>
            );

            const renderSection = (section: (typeof tree)[number]) => (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-primary-50 px-6 py-4 border-b border-gray-100">
                  <h2 className={`font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
                    {section.title}
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {section.children.map((child) =>
                    child.type === "SECTION" ? renderSection(child) : renderArticleLink(child)
                  )}
                </div>
              </div>
            );

            return (
              <>
                {directArticles.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      {directArticles.map(renderArticleLink)}
                    </div>
                  </div>
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
