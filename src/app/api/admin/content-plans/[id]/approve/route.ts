import { NextResponse } from "next/server";
import { CalendarItemStatus, TaskStatus } from "@/lib/content-enums";
import { Roles } from "@/lib/roles";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  const plan = await db.contentPlan.findUnique({ where: { id }, include: { items: true } });
  if (!plan) return NextResponse.json({ error: "برنامه یافت نشد" }, { status: 404 });
  if (plan.status === "APPROVED")
    return NextResponse.json({ error: "این برنامه قبلاً تأیید شده است" }, { status: 409 });
  if (plan.items.some((item) => !item.assignedUserId))
    return NextResponse.json({ error: "برای همه آیتم‌ها مسئول تعیین کنید" }, { status: 400 });

  const assigneeIds = [...new Set(plan.items.map((item) => item.assignedUserId!))];
  const validAssignees = await db.user.count({
    where: { id: { in: assigneeIds }, role: { in: [Roles.ADMIN, Roles.LAWYER, Roles.CONTENT_CREATOR] } },
  });
  if (validAssignees !== assigneeIds.length)
    return NextResponse.json(
      { error: "مسئول همه آیتم‌ها باید مدیر، وکیل یا تولیدکننده محتوا باشد" },
      { status: 400 },
    );

  const now = new Date();
  await db.$transaction(async (tx) => {
    for (const item of plan.items) {
      const assigneeId = item.assignedUserId!;
      const task = await tx.task.create({
        data: {
          title: item.title,
          description: `کلیدواژه: ${item.keyword}\nهدف جست‌وجو: ${item.searchIntent}`,
          status: TaskStatus.ASSIGNED,
          deadline: item.deadline,
          assigneeId,
          creatorId: auth.session.userId,
        },
      });
      await tx.taskActivity.create({
        data: {
          taskId: task.id,
          userId: auth.session.userId,
          fromStatus: TaskStatus.PLANNED,
          toStatus: TaskStatus.ASSIGNED,
          note: "تخصیص خودکار پس از تأیید برنامه محتوا",
        },
      });
      await tx.notification.create({
        data: {
          userId: assigneeId,
          taskId: task.id,
          type: "TASK_ASSIGNED",
          title: "وظیفه جدید",
          message: `«${item.title}» به شما محول شد.`,
          scheduledFor: now,
          dedupeKey: `plan:${id}:assigned:${task.id}:${assigneeId}`,
        },
      });
      await tx.contentCalendarItem.update({
        where: { id: item.id },
        data: { status: CalendarItemStatus.CONVERTED_TO_TASK, taskId: task.id },
      });
    }
    await tx.contentPlan.update({ where: { id }, data: { status: "APPROVED" } });
  });

  return NextResponse.json({ ok: true });
}
