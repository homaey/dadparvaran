import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Clock, ArrowLeft, ArrowRight, User, BookOpen } from "lucide-react";

type ArticleData = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  readTimeMin: number;
  publishedAt: string | null;
  author: {
    nameFA: string;
    nameEN: string;
    photoUrl: string | null;
  };
  category: {
    id: string;
    nameFA: string;
    nameEN: string;
  } | null;
};

export default function ArticlesSection({
  articles,
}: {
  articles?: ArticleData[];
}) {
  const t = useTranslations("articles");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const items = articles?.slice(0, 4) ?? [];
  if (items.length === 0) return null;

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <section className="py-24 bg-white" dir={isRTL ? "rtl" : "ltr"} id="articles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
          <div>
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              {isRTL ? "دانش حقوقی" : "Legal Knowledge"}
            </span>
            <h2
              className={`mt-3 text-3xl sm:text-4xl font-bold text-primary-900 ${isRTL ? "font-fa" : "font-serif"}`}
            >
              {t("title")}
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl">{t("subtitle")}</p>
          </div>
          <Link
            href={`/${locale}/articles`}
            className="flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium transition-colors"
          >
            {isRTL ? "مشاهده همه مقالات" : "View All Articles"}
            <Arrow className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Article — large card */}
          <Link
            href={`/${locale}/articles/${featured.slug}`}
            className="group rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-primary-50/30"
          >
            <div className="p-8 flex flex-col justify-between h-full min-h-[320px]">
              {featured.category && (
                <span className="self-start bg-gold-500 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                  {isRTL ? featured.category.nameFA : featured.category.nameEN}
                </span>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <h3
                  className={`text-xl sm:text-2xl font-bold text-primary-900 mb-4 leading-relaxed group-hover:text-primary-700 transition-colors ${isRTL ? "font-fa" : ""}`}
                >
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6">
                    {featured.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {featured.author.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featured.author.photoUrl}
                        alt={isRTL ? featured.author.nameFA : featured.author.nameEN}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {isRTL ? featured.author.nameFA : featured.author.nameEN}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readTimeMin} {t("minRead")}
                </div>
              </div>
            </div>
          </Link>

          {/* Smaller articles list */}
          <div className="flex flex-col gap-4">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/articles/${article.slug}`}
                className="group flex gap-5 p-5 rounded-2xl border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold text-primary-900 mb-1.5 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2 ${isRTL ? "font-fa" : ""}`}
                  >
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-1 mb-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">
                      {isRTL ? article.author.nameFA : article.author.nameEN}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTimeMin} {t("minRead")}
                    </span>
                  </div>
                </div>
                <Arrow className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors self-center shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
