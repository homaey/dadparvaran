import { db } from "@/lib/db";
import { FAQ_BLOCK_KEYS, faqContentToText } from "./faq";

export type DraftBlock = { key?: string; label: string; content: string; position?: number };

export function serializeBlocksToDraft(blocks: DraftBlock[]) {
  return [...blocks]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .filter((block) => block.content.trim())
    .map((block) => `${block.label}\n${block.key && FAQ_BLOCK_KEYS.has(block.key) ? faqContentToText(block.content) : block.content.trim()}`)
    .join("\n\n");
}

export async function syncArticleDraft(articleId: number) {
  const article = await db.contentArticle.findUnique({
    where: { id: articleId },
    include: { blocks: { orderBy: { position: "asc" } } },
  });
  if (!article) throw new Error("مقاله یافت نشد");
  const draft = serializeBlocksToDraft(article.blocks);
  await db.$transaction([
    db.contentArticle.update({ where: { id: article.id }, data: { body: draft } }),
    ...(article.taskId
      ? [db.task.update({ where: { id: article.taskId }, data: { draftContent: draft } })]
      : []),
  ]);
  return draft;
}
