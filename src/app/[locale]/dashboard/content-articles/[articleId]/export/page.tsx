import { Roles } from "@/lib/roles";
import { notFound } from "next/navigation";

import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildArticleExport } from "@/modules/article-export/serializer";
import { createPersianSlug } from "@/modules/article-export/contract";
import ExportEditor from "./export-editor";

export default async function ExportPage({ params }: { params: Promise<{ articleId: string }> }) {
  const user = await requireUser();
  if (!user) notFound();
  const t = await getTranslations("content.contentArticles");
  const articleId = Number((await params).articleId);
  const article = await db.contentArticle.findUnique({
    where: { id: articleId },
    include: { task: { include: { calendarItem: { include: { contentPlan: true } } } }, exportProfile: true, qualityReviews: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!article?.task?.calendarItem || (user.role !== Roles.ADMIN && article.task.assigneeId !== user.userId && article.task.reviewerId !== user.userId)) notFound();
  let preview: null | Awaited<ReturnType<typeof buildArticleExport>> = null;
  let error = "";
  try { preview = await buildArticleExport(articleId); } catch (e) { error = e instanceof Error ? e.message : "خروجی آماده نیست"; }
  const item = article.task.calendarItem;
  const review = article.qualityReviews[0];
  const profile = article.exportProfile;
  const profileKeywords: string[] = profile ? JSON.parse(profile.keywords) : [];
  return (
    <>
      <header className="mb-8">
        <h1 className="font-fa-display text-2xl font-bold text-navy-900">{t("title")}</h1>
        <p className="mt-1 text-gray-500">{t("subtitle")}</p>
      </header>
      <ExportEditor
        articleId={articleId}
        editable={user.role !== Roles.LEGAL_REVIEWER}
        initial={{
          slug: profile?.slug ?? createPersianSlug(article.title),
          service: profile?.service ?? item.contentPlan.legalServices,
          keywords: profileKeywords.length ? profileKeywords : [item.keyword],
          metaTitle: profile?.metaTitle ?? article.title,
          metaDescription: profile?.metaDescription ?? review?.metaDescription ?? "",
          imageDescription: profile?.imageDescription ?? `تصویر مرتبط با ${article.title}`,
          imagePrompt: profile?.imagePrompt ?? `تصویر حرفه‌ای برای مقاله حقوقی ایرانی با موضوع ${article.title}، بدون نوشته`,
          altText: profile?.altText ?? article.title,
        }}
        preview={preview}
        error={error}
      />
    </>
  );
}
