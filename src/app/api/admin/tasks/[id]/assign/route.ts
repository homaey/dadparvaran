import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { TaskStatus } from "@/lib/content-enums";
import { z } from "zod";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({ assigneeId: z.string().min(1), deadline: z.coerce.date() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN]);
  if ("error" in auth) return auth.error;
  const id = Number((await params).id);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "نویسنده و مهلت الزامی‌اند" }, { status: 400 });
  const user = await db.user.findUnique({ where: { id: parsed.data.assigneeId }, select: { role: true } });
  const authorRoles = new Set<string>([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if (!user || !authorRoles.has(user.role))
    return NextResponse.json({ error: "نویسنده باید مدیر، تولیدکننده محتوا یا وکیل باشد" }, { status: 400 });
  const old = await db.task.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "وظیفه یافت نشد" }, { status: 404 });
  if (old.status === TaskStatus.APPROVED || old.status === TaskStatus.PUBLISHED)
    return NextResponse.json({ error: "وظیفه تأییدشده یا منتشرشده قابل تخصیص مجدد نیست" }, { status: 409 });
  const now = new Date();
  await db.$transaction([
    // reviewerId پاک می‌شود تا رکوردهایی که قبلاً بازبین داشتند هم به گردش کار بدون بازبین بیایند.
    db.task.update({ where: { id }, data: { assigneeId: parsed.data.assigneeId, deadline: parsed.data.deadline, reviewerId: null, status: TaskStatus.ASSIGNED } }),
    db.contentCalendarItem.updateMany({ where: { taskId: id }, data: { assignedUserId: parsed.data.assigneeId, deadline: parsed.data.deadline } }),
    db.contentArticle.updateMany({ where: { taskId: id }, data: { authorId: parsed.data.assigneeId } }),
    db.taskActivity.create({ data: { taskId: id, userId: auth.session.userId, fromStatus: old.status, toStatus: TaskStatus.ASSIGNED, note: "تخصیص نویسنده و مهلت" } }),
    db.notification.create({ data: { userId: parsed.data.assigneeId, taskId: id, type: "TASK_ASSIGNED", title: "وظیفه جدید", message: `«${old.title}» به شما محول شد.`, scheduledFor: now, dedupeKey: `assigned:${id}:${parsed.data.assigneeId}:${now.getTime()}` } }),
  ]);
  return NextResponse.json({ ok: true });
}
