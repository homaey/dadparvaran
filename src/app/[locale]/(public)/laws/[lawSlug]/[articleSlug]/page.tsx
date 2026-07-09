import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Gavel, Tag as TagIcon, Users } from "lucide-react";
import { getAdjacentArticles, getLegalArticleBySlug, getTagsForLegalNode } from "@/lib/laws";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { toPersianDigits } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; lawSlug: string; articleSlug: string }>;
}): Promise<Metadata> {
  const { locale, lawSlug, articleSlug } = await params;
  const decodedLaw = decodeURIComponent(lawSlug);
  const decodedArticle = decodeURIComponent(articleSlug);
  const article = await getLegalArticleBySlug(decodedLaw, decodedArticle);
  if (!article) return { title: "Not Found" };

  return {
    title: article.title,
    description: `${article.title} — متن و تفسیر ماده قانونی`,
    openGraph: {
      title: article.title,
      type: "article",
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/laws/${decodedLaw}/${decodedArticle}`,
      languages: {
        fa: `https://www.dadparvaran.com/fa/laws/${decodedLaw}/${decodedArticle}`,
        en: `https://www.dadparvaran.com/en/laws/${decodedLaw}/${decodedArticle}`,
      },
    },
  };
}

export default async function LegalArticlePage({
  params,
}: {
  params: Promise<{ locale: string; lawSlug: string; articleSlug: string }>;
}) {
  const { locale, lawSlug, articleSlug } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "laws" });

  const decodedLawSlug = decodeURIComponent(lawSlug);
  const decodedArticleSlug = decodeURIComponent(articleSlug);

  const article = await getLegalArticleBySlug(decodedLawSlug, decodedArticleSlug);
  if (!article) notFound();

  const tags = await getTagsForLegalNode(article.id);
  const { prev, next } = article.lawId
    ? await getAdjacentArticles(article.lawId, article.orderIndex, article.parentId)
    : { prev: null, next: null };
  const tagIds = tags.map((tag) => tag.id);

  let relatedTeamMembers: any[] = [];
  if (tagIds.length > 0) {
    const teamTaggables = await db.taggable.findMany({
      where: { taggableType: "TEAM_MEMBER", tagId: { in: tagIds } },
    });
    const memberIds = [...new Set(teamTaggables.map((taggable) => taggable.taggableId))];
    if (memberIds.length > 0) {
      relatedTeamMembers = await db.teamMember.findMany({
        where: { id: { in: memberIds }, isActive: true },
      });
    }
  }

  return (
    <div dir="rtl" className="py-24 min-h-screen font-fa">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap text-right">
          <Link href={`/${locale}/laws`} className="hover:text-primary-600 transition-colors">
            {t("title")}
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <Link href={`/${locale}/laws/${decodedLawSlug}`} className="hover:text-primary-600 transition-colors">
            <span className="font-fa">{toPersianDigits(article.parent?.title ?? decodedLawSlug)}</span>
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-primary-900 font-medium">
            {article.articleNumber ? `ماده ${toPersianDigits(article.articleNumber)}` : toPersianDigits(article.title)}
          </span>
        </nav>

        <article dir="rtl" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-right font-fa">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-900 mb-6 font-fa">
            {toPersianDigits(article.title)}
          </h1>

          {article.content && (
            <div className="prose prose-lg max-w-none text-gray-700 leading-[1.9] font-fa" style={{ maxWidth: "65ch" }}>
              <p className="whitespace-pre-wrap">{toPersianDigits(article.content)}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <TagIcon className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-medium text-gray-700">
                  {isRTL ? "موضوعات مرتبط" : "Related Topics"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/${locale}/tags/${tag.slug}`}
                    className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {isRTL ? tag.nameFA : tag.nameEN}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(prev || next) && (
            <nav
              aria-label="پیمایش بین مواد قانون"
              className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100"
            >
              <div className="text-right">
                {prev && (
                  <Link
                    href={`/${locale}/laws/${decodedLawSlug}/${prev.slug}`}
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-fa"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>قبلی</span>
                  </Link>
                )}
              </div>
              <div className="text-left">
                {next && (
                  <Link
                    href={`/${locale}/laws/${decodedLawSlug}/${next.slug}`}
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-fa"
                  >
                    <span>بعدی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </nav>
          )}
        </article>

        {article.relatedRulings.length > 0 && (
          <div dir="rtl" className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-right font-fa">
            <div className="flex items-center gap-2 mb-6">
              <Gavel className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-primary-900 font-fa-display">
                {t("relatedRulings")}
              </h2>
            </div>
            <div className="space-y-4">
              {article.relatedRulings.map(({ ruling }) => (
                <div key={ruling.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="bg-gold-50 text-gold-700 px-2 py-0.5 rounded text-xs font-medium">
                      {ruling.kind}
                    </span>
                    <span>شماره {toPersianDigits(ruling.number)}</span>
                    <span>— {toPersianDigits(ruling.date)}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed font-fa">{toPersianDigits(ruling.summary)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedTeamMembers.length > 0 && (
          <div dir="rtl" className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-right font-fa">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-primary-900 font-fa-display">
                {t("relatedExperts")}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedTeamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/${locale}/team/${member.slug}`}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                    {(isRTL ? member.nameFA : member.nameEN).charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-primary-900">
                      {isRTL ? member.nameFA : member.nameEN}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isRTL ? member.roleFA : member.roleEN}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
