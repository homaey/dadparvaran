import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Tag, Calendar, ChevronRight, ChevronLeft, Eye, BookOpen, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getArticleSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getTagsForArticle } from "@/lib/team";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: true },
  });
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.coverImage ? [article.coverImage] : ["/og-image.jpg"],
      type: "article",
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/articles/${slug}`,
      languages: {
        fa: `https://www.dadparvaran.com/fa/articles/${slug}`,
        en: `https://www.dadparvaran.com/en/articles/${slug}`,
      },
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronRight : ChevronLeft;

  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: true,
      category: { select: { nameFA: true, nameEN: true } },
    },
  });

  if (!article) notFound();

  db.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const tags = await getTagsForArticle(article.id);

  const related = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      ...(article.categoryId ? { categoryId: article.categoryId } : {}),
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, readTimeMin: true },
  });

  const articleSchema = getArticleSchema({
    title: article.title,
    description: article.excerpt ?? "",
    author: isRTL ? article.author.nameFA : article.author.nameEN,
    publishedAt: article.publishedAt?.toISOString() ?? article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `https://www.dadparvaran.com/${locale}/articles/${slug}`,
    image: article.coverImage ?? undefined,
  });

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "مقالات" : "Articles", url: `https://www.dadparvaran.com/${locale}/articles` },
    { name: article.title, url: `https://www.dadparvaran.com/${locale}/articles/${slug}` },
  ]);

  const blocks: any[] = JSON.parse(article.blocks || "[]");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 pt-32 pb-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}/articles`}
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
            >
              <Arrow className="w-4 h-4" />
              {isRTL ? "بازگشت به مقالات" : "Back to Articles"}
            </Link>

            {article.category && (
              <span className="inline-block bg-gold-500/20 text-gold-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {isRTL ? article.category.nameFA : article.category.nameEN}
              </span>
            )}

            <h1 className={`text-3xl sm:text-4xl font-bold mb-6 leading-tight ${isRTL ? "font-fa" : "font-serif"}`}>
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                {article.author.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.author.photoUrl} alt={isRTL ? article.author.nameFA : article.author.nameEN} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {(isRTL ? article.author.nameFA : article.author.nameEN).charAt(0)}
                  </div>
                )}
                <span>{isRTL ? article.author.nameFA : article.author.nameEN}</span>
              </div>
              {article.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publishedAt).toLocaleDateString(isRTL ? "fa-IR" : "en-US", { dateStyle: "long" })}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readTimeMin} {isRTL ? "دقیقه مطالعه" : "min read"}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {article.viewCount.toLocaleString(isRTL ? "fa-IR" : "en-US")} {isRTL ? "بازدید" : "views"}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {article.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-72 object-cover rounded-2xl mb-8"
                />
              )}

              {article.excerpt && (
                <p className="text-lg text-gray-600 leading-8 mb-10 font-medium border-s-4 border-gold-500 ps-5 py-1">
                  {article.excerpt}
                </p>
              )}

              <div className="space-y-7 max-w-prose">
                {blocks.map((block, idx) => {
                  switch (block.type) {
                    case "paragraph":
                      return (
                        <p key={idx} className="text-gray-700 leading-[1.9] text-[15px]">
                          {block.content}
                        </p>
                      );
                    case "heading":
                      return (
                        <h2 key={idx} className="text-2xl font-bold text-primary-900 mt-10 mb-4 pb-2 border-b border-gray-100">
                          {block.content}
                        </h2>
                      );
                    case "faq":
                      return (
                        <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                          {(block.items || []).map((item: any, i: number) => (
                            <details key={i} className="group">
                              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-primary-50/50 transition-colors font-semibold text-primary-900 text-[15px]">
                                {item.q}
                                <span className="text-primary-400 group-open:rotate-180 transition-transform text-xs shrink-0">&#9660;</span>
                              </summary>
                              <div className="px-5 pb-5 text-gray-600 leading-7 text-[14px]">
                                {item.a}
                              </div>
                            </details>
                          ))}
                        </div>
                      );
                    case "callout":
                      const calloutStyles = {
                        warning: "bg-amber-50 border-amber-400 text-amber-900",
                        info: "bg-blue-50 border-blue-400 text-blue-900",
                        tip: "bg-emerald-50 border-emerald-400 text-emerald-900",
                        danger: "bg-red-50 border-red-400 text-red-900",
                      };
                      const variant = (block.variant as keyof typeof calloutStyles) || "info";
                      return (
                        <div key={idx} className={`border-s-4 rounded-xl px-5 py-4 ${calloutStyles[variant] || calloutStyles.info}`}>
                          {block.title && <p className="font-bold mb-1.5 text-[15px]">{block.title}</p>}
                          <p className="text-sm leading-7">{block.content}</p>
                        </div>
                      );
                    case "steps":
                      return (
                        <ol key={idx} className="space-y-5 bg-gray-50/70 rounded-2xl p-6">
                          {(block.items || []).map((step: string, i: number) => (
                            <li key={i} className="flex gap-4 items-start">
                              <span className="w-9 h-9 bg-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                {i + 1}
                              </span>
                              <p className="text-gray-700 leading-7 text-[15px] pt-1.5">{step}</p>
                            </li>
                          ))}
                        </ol>
                      );
                    case "figure":
                      return (
                        <figure key={idx} className="my-8">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={block.src} alt={block.alt || ""} loading="lazy" decoding="async" className="w-full rounded-2xl shadow-sm" />
                          {block.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-3 italic">{block.caption}</figcaption>
                          )}
                        </figure>
                      );
                    case "legal_ref":
                      return (
                        <Link
                          key={idx}
                          href={`/${locale}/laws/${block.lawSlug}/${block.articleSlug}`}
                          className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 hover:border-primary-300 transition-all shadow-sm group"
                        >
                          <BookOpen className="w-5 h-5 text-primary-600 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-primary-700 text-sm font-semibold">{block.text}</span>
                        </Link>
                      );
                    default:
                      return null;
                  }
                })}
              </div>

              {tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/${locale}/tags/${tag.slug}`}
                      className="bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                    >
                      {isRTL ? tag.nameFA : tag.nameEN}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">{isRTL ? "نویسنده" : "Author"}</h3>
                <div className="flex items-center gap-3 mb-3">
                  {article.author.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.author.photoUrl} alt={isRTL ? article.author.nameFA : article.author.nameEN} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(isRTL ? article.author.nameFA : article.author.nameEN).charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{isRTL ? article.author.nameFA : article.author.nameEN}</p>
                    <p className="text-xs text-gray-500">{isRTL ? article.author.roleFA : article.author.roleEN}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {article.author.phone && (
                    <a
                      href={`tel:${article.author.phone}`}
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2.5 rounded-xl transition-colors font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {isRTL ? "تماس با وکیل" : "Call Lawyer"}
                    </a>
                  )}
                  <Link
                    href={`/${locale}/lawyers/${article.authorId}`}
                    className="w-full flex items-center justify-center gap-1.5 border border-primary-200 hover:bg-primary-50 text-primary-700 text-xs px-4 py-2 rounded-xl transition-colors font-medium"
                  >
                    {isRTL ? "مشاهده پروفایل" : "View Profile"}
                  </Link>
                </div>
              </div>

              {related.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">{isRTL ? "مقالات مرتبط" : "Related Articles"}</h3>
                  <div className="space-y-3">
                    {related.map((r) => (
                      <Link
                        key={r.id}
                        href={`/${locale}/articles/${r.slug}`}
                        className="flex gap-2 group"
                      >
                        <BookOpen className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700 group-hover:text-primary-700 line-clamp-2 transition-colors leading-snug">
                            {r.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.readTimeMin} {isRTL ? "دقیقه" : "min"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <ContactLawyersCTA variant="compact" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
