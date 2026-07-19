import { TaskStatus } from "@/lib/content-enums";
import { db } from "@/lib/db";
import { loadQualityArticle } from "@/modules/quality-review/context";
import { articleTypeLabels } from "@/modules/content-strategy/constants";
import { createPersianSlug, exportSchema } from "./contract";

export class ExportNotReadyError extends Error {}

export async function buildArticleExport(articleId: number, now = new Date()) {
  const article = await db.contentArticle.findUnique({ where: { id: articleId }, include: { blocks: { orderBy: { position: "asc" } }, exportProfile: true, qualityReviews: { orderBy: { createdAt: "desc" }, take: 1 }, task: { include: { calendarItem: { include: { contentPlan: true } } } } } });
  if (!article?.task?.calendarItem) throw new ExportNotReadyError("مقاله به برنامه محتوایی متصل نیست");
  const finished = new Set<string>([TaskStatus.APPROVED, TaskStatus.PUBLISHED]);
  if (!finished.has(article.task.status)) throw new ExportNotReadyError("فقط مقاله تأییدشده یا منتشرشده قابل خروجی است");
  const { signature } = await loadQualityArticle(articleId);
  const review = article.qualityReviews[0];
  if (!review || review.status !== "HUMAN_APPROVED" || review.contentSignature !== signature) throw new ExportNotReadyError("تأیید کیفیت انسانی معتبر برای نسخه فعلی وجود ندارد");
  const item = article.task.calendarItem; const plan = item.contentPlan; const profile = article.exportProfile;
  const profileKeywords: string[] = profile ? JSON.parse(profile.keywords) : [];
  const fallbackMeta = review.metaDescription ?? article.blocks.find(b => b.key === "summary" || b.key === "search_summary")?.content.slice(0, 160) ?? article.title;
  return exportSchema.parse({
    schema_version: "1.0", article_id: article.id, exported_at: now.toISOString(),
    metadata: { title: article.title, slug: profile?.slug ?? createPersianSlug(article.title), category: item.legalCategory, article_type: articleTypeLabels[item.articleType], service: profile?.service ?? plan.legalServices, keywords: profileKeywords.length ? profileKeywords : [item.keyword] },
    content: { blocks: article.blocks.map(b => ({ key: b.key, label: b.label, position: b.position, content: b.content })) },
    seo: { meta_title: profile?.metaTitle ?? article.title, meta_description: profile?.metaDescription ?? fallbackMeta },
    media: { image_description: profile?.imageDescription ?? `تصویر مرتبط با ${article.title}`, image_prompt: profile?.imagePrompt ?? `تصویر حرفه‌ای و واقع‌گرایانه برای مقاله حقوقی فارسی با موضوع ${article.title}، مناسب وب‌سایت حقوقی ایرانی، بدون متن و نماد خارجی`, alt_text: profile?.altText ?? article.title },
  });
}
