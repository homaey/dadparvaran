import { NextResponse } from "next/server";
import { Roles } from "@/lib/roles";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";

/**
 * حذف تقویم محتوا.
 *
 * آیتم‌های تقویم با onDelete: Cascade خودشان می‌روند، ولی رابطه تسک SetNull است: حذف بی‌احتیاط
 * یک تقویم تأییدشده، تسک‌ها را زنده ولی بی‌ریشه رها می‌کند و مرحله ساخت مقاله‌شان برای همیشه خطا
 * می‌دهد. پس اگر تسکی ساخته شده باشد، بدون force حذف نمی‌کنیم و تعدادش را گزارش می‌دهیم.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });

  const plan = await db.contentPlan.findUnique({
    where: { id },
    include: { items: { select: { taskId: true } } },
  });
  if (!plan) return NextResponse.json({ error: "تقویم یافت نشد" }, { status: 404 });

  const taskIds = plan.items.map((item) => item.taskId).filter((taskId): taskId is number => taskId != null);
  const force = new URL(req.url).searchParams.get("force") === "true";

  if (taskIds.length && !force) {
    return NextResponse.json(
      {
        error: `این تقویم ${taskIds.length} وظیفه ساخته است. حذف آن، وظایف و مقالات مربوطه را هم پاک می‌کند.`,
        taskCount: taskIds.length,
        needsForce: true,
      },
      { status: 409 },
    );
  }

  await db.$transaction(async (tx) => {
    if (taskIds.length) {
      // ترتیب مهم است: بلوک‌ها و بازبینی‌های کیفیت به ContentArticle وابسته‌اند و آن به Task.
      const articles = await tx.contentArticle.findMany({
        where: { taskId: { in: taskIds } },
        select: { id: true },
      });
      const articleIds = articles.map((article) => article.id);
      if (articleIds.length) {
        await tx.articleBlockGeneration.deleteMany({ where: { block: { articleId: { in: articleIds } } } });
        await tx.articleBlock.deleteMany({ where: { articleId: { in: articleIds } } });
        await tx.articleQualityReview.deleteMany({ where: { articleId: { in: articleIds } } });
        await tx.articleExportProfile.deleteMany({ where: { articleId: { in: articleIds } } });
        await tx.contentArticle.deleteMany({ where: { id: { in: articleIds } } });
      }
      await tx.notification.deleteMany({ where: { taskId: { in: taskIds } } });
      await tx.taskActivity.deleteMany({ where: { taskId: { in: taskIds } } });
      // پیش از حذف تسک، ارجاع آیتم تقویم باید برداشته شود وگرنه قید کلید خارجی می‌شکند.
      await tx.contentCalendarItem.updateMany({ where: { taskId: { in: taskIds } }, data: { taskId: null } });
      await tx.task.deleteMany({ where: { id: { in: taskIds } } });
    }
    await tx.contentPlan.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true, deletedTasks: taskIds.length });
}
