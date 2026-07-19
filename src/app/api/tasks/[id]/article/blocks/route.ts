import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { Roles } from "@/lib/roles";
import { syncArticleDraft } from "@/modules/article-engine/draft";
import { isArticleEditableStatus } from "@/modules/workflow/workflow";
import { FAQ_BLOCK_KEYS, isCompleteFaqContent } from "@/modules/article-engine/faq";

const schema = z.object({
  blocks: z
    .array(z.object({ id: z.number().int().positive(), content: z.string().max(100000) }))
    .min(1)
    .max(50),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "متن مقاله معتبر نیست" }, { status: 400 });

  const taskId = Number((await params).id);
  if (!Number.isInteger(taskId))
    return NextResponse.json({ error: "شناسه مقاله نامعتبر است" }, { status: 400 });

  const article = await db.contentArticle.findUnique({
    where: { taskId },
    include: { task: true, blocks: true },
  });
  if (!article?.task)
    return NextResponse.json({ error: "پیش‌نویس مقاله یافت نشد" }, { status: 404 });
  if (article.task.assigneeId !== auth.session.userId)
    return NextResponse.json({ error: "فقط مسئول این تسک می‌تواند مقاله را ویرایش کند" }, { status: 403 });
  if (!isArticleEditableStatus(article.task.status) || article.task.status === "REVIEW")
    return NextResponse.json({ error: "این مقاله در حال بررسی است و قابل ویرایش نیست" }, { status: 409 });

  const currentById = new Map(article.blocks.map((block) => [block.id, block]));
  const requestedIds = new Set<number>();
  for (const update of parsed.data.blocks) {
    if (requestedIds.has(update.id))
      return NextResponse.json({ error: "یک بخش بیش از یک‌بار ارسال شده است" }, { status: 400 });
    requestedIds.add(update.id);
    const current = currentById.get(update.id);
    if (!current)
      return NextResponse.json({ error: "یکی از بخش‌های مقاله معتبر نیست" }, { status: 400 });
    if (FAQ_BLOCK_KEYS.has(current.key) && update.content.trim() && !isCompleteFaqContent(update.content))
      return NextResponse.json({ error: "هر سؤال متداول باید یک پاسخ متناظر داشته باشد" }, { status: 400 });
  }

  const changed = parsed.data.blocks.filter((update) => currentById.get(update.id)?.content !== update.content);
  if (!changed.length) return NextResponse.json({ ok: true, updated: 0 });

  await db.$transaction(async (tx) => {
    for (const update of changed) {
      const current = currentById.get(update.id)!;
      await tx.articleBlock.update({
        where: { id: update.id },
        data: { content: update.content, version: { increment: 1 } },
      });
      await tx.articleBlockGeneration.create({
        data: {
          blockId: update.id,
          operation: "manual_edit",
          model: `human:${auth.session.userId}`,
          previousContent: current.content,
          resultContent: update.content,
        },
      });
    }
  });

  await syncArticleDraft(article.id);
  return NextResponse.json({ ok: true, updated: changed.length });
}
