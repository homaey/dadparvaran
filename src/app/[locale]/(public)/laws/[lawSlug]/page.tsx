import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, Building2 } from "lucide-react";
import { getLawBySlug, getLawTree, getTagsForLegalNode } from "@/lib/laws";
import type { Metadata } from "next";
import { toPersianDigits } from "@/lib/utils";
import LawTreeClient from "./LawTreeClient";
import { alternatesMetadata, shouldNoindexEnglish } from "@/lib/i18n-pages";

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
    alternates: alternatesMetadata(locale, `/laws/${slug}`),
    ...(shouldNoindexEnglish(locale, `/laws/${slug}`) && {
      robots: { index: false, follow: true },
    }),
  };
}

interface TreeNode {
  id: number;
  type: string;
  title: string;
  slug: string;
  articleNumber: string | null;
  content: string | null;
  children: TreeNode[];
}

function flattenTree(nodes: TreeNode[]): { sections: any[]; articles: any[] } {
  const sections: { id: number; title: string; depth: number; articleCount: number }[] = [];
  const articles: { id: number; title: string; slug: string; content: string | null; sectionId: number; articleNumber: string | null }[] = [];

  function walk(nodes: TreeNode[], depth: number, parentSectionId: number) {
    for (const node of nodes) {
      if (node.type === "SECTION") {
        const sectionId = node.id;
        let articleCount = 0;
        function countArticles(n: TreeNode): number {
          let c = 0;
          for (const child of n.children) {
            if (child.type === "ARTICLE") c++;
            else c += countArticles(child);
          }
          return c;
        }
        articleCount = countArticles(node);

        sections.push({ id: sectionId, title: node.title, depth, articleCount });
        walk(node.children, depth + 1, sectionId);
      } else if (node.type === "ARTICLE") {
        articles.push({
          id: node.id,
          title: node.title,
          slug: node.slug,
          content: node.content,
          sectionId: parentSectionId,
          articleNumber: node.articleNumber,
        });
      }
    }
  }

  walk(nodes, 0, 0);
  return { sections, articles };
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

  const tree = await getLawTree(law.id) as TreeNode[];
  const tags = await getTagsForLegalNode(law.id);
  const { sections, articles } = flattenTree(tree);

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
        <div dir="rtl" className="bg-white border border-gray-200 px-6 sm:px-8 py-6 font-fa rounded-t-2xl">
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
            <div className="flex items-center gap-2 text-primary-600 font-medium">
              {toPersianDigits(`${articles.length} ماده`)}
            </div>
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

        {/* Client-side interactive law tree */}
        <LawTreeClient
          sections={sections}
          articles={articles}
          lawSlug={decodedSlug}
          locale={locale}
        />
      </div>
    </div>
  );
}
