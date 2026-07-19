import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { syncArticleDraft } from "@/modules/article-engine/draft";
import { isArticleEditableStatus } from "@/modules/workflow/workflow";
import { FAQ_BLOCK_KEYS, isCompleteFaqContent } from "@/modules/article-engine/faq";

const schema = z.object({ content: z.string().max(100000) });

export async function PATCH(req: Request, { params }: { params: Promise<{ blockId: string }> }) {
  const auth = await authorize([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "متن نامعتبر است" }, { status: 400 });
  const blockId = Number((await params).blockId);
  const block = await db.articleBlock.findUnique({
    where: { id: blockId },
    include: { article: { include: { task: true } } },
  });
  if (!block?.article.task || block.article.task.assigneeId !== auth.session.userId)
    return NextResponse.json({ error: "فقط مسئول این تسک می‌تواند مقاله را ویرایش کند" }, { status: 403 });
  if (FAQ_BLOCK_KEYS.has(block.key) && parsed.data.content.trim() && !isCompleteFaqContent(parsed.data.content))
    return NextResponse.json({ error: "هر سؤال متداول باید یک پاسخ متناظر داشته باشد" }, { status: 400 });
  if (!isArticleEditableStatus(block.article.task.status))
    return NextResponse.json({ error: "مقاله تأییدشده یا منتشرشده قابل ویرایش نیست" }, { status: 409 });
  await db.$transaction(async (tx) => {
    await tx.articleBlock.update({
      where: { id: blockId },
      // Manual editing must not erase the fact that AI contributed earlier.
      data: { content: parsed.data.content, version: { increment: 1 } },
    });
    await tx.articleBlockGeneration.create({
      data: {
        blockId,
        operation: "manual_edit",
        model: `human:${auth.session.userId}`,
        previousContent: block.content,
        resultContent: parsed.data.content,
      },
    });
  });
  await syncArticleDraft(block.articleId);
  return NextResponse.json({ ok: true });
}
