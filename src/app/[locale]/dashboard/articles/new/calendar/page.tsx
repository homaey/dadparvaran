import { notFound } from "next/navigation";
import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, Badge, btnPrimary, tableClass, thClass, tdClass } from "@/components/ui";
import { articleTypeLabels, legalCategoryLabels } from "@/modules/content-strategy/constants";

export default async function CalendarArticles() {
  const user = await requireUser([Roles.LAWYER, Roles.CONTENT_CREATOR, Roles.ADMIN]);
  if (!user) notFound();

  // همه مقاله‌های ارجاعی تا زمان انتشار در همین فهرست می‌مانند تا کاربر مرحله بعد را گم نکند.
  const tasks = await db.task.findMany({
    where: {
      ...(user.role === Roles.ADMIN ? {} : { assigneeId: user.userId }),
      calendarItem: { isNot: null },
      status: { not: TaskStatus.PUBLISHED },
    },
    include: { calendarItem: true, article: { select: { id: true, imageGuidance: true } } },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fa-display text-2xl font-bold text-navy-900">مقالات ارجاعی</h1>
        <p className="mt-1 text-gray-500">
          موضوع را انتخاب کنید؛ سیستم در هر مرحله فقط اقدام بعدی را به شما نشان می‌دهد.
        </p>
      </div>

      <Card>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>عنوان</th>
              <th className={thClass}>مهلت</th>
              <th className={thClass}>وضعیت</th>
              <th className={thClass}>اقدام بعدی</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const action = taskPresentation(task.status, Boolean(task.article), user.role === Roles.ADMIN, task.assigneeId === user.userId);
              const imageGuide = imageGuideSummary(task.article?.imageGuidance ?? null);
              return (
              <tr key={task.id}>
                <td className={tdClass}>
                  <p className="font-medium text-navy-900">{task.title}</p>
                  {task.calendarItem && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <Badge>نوع: {articleTypeLabels[task.calendarItem.articleType] ?? task.calendarItem.articleType}</Badge>
                      <span className="text-gray-500">حوزه: {legalCategoryLabels[task.calendarItem.legalCategory] ?? task.calendarItem.legalCategory}</span>
                    </div>
                  )}
                  {task.calendarItem?.keyword && <p className="mt-1 text-xs text-gray-500">کلیدواژه: {task.calendarItem.keyword}</p>}
                  {imageGuide && (
                    <p className="mt-2 max-w-2xl rounded-lg bg-blue-50 px-3 py-2 text-xs leading-6 text-blue-900">
                      <b>راهنمای تصویر:</b> {imageGuide}
                    </p>
                  )}
                </td>
                <td className={tdClass}>
                  {task.deadline ? new Intl.DateTimeFormat("fa-IR").format(task.deadline) : "—"}
                </td>
                <td className={tdClass}>
                  <Badge className={action.badgeClass}>{action.statusLabel}</Badge>
                </td>
                <td className={tdClass}>
                  <Link className={btnPrimary} href={action.quality ? `/dashboard/content-workflow/${task.id}/article/quality` : `/dashboard/content-workflow/${task.id}/article`}>
                    {action.actionLabel}
                  </Link>
                </td>
              </tr>
            )})}
            {tasks.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={4}>
                  موضوعی در تقویم به شما اختصاص نیافته است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function taskPresentation(status: string, hasArticle: boolean, isAdmin: boolean, isAssignee: boolean) {
  if (!hasArticle)
    return {
      statusLabel: isAssignee ? "آماده ساخت" : "ارجاع‌شده به نویسنده",
      actionLabel: isAssignee ? "ساخت مقاله" : "مشاهده تسک",
      quality: false,
      badgeClass: "",
    };
  if (status === TaskStatus.REVISION)
    return { statusLabel: "نیازمند اصلاح", actionLabel: "اصلاح مقاله", quality: false, badgeClass: "!bg-amber-100 !text-amber-800" };
  if (status === TaskStatus.REVIEW)
    return {
      statusLabel: "منتظر تأیید مدیر",
      actionLabel: isAdmin ? "بررسی نهایی" : "مشاهده وضعیت",
      quality: isAdmin,
      badgeClass: "!bg-blue-100 !text-blue-800",
    };
  if (status === TaskStatus.APPROVED)
    return {
      statusLabel: "آماده انتشار",
      actionLabel: isAdmin ? "انتشار مقاله" : "مشاهده وضعیت",
      quality: isAdmin,
      badgeClass: "!bg-green-100 !text-green-800",
    };
  return { statusLabel: "پیش‌نویس", actionLabel: isAssignee ? "ادامه ویرایش" : "مشاهده پیش‌نویس", quality: false, badgeClass: "" };
}

function imageGuideSummary(raw: string | null) {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as { description?: unknown; characteristics?: unknown };
    const description = typeof value.description === "string" ? value.description.trim() : "";
    const characteristics = Array.isArray(value.characteristics)
      ? value.characteristics.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 3)
      : [];
    return [description, ...characteristics].filter(Boolean).join(" — ") || null;
  } catch {
    return null;
  }
}
