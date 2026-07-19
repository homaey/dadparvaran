import { Roles } from "@/lib/roles";
import { notFound } from "next/navigation";

import { FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { workflowLabels } from "@/modules/workflow/workflow";
import { serializeBlocksToDraft } from "@/modules/article-engine/draft";
import { Card, Badge, btnPrimary } from "@/components/ui";
import WorkflowAction from "./workflow-action";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) notFound();
  const id = Number((await params).id);
  const task = await db.task.findUnique({
    where: { id },
    include: { assignee: { select: { name: true } }, calendarItem: { select: { id: true } }, article: { include: { blocks: { orderBy: { position: "asc" } } } }, activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!task || (user.role !== Roles.ADMIN && task.assigneeId !== user.userId)) notFound();
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fa-display text-2xl font-bold text-navy-900">{task.title}</h1>
          <p className="mt-1 text-gray-500">{task.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge>{workflowLabels[task.status]}</Badge>
          {task.calendarItem && <Link className={btnPrimary} href={`/dashboard/content-workflow/${task.id}/article`}><FileText className="h-4 w-4" /> ساخت/ادامه مقاله</Link>}
        </div>
      </header>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><b className="text-navy-900">نویسنده</b><p className="mt-1 text-gray-600">{task.assignee.name}</p></Card>
        <Card><b className="text-navy-900">مهلت</b><p className="mt-1 text-gray-600">{task.deadline ? new Intl.DateTimeFormat("fa-IR").format(task.deadline) : "تعیین نشده"}</p></Card>
      </section>
      <WorkflowAction task={{ id: task.id, status: task.status, draftContent: task.article ? serializeBlocksToDraft(task.article.blocks) : task.draftContent ?? "", reviewFeedback: task.reviewFeedback ?? "" }} role={user.role} structured={Boolean(task.article)} />
      <h2 className="mb-4 mt-8 font-fa-display text-lg font-bold text-navy-900">تاریخچه</h2>
      <div className="grid gap-2">
        {task.activities.map(a => (
          <Card key={a.id} className="!p-4 text-sm text-gray-600">
            {a.user.name}: {a.fromStatus ? workflowLabels[a.fromStatus] + " ← " : ""}{workflowLabels[a.toStatus]} {a.note && `— ${a.note}`}
          </Card>
        ))}
      </div>
    </>
  );
}
