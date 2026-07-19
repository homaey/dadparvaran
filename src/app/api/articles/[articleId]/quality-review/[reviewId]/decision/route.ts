import { NextResponse } from "next/server";
import { z } from "zod";
import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { loadQualityArticle } from "@/modules/quality-review/context";

const schema = z
  .object({
    decision: z.enum(["approve", "request_changes"]),
    note: z.string().trim().max(10000).default(""),
  })
  .superRefine((value, ctx) => {
    const minimum = value.decision === "approve" ? 10 : 3;
    if (value.note.length < minimum)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["note"],
        message: value.decision === "approve" ? "ثبت دلیل تأیید الزامی است" : "توضیح اصلاحات الزامی است",
      });
  });

type LegalReport = {
  findings?: Array<{ severity?: string }>;
  missingWarnings?: string[];
};

function approvalBlockers(raw: string) {
  try {
    const report = JSON.parse(raw) as LegalReport;
    return {
      critical: (report.findings ?? []).filter((finding) => finding.severity === "critical").length,
      missingWarnings: report.missingWarnings ?? [],
    };
  } catch {
    return { critical: 1, missingWarnings: ["گزارش حقوقی قابل خواندن نیست"] };
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ articleId: string; reviewId: string }> },
) {
  const auth = await authorize([Roles.ADMIN]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );

  const routeParams = await params;
  const articleId = Number(routeParams.articleId);
  const reviewId = Number(routeParams.reviewId);

  try {
    const { article, signature } = await loadQualityArticle(articleId);
    const task = article.task;
    if (!task || task.status !== TaskStatus.REVIEW)
      return NextResponse.json(
        { error: "تصمیم کیفیت فقط در مرحله بازبینی قابل ثبت است" },
        { status: 409 },
      );

    const review = await db.articleQualityReview.findFirst({ where: { id: reviewId, articleId } });
    if (!review) return NextResponse.json({ error: "گزارش یافت نشد" }, { status: 404 });
    if (review.contentSignature !== signature)
      return NextResponse.json(
        { error: "مقاله پس از گزارش تغییر کرده است؛ ارزیابی AI را دوباره اجرا کنید" },
        { status: 409 },
      );

    if (parsed.data.decision === "approve") {
      const blockers = approvalBlockers(review.legalFindings);
      if (blockers.critical || blockers.missingWarnings.length)
        return NextResponse.json(
          { error: "تا رفع ایراد بحرانی یا هشدار حقوقیِ جاافتاده، تأیید مقاله مجاز نیست" },
          { status: 409 },
        );
    }

    const now = new Date();
    await db.$transaction(async (tx) => {
      await tx.articleQualityReview.update({
        where: { id: reviewId },
        data: {
          status: parsed.data.decision === "approve" ? "HUMAN_APPROVED" : "CHANGES_REQUIRED",
          humanNote: parsed.data.note,
          approvedById: auth.session.userId,
          approvedAt: parsed.data.decision === "approve" ? now : null,
        },
      });

      if (parsed.data.decision === "request_changes") {
        await tx.task.update({
          where: { id: task.id },
          data: { status: TaskStatus.REVISION, reviewFeedback: parsed.data.note },
        });
        await tx.contentArticle.update({ where: { id: articleId }, data: { status: "DRAFT" } });
        await tx.taskActivity.create({
          data: {
            taskId: task.id,
            userId: auth.session.userId,
            fromStatus: TaskStatus.REVIEW,
            toStatus: TaskStatus.REVISION,
            note: parsed.data.note,
          },
        });
        await tx.notification.create({
          data: {
            userId: task.assigneeId,
            taskId: task.id,
            type: "REVISION_REQUESTED",
            title: "اصلاح مقاله لازم است",
            message: `برای «${task.title}» اصلاحات ثبت شد.`,
            scheduledFor: now,
            dedupeKey: `quality:${reviewId}:revision:${task.assigneeId}`,
          },
        });
      } else {
        await tx.task.update({
          where: { id: task.id },
          data: {
            status: TaskStatus.APPROVED,
            reviewFeedback: parsed.data.note,
            approvedAt: now,
          },
        });
        await tx.contentArticle.update({
          where: { id: articleId },
          data: { status: "APPROVED" },
        });
        await tx.taskActivity.create({
          data: {
            taskId: task.id,
            userId: auth.session.userId,
            fromStatus: TaskStatus.REVIEW,
            toStatus: TaskStatus.APPROVED,
            note: parsed.data.note,
          },
        });
        await tx.notification.create({
          data: {
            userId: task.assigneeId,
            taskId: task.id,
            type: "TASK_APPROVED",
            title: "مقاله تأیید شد",
            message: `مقاله «${task.title}» تأیید و آماده انتشار شد.`,
            scheduledFor: now,
            dedupeKey: `quality:${reviewId}:approved:${task.assigneeId}`,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ثبت تصمیم ناموفق بود" },
      { status: 400 },
    );
  }
}
