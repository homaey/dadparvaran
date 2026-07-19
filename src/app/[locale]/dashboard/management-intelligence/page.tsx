import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, MetricCard, tableClass, thClass, tdClass } from "@/components/ui";

const done = [TaskStatus.APPROVED, TaskStatus.PUBLISHED];

export default async function Intelligence() {
  await requireUser([Roles.ADMIN]);
  const t = await getTranslations("content.managementIntelligence");
  const now = new Date();
  const [completed, delayed, generated, published, quality, people, categories, alerts] = await Promise.all([
    db.task.count({ where: { status: { in: done } } }),
    db.task.count({ where: { OR: [{ status: TaskStatus.OVERDUE }, { deadline: { lt: now }, status: { notIn: done } }] } }),
    db.contentArticle.count(),
    db.task.count({ where: { status: TaskStatus.PUBLISHED } }),
    db.articleQualityReview.aggregate({ _avg: { legalScore: true, seoScore: true, readabilityScore: true } }),
    db.user.findMany({ where: { role: { not: Roles.ADMIN } }, select: { id: true, name: true, role: true, assignedTasks: { select: { status: true } }, reviewTasks: { select: { status: true } } } }),
    db.contentCalendarItem.groupBy({ by: ["legalCategory"], _count: { _all: true }, orderBy: { _count: { legalCategory: "desc" } } }),
    db.notification.findMany({ where: { user: { role: Roles.ADMIN }, type: { in: ["OVERDUE_ALERT", "ARTICLE_INACTIVE", "WORKFLOW_STUCK"] } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const maxCategory = Math.max(1, ...categories.map(c => c._count._all));

  return (
    <>
      <header className="mb-8">
        <h1 className="font-fa-display text-2xl font-bold text-navy-900">{t("title")}</h1>
        <p className="mt-1 text-gray-500">{t("subtitle")}</p>
      </header>

      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">عملکرد</h2>
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard title="مقالات تکمیل‌شده" value={completed} />
        <MetricCard title="مقالات با تأخیر" value={delayed} />
        <MetricCard title="میانگین حقوقی" value={Math.round(quality._avg.legalScore ?? 0)} suffix="/100" />
        <MetricCard title="میانگین SEO" value={Math.round(quality._avg.seoScore ?? 0)} suffix="/100" />
        <MetricCard title="خوانایی" value={Math.round(quality._avg.readabilityScore ?? 0)} suffix="/100" />
      </section>

      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">بهره‌وری تیم</h2>
      <div className="mb-8 overflow-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>عضو تیم</th>
              <th className={thClass}>نقش</th>
              <th className={thClass}>کل وظایف</th>
              <th className={thClass}>تکمیل‌شده</th>
              <th className={thClass}>نرخ تکمیل</th>
            </tr>
          </thead>
          <tbody>
            {people.map(p => {
              const tasks = p.role === Roles.CONTENT_CREATOR ? p.assignedTasks : p.reviewTasks;
              const finished = tasks.filter(task => done.includes(task.status as typeof TaskStatus.APPROVED | typeof TaskStatus.PUBLISHED)).length;
              return (
                <tr key={p.id}>
                  <td className={tdClass}>{p.name}</td>
                  <td className={tdClass}>{p.role === Roles.CONTENT_CREATOR ? "تولیدکننده" : "بازبین حقوقی"}</td>
                  <td className={tdClass}>{tasks.length}</td>
                  <td className={tdClass}>{finished}</td>
                  <td className={tdClass}>{tasks.length ? Math.round((finished / tasks.length) * 100) : 0}٪</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">تحلیل محتوا</h2>
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard title="مقالات تولیدشده" value={generated} />
        <MetricCard title="مقالات منتشرشده" value={published} />
        <Card>
          <b className="text-navy-900">توزیع دسته‌ها</b>
          {categories.map(c => (
            <div key={c.legalCategory} className="mt-3 grid gap-1.5">
              <span className="text-sm text-gray-600">{c.legalCategory} ({c._count._all})</span>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200"><i className="block h-full bg-gradient-to-l from-navy-700 to-gold-400" style={{ width: `${(c._count._all / maxCategory) * 100}%` }} /></div>
            </div>
          ))}
        </Card>
      </section>

      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">هشدارهای اخیر</h2>
      {alerts.length ? (
        <div className="grid gap-3">
          {alerts.map(a => (
            <Card key={a.id} className="border-r-4 border-r-red-400">
              <b className="text-navy-900">{a.title}</b>
              <p className="my-1 text-gray-600">{a.message}</p>
              <small className="text-gray-400">{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(a.createdAt)}</small>
            </Card>
          ))}
        </div>
      ) : (
        <Card>هشدار فعالی ثبت نشده است.</Card>
      )}
    </>
  );
}
