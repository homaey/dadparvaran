import { db } from "@/lib/db";
import { FAQ_BLOCK_KEYS, faqContentToText, hasEditorialPlaceholder, isCompleteFaqContent } from "@/modules/article-engine/faq";
import { loadRelevantLegalSources } from "@/modules/article-engine/legal-sources";
import { contentSignature, type ReviewArticle } from "./reviewers";

export async function loadQualityArticle(articleId: number) {
  const article = await db.contentArticle.findUnique({
    where: { id: articleId },
    include: {
      blocks: { orderBy: { position: "asc" } },
      task: { include: { calendarItem: true } },
    },
  });
  if (!article?.task?.calendarItem) throw new Error("مقاله به آیتم تقویم متصل نیست");
  if (
    !article.blocks.length ||
    article.blocks.some((block) =>
      FAQ_BLOCK_KEYS.has(block.key)
        ? !isCompleteFaqContent(block.content)
        : !block.content.trim() || hasEditorialPlaceholder(block.content),
    )
  )
    throw new Error("همه بخش‌های مقاله و پاسخ هر سؤال متداول باید تکمیل شوند");

  const item = article.task.calendarItem;
  const legalSources = await loadRelevantLegalSources(article.title, item.keyword, item.legalCategory);
  const reviewArticle: ReviewArticle = {
    title: article.title,
    keyword: item.keyword,
    audience: item.targetAudience,
    legalCategory: item.legalCategory,
    legalSources,
    blocks: article.blocks.map((block) => ({
      key: block.key,
      label: block.label,
      content: FAQ_BLOCK_KEYS.has(block.key) ? faqContentToText(block.content) : block.content,
    })),
  };
  return { article, reviewArticle, signature: contentSignature(reviewArticle) };
}
