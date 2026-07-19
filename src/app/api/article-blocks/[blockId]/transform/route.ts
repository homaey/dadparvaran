import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { getAiConfig } from "@/lib/ai-provider";
import { loadArticleContext } from "@/modules/article-engine/context";
import { generateArticleBlock } from "@/modules/article-engine/ai";
import { getTemplate } from "@/modules/article-engine/templates";
import { syncArticleDraft } from "@/modules/article-engine/draft";
import { isArticleEditableStatus } from "@/modules/workflow/workflow";

const schema = z.object({ operation: z.enum(["regenerate", "simplify", "professionalize", "shorten", "expand"]) });

export async function POST(req: Request, { params }: { params: Promise<{ blockId: string }> }) {
  const auth = await authorize([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
  const blockId = Number((await params).blockId);
  const block = await db.articleBlock.findUnique({
    where: { id: blockId },
    include: { article: { select: { id: true, taskId: true, templateKey: true } } },
  });
  if (!block?.article.taskId || !block.article.templateKey)
    return NextResponse.json({ error: "بلوک یافت نشد" }, { status: 404 });
  try {
    const { task, context } = await loadArticleContext(block.article.taskId);
    if (task.assigneeId !== auth.session.userId)
      return NextResponse.json({ error: "فقط مسئول این تسک می‌تواند متن مقاله را بازتولید کند" }, { status: 403 });
    if (!isArticleEditableStatus(task.status))
      return NextResponse.json({ error: "مقاله تأییدشده یا منتشرشده قابل ویرایش نیست" }, { status: 409 });
    const definition = getTemplate(block.article.templateKey).find((item) => item.key === block.key);
    if (!definition) return NextResponse.json({ error: "بلوک با قالب سازگار نیست" }, { status: 409 });
    if (definition.humanOnly)
      return NextResponse.json({ error: `بلوک «${definition.label}» را وکیل می‌نویسد و با هوش مصنوعی تغییر نمی‌کند` }, { status: 409 });
    const content = await generateArticleBlock(context, definition, parsed.data.operation, block.content);
    const { model } = await getAiConfig();
    await db.$transaction([
      db.articleBlock.update({ where: { id: block.id }, data: { content, generatedByAi: true, version: { increment: 1 } } }),
      db.articleBlockGeneration.create({ data: { blockId: block.id, operation: parsed.data.operation, model, previousContent: block.content, resultContent: content } }),
    ]);
    await syncArticleDraft(block.article.id);
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ویرایش AI ناموفق بود" }, { status: 502 });
  }
}
