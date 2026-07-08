import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Landmark, BookOpen, Users, Tag as TagIcon } from "lucide-react";
import { getTagBySlug, getItemsByTag } from "@/lib/tags";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tagSlug: string }>;
}): Promise<Metadata> {
  const { locale, tagSlug } = await params;
  const tag = await getTagBySlug(decodeURIComponent(tagSlug));
  if (!tag) return { title: "Not Found" };
  const decodedSlug = decodeURIComponent(tagSlug);
  const name = locale === "fa" ? tag.nameFA : tag.nameEN;
  return {
    title: `${name} — ${locale === "fa" ? "موضوعات" : "Topics"}`,
    description: tag.description ?? (locale === "fa" ? `مطالب مرتبط با ${name}` : `Content related to ${name}`),
    openGraph: {
      title: name,
      description: tag.description ?? undefined,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/tags/${decodedSlug}`,
      languages: {
        fa: `https://www.dadparvaran.com/fa/tags/${decodedSlug}`,
        en: `https://www.dadparvaran.com/en/tags/${decodedSlug}`,
      },
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: string; tagSlug: string }>;
}) {
  const { locale, tagSlug } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "tags" });

  const tag = await getTagBySlug(decodeURIComponent(tagSlug));
  if (!tag) notFound();

  const { legalNodes, teamMembers, articles } = await getItemsByTag(tag.id);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="py-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full mb-4">
            <TagIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{t("title")}</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
            {isRTL ? tag.nameFA : tag.nameEN}
          </h1>
          {tag.description && (
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{tag.description}</p>
          )}
        </div>

        {/* Legal Nodes */}
        {legalNodes.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-primary-900">{t("relatedLaws")}</h2>
            </div>
            <div className="space-y-3">
              {legalNodes.map((node) => (
                <Link
                  key={node.id}
                  href={`/${locale}/laws/${node.slug}`}
                  className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <h3 className="font-medium text-primary-900">{node.title}</h3>
                  {node.adoptionDate && (
                    <p className="text-sm text-gray-500 mt-1">{node.adoptionDate}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-primary-900">{t("relatedArticles")}</h2>
            </div>
            <div className="space-y-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${locale}/articles/${article.slug}`}
                  className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <h3 className="font-medium text-primary-900">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-primary-900">{t("relatedTeam")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/${locale}/team/${member.slug}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                    {(isRTL ? member.nameFA : member.nameEN).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-900">
                      {isRTL ? member.nameFA : member.nameEN}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isRTL ? member.roleFA : member.roleEN}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {legalNodes.length === 0 && articles.length === 0 && teamMembers.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            {isRTL ? "هنوز محتوایی با این تگ ثبت نشده است." : "No content with this tag yet."}
          </div>
        )}
      </div>
    </div>
  );
}
