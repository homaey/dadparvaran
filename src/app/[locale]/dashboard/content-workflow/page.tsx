import { notFound } from "next/navigation";
import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { workflowLabels } from "@/modules/workflow/workflow";
import { Card, MetricCard, Badge, tableClass, thClass, tdClass } from "@/components/ui";
import AssignTask from "./assign-task";

const finished = new Set<string>([TaskStatus.APPROVED, TaskStatus.PUBLISHED]);

export default async function Workflow() {
  const user = await requireUser();
  if (!user) notFound();
  const t = await getTranslations("content.contentWorkflow");

  if (user.role !== Roles.ADMIN) {
    const tasks = await db.task.findMany({
      where: { assigneeId: user.userId },
      include: {
        assignee: { select: { name: true } },
        calendarItem: { select: { id: true } },
        article: { select: { imageGuidance: true } },
      },
      orderBy: { deadline: "asc" },
    });
    return (
      <>
        <header className="mb-8">
          <h1 className="font-fa-display text-2xl font-bold text-navy-900">{t("assignedTitle")}</h1>
          <p className="mt-1 text-gray-500">{t("hint")}</p>
        </header>
        <TaskTable tasks={tasks} />
      </>
    );
  }

  const [tasks, creators, people] = await Promise.all([
    db.task.findMany({
      include: {
        assignee: { select: { name: true } },
        calendarItem: { select: { id: true } },
        article: { select: { imageGuidance: true } },
      },
      orderBy: { deadline: "asc" },
    }),
    db.user.findMany({ where: { role: { in: [Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER] } }, select: { id: true, name: true } }),
    db.user.findMany({ where: { role: { in: [Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER] } }, select: { id: true, name: true, role: true, _count: { select: { assignedTasks: true } }, assignedTasks: { select: { status: true, deadline: true, approvedAt: true, publishedAt: true } } } }),
  ]);
  const overdue = tasks.filter(task => task.status === TaskStatus.OVERDUE || Boolean(task.deadline && task.deadline < new Date() && !finished.has(task.status))).length;

  return (
    <>
      <header className="mb-8">
        <h1 className="font-fa-display text-2xl font-bold text-navy-900">{t("adminTitle")}</h1>
        <p className="mt-1 text-gray-500">{t("adminSubtitle")}</p>
      </header>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="برنامه‌ریزی‌شده" value={tasks.filter(task => task.status === TaskStatus.PLANNED).length} />
        <MetricCard title="در بازبینی" value={tasks.filter(task => task.status === TaskStatus.REVIEW).length} />
        <MetricCard title="عقب‌افتاده" value={overdue} />
      </section>
      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">وظایف</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {tasks.map(task => (
          <Card key={task.id}>
            <Link className="font-bold text-navy-800 hover:text-navy-600" href={task.calendarItem ? `/dashboard/content-workflow/${task.id}/article` : `/dashboard/content-workflow/${task.id}`}>{task.title}</Link>
            <p className="my-2"><Badge>{workflowLabels[task.status]}</Badge></p>
            <ImageGuidance value={task.article?.imageGuidance} />
            <AssignTask taskId={task.id} assigneeId={task.assigneeId} deadline={task.deadline?.toISOString().slice(0, 10) ?? ""} creators={creators} />
          </Card>
        ))}
      </div>
      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">معیارهای عملکرد کاربران</h2>
      <div className="overflow-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>کاربر</th>
              <th className={thClass}>نقش</th>
              <th className={thClass}>وظایف</th>
              <th className={thClass}>تکمیل‌شده</th>
              <th className={thClass}>در موعد</th>
            </tr>
          </thead>
          <tbody>{people.map(person => <PerformanceRow key={person.id} person={person} />)}</tbody>
        </table>
      </div>
    </>
  );
}

function PerformanceRow({ person }: { person: { id: string; name: string; role: string; _count: { assignedTasks: number }; assignedTasks: Array<{ status: string; deadline: Date | null; approvedAt: Date | null; publishedAt: Date | null }> } }) {
  const completed = person.assignedTasks.filter(task => finished.has(task.status));
  const onTime = completed.filter(task => !task.deadline || (task.publishedAt ?? task.approvedAt ?? new Date()) <= task.deadline).length;
  return (
    <tr>
      <td className={tdClass}>{person.name}</td>
      <td className={tdClass}>{person.role === Roles.ADMIN ? "مدیر" : person.role === Roles.LAWYER ? "وکیل" : "تولیدکننده"}</td>
      <td className={tdClass}>{person._count.assignedTasks}</td>
      <td className={tdClass}>{completed.length}</td>
      <td className={tdClass}>{completed.length ? `${Math.round((onTime / completed.length) * 100)}٪` : "—"}</td>
    </tr>
  );
}

function TaskTable({ tasks }: { tasks: Array<{ id: number; title: string; status: string; deadline: Date | null; assignee: { name: string }; calendarItem: { id: number } | null; article: { imageGuidance: string | null } | null }> }) {
  if (!tasks.length) return <Card>وظیفه‌ای موجود نیست.</Card>;
  return (
    <div className="overflow-auto">
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>عنوان</th>
            <th className={thClass}>نویسنده</th>
            <th className={thClass}>مهلت</th>
            <th className={thClass}>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td className={tdClass}>
                <Link className="hover:text-navy-700" href={task.calendarItem ? `/dashboard/content-workflow/${task.id}/article` : `/dashboard/content-workflow/${task.id}`}>{task.title}</Link>
                <ImageGuidance value={task.article?.imageGuidance} />
              </td>
              <td className={tdClass}>{task.assignee.name}</td>
              <td className={tdClass}>{task.deadline ? new Intl.DateTimeFormat("fa-IR").format(task.deadline) : "—"}</td>
              <td className={tdClass}><Badge>{workflowLabels[task.status]}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageGuidance({ value }: { value?: string | null }) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { description?: unknown };
    if (typeof parsed.description !== "string" || !parsed.description.trim()) return null;
    return <p className="mt-2 text-xs leading-6 text-gold-800"><b>راهنمای تصویر:</b> {parsed.description}</p>;
  } catch {
    return null;
  }
}
