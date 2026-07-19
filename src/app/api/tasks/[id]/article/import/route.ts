import { NextResponse } from "next/server";
import { z } from "zod";
import { Roles } from "@/lib/roles";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { loadArticleContext } from "@/modules/article-engine/context";
import { getTemplate, templateForArticleType } from "@/modules/article-engine/templates";
import { syncArticleBlocks } from "@/modules/article-engine/blocks";
import { syncArticleDraft } from "@/modules/article-engine/draft";
import { isArticleEditableStatus } from "@/modules/workflow/workflow";

const blockSchema = z.object({ key: z.string().min(1), content: z.string() });

/**
 * هر دو شکل پذیرفته می‌شود: خروجی استاندارد سایت ({ content: { blocks } }) و شکل ساده
 * ({ blocks }). این‌طور فایلی که از همین سایت خروجی گرفته شده بدون دست‌کاری برمی‌گردد.
 */
const importSchema = z
  .object({
    metadata: z.object({ title: z.string().optional() }).passthrough().optional(),
    content: z.object({ blocks: z.array(blockSchema) }).optional(),
    blocks: z.array(blockSchema).optional(),
  })
  .passthrough()
  .refine((value) => value.content?.blocks ?? value.blocks, {
    message: "فایل باید آرایه blocks داشته باشد",
  });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if ("error" in auth) return auth.error;
  const id = Number((await params).id);

  const raw = await req.json().catch(() => null);
  if (raw === null) return NextResponse.json({ error: "فایل JSON معتبر نیست" }, { status: 400 });
  const parsed = importSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ساختار فایل معتبر نیست" },
      { status: 400 },
    );

  const incoming = parsed.data.content?.blocks ?? parsed.data.blocks ?? [];
  if (!incoming.length) return NextResponse.json({ error: "فایل هیچ بلوکی ندارد" }, { status: 400 });

  try {
    const { task, item } = await loadArticleContext(id);
    if (auth.session.role !== Roles.ADMIN && task.assigneeId !== auth.session.userId)
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    if (!isArticleEditableStatus(task.status))
      return NextResponse.json({ error: "مقاله تأییدشده یا منتشرشده قابل ویرایش نیست" }, { status: 409 });

    const templateKey = templateForArticleType(item.articleType);
    const definitions = getTemplate(templateKey);

    const article = await db.contentArticle.upsert({
      where: { taskId: id },
      update: { templateKey },
      create: {
        taskId: id,
        title: task.title,
        authorId: task.assigneeId,
        templateKey,
        blocks: { create: definitions.map((b, position) => ({ key: b.key, label: b.label, position })) },
      },
    });
    await syncArticleBlocks(article.id, definitions);

    const templateKeys = new Set(definitions.map((d) => d.key));
    const humanOnlyKeys = new Set(definitions.filter((d) => d.humanOnly).map((d) => d.key));
    const applied = incoming.filter((b) => templateKeys.has(b.key) && !humanOnlyKeys.has(b.key) && b.content.trim());
    const skipped = incoming
      .filter((b) => !templateKeys.has(b.key) || humanOnlyKeys.has(b.key))
      .map((b) => b.key);

    if (!applied.length)
      return NextResponse.json(
        { error: `هیچ بلوکی با قالب «${templateKey}» مطابقت نداشت` },
        { status: 409 },
      );

    const currentBlocks = await db.articleBlock.findMany({ where: { articleId: article.id } });
    const currentByKey = new Map(currentBlocks.map((block) => [block.key, block]));
    await db.$transaction(async (tx) => {
      for (const imported of applied) {
        const current = currentByKey.get(imported.key);
        if (!current) continue;
        const resultContent = imported.content.trim();
        await tx.articleBlock.update({
          where: { id: current.id },
          // Imported provenance is unknown, so it is conservatively treated as AI-assisted.
          data: { content: resultContent, generatedByAi: true, version: { increment: 1 } },
        });
        await tx.articleBlockGeneration.create({
          data: {
            blockId: current.id,
            operation: "import",
            model: "external/unknown",
            previousContent: current.content,
            resultContent,
          },
        });
      }
    });

    const title = parsed.data.metadata?.title?.trim();
    if (title) await db.contentArticle.update({ where: { id: article.id }, data: { title } });

    await syncArticleDraft(article.id);

    return NextResponse.json({
      articleId: article.id,
      applied: applied.length,
      skipped,
    });
  } catch (error) {
    console.error("Article JSON import failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "واردسازی ناموفق بود" },
      { status: 500 },
    );
  }
}
