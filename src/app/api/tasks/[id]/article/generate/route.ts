import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { getAiConfig } from "@/lib/ai-provider";
import { loadArticleContext } from "@/modules/article-engine/context";
import { getTemplate, templateForArticleType } from "@/modules/article-engine/templates";
import { generateWholeArticle } from "@/modules/article-engine/ai";
import { generateImageGuidance } from "@/modules/article-engine/image-guidance";
import { syncArticleBlocks } from "@/modules/article-engine/blocks";
import { syncArticleDraft } from "@/modules/article-engine/draft";
import { isArticleEditableStatus } from "@/modules/workflow/workflow";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if ("error" in auth) return auth.error;
  const id = Number((await params).id);
  let statusAtGenerationStart: string | null = null;

  try {
    const { task, item, context } = await loadArticleContext(id);
    if (task.assigneeId !== auth.session.userId)
      return NextResponse.json({ error: "فقط مسئول این تسک می‌تواند ساخت مقاله را آغاز کند" }, { status: 403 });
    if (!isArticleEditableStatus(task.status))
      return NextResponse.json({ error: "مقاله تأییدشده یا منتشرشده قابل ویرایش نیست" }, { status: 409 });
    statusAtGenerationStart = task.status;
    await db.taskActivity.create({
      data: {
        taskId: task.id,
        userId: auth.session.userId,
        fromStatus: task.status,
        toStatus: task.status,
        note: "شروع ساخت مقاله توسط مسئول تسک",
      },
    });

    const templateKey = templateForArticleType(item.articleType);
    const definitions = getTemplate(templateKey);

    const article = await db.contentArticle.upsert({
      where: { taskId: id },
      update: { templateKey, authorId: task.assigneeId },
      create: {
        taskId: id,
        title: task.title,
        authorId: task.assigneeId,
        templateKey,
        blocks: { create: definitions.map((b, position) => ({ key: b.key, label: b.label, position })) },
      },
    });

    await syncArticleBlocks(article.id, definitions);

    const { model } = await getAiConfig();
    const blocks = await db.articleBlock.findMany({ where: { articleId: article.id }, orderBy: { position: "asc" } });

    const generated = await generateWholeArticle(context, definitions);
    for (const block of blocks) {
      if (block.content) continue;
      const content = generated.get(block.key);
      if (!content) continue;
      await db.$transaction([
        db.articleBlock.update({
          where: { id: block.id },
          data: { content, generatedByAi: true, version: { increment: 1 } },
        }),
        db.articleBlockGeneration.create({
          data: { blockId: block.id, operation: "generate", model, resultContent: content },
        }),
      ]);
    }

    await syncArticleDraft(article.id);

    // پس از تولید بلوک‌ها، راهنمای تصویر را یک‌بار تولید و ذخیره کن.
    let imageGuidance = article.imageGuidance;
    if (!imageGuidance) {
      const filledBlocks = await db.articleBlock.findMany({
        where: { articleId: article.id },
        orderBy: { position: "asc" },
        select: { label: true, content: true },
      });
      try {
        const guidance = await generateImageGuidance(context, filledBlocks);
        imageGuidance = JSON.stringify(guidance);
        await db.contentArticle.update({ where: { id: article.id }, data: { imageGuidance } });
      } catch (e) {
        console.error("Image guidance generation failed", e);
      }
    }

    const moveToDraft = new Set<string>([
      TaskStatus.PLANNED,
      TaskStatus.ASSIGNED,
      TaskStatus.RESEARCHING,
    ]).has(task.status);
    await db.$transaction(async (tx) => {
      await tx.contentArticle.update({ where: { id: article.id }, data: { status: "DRAFT" } });
      if (moveToDraft) {
        await tx.task.update({ where: { id: task.id }, data: { status: TaskStatus.DRAFT } });
        await tx.taskActivity.create({
          data: {
            taskId: task.id,
            userId: auth.session.userId,
            fromStatus: task.status,
            toStatus: TaskStatus.DRAFT,
            note: "تولید کامل مقاله و ایجاد خودکار ساختار پیش‌نویس",
          },
        });
      } else {
        await tx.taskActivity.create({
          data: {
            taskId: task.id,
            userId: auth.session.userId,
            fromStatus: task.status,
            toStatus: task.status,
            note: "تکمیل ساخت یا ترمیم پیش‌نویس مقاله",
          },
        });
      }
    });

    return NextResponse.json({ articleId: article.id, imageGuidance, status: TaskStatus.DRAFT });
  } catch (e) {
    console.error("Article generation failed", e);
    if (statusAtGenerationStart) {
      await db.taskActivity.create({
        data: {
          taskId: id,
          userId: auth.session.userId,
          fromStatus: statusAtGenerationStart,
          toStatus: statusAtGenerationStart,
          note: `ساخت مقاله ناموفق بود: ${e instanceof Error ? e.message.slice(0, 500) : "خطای نامشخص"}`,
        },
      }).catch(() => undefined);
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "تولید مقاله ناموفق بود" },
      { status: 502 },
    );
  }
}
