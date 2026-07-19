import { NextResponse } from "next/server";
import { z } from "zod";
import { TaskStatus } from "@/lib/content-enums";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { canTransition } from "@/modules/workflow/workflow";
import { serializeBlocksToDraft } from "@/modules/article-engine/draft";
import { loadQualityArticle } from "@/modules/quality-review/context";
import { prepareArticlePublication, upsertMainSiteArticle } from "@/modules/article-export/publish";
import { detectSensitivePersonalData } from "@/modules/content-safety/pii";
import { FAQ_BLOCK_KEYS, hasEditorialPlaceholder, isCompleteFaqContent } from "@/modules/article-engine/faq";

const schema = z.object({
  status: z.nativeEnum(TaskStatus),
  draftContent: z.string().max(100000).optional(),
  feedback: z.string().max(10000).optional(),
});

function articleStatusForTask(status: string) {
  if (status === TaskStatus.REVIEW) return "IN_REVIEW";
  if (status === TaskStatus.APPROVED) return "APPROVED";
  if (status === TaskStatus.PUBLISHED) return "PUBLISHED";
  return "DRAFT";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const id = Number((await params).id);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "داده نامعتبر است" }, { status: 400 });

  const task = await db.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { teamMember: { select: { id: true } } } },
      article: {
        include: {
          blocks: { orderBy: { position: "asc" } },
          qualityReviews: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
  if (!task) return NextResponse.json({ error: "وظیفه یافت نشد" }, { status: 404 });
  const owns = task.assigneeId === auth.session.userId;
  const reviews = task.reviewerId === auth.session.userId;
  if (auth.session.role !== "ADMIN" && !owns && !reviews)
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  if (parsed.data.status === TaskStatus.REVIEW && !owns)
    return NextResponse.json({ error: "فقط مسئول تسک می‌تواند مقاله را برای تأیید ارسال کند" }, { status: 403 });
  if (!canTransition(auth.session.role, task.status, parsed.data.status))
    return NextResponse.json({ error: "انتقال وضعیت مجاز نیست" }, { status: 409 });

  let draftContent = parsed.data.draftContent;
  if (task.article) {
    if (
      task.article.blocks.some((block) =>
        FAQ_BLOCK_KEYS.has(block.key)
          ? !isCompleteFaqContent(block.content)
          : !block.content.trim() || hasEditorialPlaceholder(block.content),
      ) && parsed.data.status === TaskStatus.REVIEW
    )
      return NextResponse.json({ error: "همه بخش‌ها و پاسخ متناظر هر سؤال متداول باید پیش از ارسال تکمیل شوند" }, { status: 409 });
    if (parsed.data.status === TaskStatus.REVIEW && !task.article.coverImage)
      return NextResponse.json({ error: "پیش از ارسال، تصویر شاخص مقاله را مطابق راهنمای تصویر اضافه کنید" }, { status: 409 });
    draftContent = serializeBlocksToDraft(task.article.blocks);
  }

  if (parsed.data.status === TaskStatus.REVIEW && !draftContent?.trim())
    return NextResponse.json({ error: "برای ارسال، متن پیش‌نویس الزامی است" }, { status: 400 });
  if (parsed.data.status === TaskStatus.REVIEW) {
    const sensitiveData = detectSensitivePersonalData(draftContent ?? "");
    if (sensitiveData.length)
      return NextResponse.json(
        { error: "اطلاعات شخصی احتمالی در متن دیده شد؛ شماره تماس، ایمیل یا کد ملی را حذف کنید" },
        { status: 409 },
      );
  }
  if (parsed.data.status === TaskStatus.REVISION && !parsed.data.feedback?.trim())
    return NextResponse.json({ error: "توضیح اصلاحات الزامی است" }, { status: 400 });

  if (parsed.data.status === TaskStatus.APPROVED) {
    if (!task.article) return NextResponse.json({ error: "مقاله‌ای برای تأیید وجود ندارد" }, { status: 409 });
    try {
      const { signature } = await loadQualityArticle(task.article.id);
      const latest = task.article.qualityReviews[0];
      if (!latest || latest.status !== "HUMAN_APPROVED" || latest.contentSignature !== signature)
        return NextResponse.json({ error: "تأیید مقاله فقط پس از ارزیابی معتبر و تأیید کیفیت انسانی ممکن است" }, { status: 409 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "گزارش کیفیت معتبر نیست" }, { status: 409 });
    }
  }

  const now = new Date();
  if (parsed.data.status === TaskStatus.PUBLISHED) {
    if (!task.article) return NextResponse.json({ error: "مقاله‌ای برای انتشار وجود ندارد" }, { status: 409 });
    const teamMemberId = task.assignee.teamMember?.id ?? auth.session.teamMemberId;
    if (teamMemberId == null)
      return NextResponse.json({ error: "برای انتشار، نویسنده باید پروفایل عضو تیم داشته باشد" }, { status: 409 });
    try {
      const prepared = await prepareArticlePublication(task.article.id);
      const publicArticle = await db.$transaction(async (tx) => {
        const article = await upsertMainSiteArticle(tx, prepared, teamMemberId, now);
        await tx.contentArticle.update({
          where: { id: task.article!.id },
          data: { publishedArticleId: article.id, status: "PUBLISHED", body: draftContent ?? "" },
        });
        await tx.task.update({ where: { id }, data: { status: TaskStatus.PUBLISHED, draftContent, publishedAt: now } });
        await tx.taskActivity.create({ data: { taskId: id, userId: auth.session.userId, fromStatus: task.status, toStatus: TaskStatus.PUBLISHED } });
        return article;
      });
      return NextResponse.json({ ok: true, articleId: publicArticle.id });
    } catch (error) {
      console.error("Atomic publication failed", error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "انتشار مقاله ناموفق بود" }, { status: 409 });
    }
  }

  // بدون بازبین جداگانه، ارسال به بازبینی به سازندهٔ تسک (ادمین) اطلاع داده می‌شود تا تأیید کند.
  const notifyUser =
    parsed.data.status === TaskStatus.REVIEW
      ? task.creatorId
      : parsed.data.status === TaskStatus.REVISION || parsed.data.status === TaskStatus.APPROVED
        ? task.assigneeId
        : null;

  await db.$transaction(async (tx) => {
    await tx.task.update({
      where: { id },
      data: {
        status: parsed.data.status,
        draftContent,
        reviewFeedback: parsed.data.feedback,
        submittedAt: parsed.data.status === TaskStatus.REVIEW ? now : undefined,
        approvedAt: parsed.data.status === TaskStatus.APPROVED ? now : undefined,
      },
    });
    if (task.article) {
      await tx.contentArticle.update({
        where: { id: task.article.id },
        data: { status: articleStatusForTask(parsed.data.status), body: draftContent ?? "" },
      });
    }
    await tx.taskActivity.create({
      data: { taskId: id, userId: auth.session.userId, fromStatus: task.status, toStatus: parsed.data.status, note: parsed.data.feedback },
    });
    if (notifyUser) {
      await tx.notification.create({
        data: {
          userId: notifyUser,
          taskId: id,
          type: parsed.data.status === TaskStatus.REVIEW ? "REVIEW_REQUESTED" : parsed.data.status === TaskStatus.REVISION ? "REVISION_REQUESTED" : "TASK_APPROVED",
          title: "به‌روزرسانی وظیفه",
          message: `وضعیت «${task.title}» تغییر کرد.`,
          scheduledFor: now,
          dedupeKey: `workflow:${id}:${parsed.data.status}:${now.getTime()}`,
        },
      });
    }
  });
  return NextResponse.json({ ok: true });
}
