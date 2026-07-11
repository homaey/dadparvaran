import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Clock, Tag, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { getBreadcrumbSchema } from "@/lib/schema";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.articles" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/articles`,
      languages: { fa: "https://www.dadparvaran.com/fa/articles", en: "https://www.dadparvaran.com/en/articles" },
    },
  };
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      author: true,
      category: { select: { nameFA: true, nameEN: true } },
    },
  });

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "مقالات" : "Articles", url: `https://www.dadparvaran.com/${locale}/articles` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-32 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              {isRTL ? "دانش حقوقی" : "Legal Knowledge"}
            </span>
            <h1 className={`mt-3 text-4xl sm:text-5xl font-bold mb-4 ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL ? "مقالات حقوقی" : "Legal Articles"}
            </h1>
            <p className="text-gray-300 text-lg">
              {isRTL
                ? "آخرین راهنماها و تحلیل‌های حقوقی توسط وکلای متخصص"
                : "Latest legal guides and analyses by our expert lawyers"}
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {articles.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">{isRTL ? "هنوز مقاله‌ای منتشر نشده" : "No articles published yet"}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="group rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="h-48 bg-gradient-to-br from-primary-800 to-primary-600 relative flex items-center justify-center">
                      {article.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={article.coverImage} alt={article.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-white/30" />
                      )}
                      {article.category && (
                        <div className="absolute top-4 end-4">
                          <span className="bg-gold-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                            {isRTL ? article.category.nameFA : article.category.nameEN}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {article.readTimeMin} {isRTL ? "دقیقه" : "min read"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {article.author.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={article.author.photoUrl} alt={isRTL ? article.author.nameFA : article.author.nameEN} loading="lazy" decoding="async" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700">
                              {(isRTL ? article.author.nameFA : article.author.nameEN).charAt(0)}
                            </div>
                          )}
                          {isRTL ? article.author.nameFA : article.author.nameEN}
                        </div>
                      </div>

                      <h2 className={`font-bold text-primary-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2 ${isRTL ? "font-fa" : ""}`}>
                        {article.title}
                      </h2>

                      {article.excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                          {article.excerpt}
                        </p>
                      )}

                      <Link
                        href={`/${locale}/articles/${article.slug}`}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium group/link mt-auto"
                      >
                        {isRTL ? "ادامه مطلب" : "Read More"}
                        <Arrow className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <ContactLawyersCTA />
      </div>
    </>
  );
}
