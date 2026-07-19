import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { buildArticleExport } from "./serializer";
import { toRenderBlocks } from "./render-blocks";

export async function prepareArticlePublication(articleId: number) {
  const [exportData, contentArticle] = await Promise.all([
    buildArticleExport(articleId),
    db.contentArticle.findUnique({ where: { id: articleId }, select: { coverImage: true, publishedArticleId: true } }),
  ]);
  if (!contentArticle) throw new Error("مقاله یافت نشد");
  return {
    articleId,
    exportData,
    coverImage: contentArticle.coverImage,
    publishedArticleId: contentArticle.publishedArticleId,
  };
}

export async function upsertMainSiteArticle(
  tx: Prisma.TransactionClient,
  prepared: Awaited<ReturnType<typeof prepareArticlePublication>>,
  teamMemberId: number,
  publishedAt = new Date(),
) {
  const { exportData, coverImage } = prepared;
  // صفحه عمومی روی block.type سوییچ می‌کند و بلوک بدون type را دور می‌اندازد؛ بدون این تبدیل،
  // مقاله منتشرشده با تیتر و کاور ولی بدنه کاملاً خالی روی سایت می‌نشیند.
  const blocks = JSON.stringify(toRenderBlocks(exportData.content.blocks));
  const slugOwner = await tx.article.findUnique({
    where: { slug: exportData.metadata.slug },
    select: { id: true },
  });
  if (slugOwner && slugOwner.id !== prepared.publishedArticleId)
    throw new Error("این نشانی قبلاً متعلق به مقاله دیگری است؛ نشانی خروجی را تغییر دهید");

  const updateData = {
      title: exportData.metadata.title,
      slug: exportData.metadata.slug,
      excerpt: exportData.seo.meta_description,
      blocks,
      authorId: teamMemberId,
      ...(coverImage ? { coverImage } : {}),
      status: "PUBLISHED",
      publishedAt,
      scheduledAt: null,
    } as const;

  if (prepared.publishedArticleId) {
    return tx.article.update({
      where: { id: prepared.publishedArticleId },
      data: updateData,
    });
  }

  return tx.article.create({
    data: {
      slug: exportData.metadata.slug,
      title: exportData.metadata.title,
      excerpt: exportData.seo.meta_description,
      blocks,
      coverImage: coverImage ?? undefined,
      authorId: teamMemberId,
      status: "PUBLISHED",
      publishedAt,
    },
  });
}

export async function publishToMainSite(articleId: number, teamMemberId: number) {
  const prepared = await prepareArticlePublication(articleId);
  return db.$transaction(async (tx) => {
    const article = await upsertMainSiteArticle(tx, prepared, teamMemberId);
    await tx.contentArticle.update({
      where: { id: articleId },
      data: { publishedArticleId: article.id, status: "PUBLISHED" },
    });
    return article;
  });
}

export async function publishDraft(articleId: number) {
  return db.article.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt: new Date(), scheduledAt: null },
  });
}
