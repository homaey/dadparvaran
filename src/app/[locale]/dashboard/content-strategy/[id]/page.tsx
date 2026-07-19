import { Roles } from "@/lib/roles";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { articleTypeLabels } from "@/modules/content-strategy/constants";
import { Card, Badge, noticeClass } from "@/components/ui";
import CalendarReview from "./review";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser([Roles.ADMIN]);
  const id = Number((await params).id);
  const [plan, users] = await Promise.all([
    db.contentPlan.findUnique({ where: { id }, include: { items: { orderBy: [{ deadline: "asc" }, { priorityScore: "desc" }] } } }),
    db.user.findMany({
      where: { role: { in: [Roles.ADMIN, Roles.LAWYER, Roles.CONTENT_CREATOR] } },
      select: { id: true, name: true },
    }),
  ]);
  if (!plan) notFound();
  const raw = plan.typeDistribution;
  const distribution = (typeof raw === "string" ? JSON.parse(raw) : raw ?? []) as Array<{ articleType: keyof typeof articleTypeLabels; percentage: number }>;
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fa-display text-2xl font-bold text-navy-900">{plan.title}</h1>
          <p className="mt-1 text-gray-500">پیش‌نمایش، ویرایش و تأیید تقویم</p>
        </div>
        <Badge>{plan.status === "APPROVED" ? "تأییدشده" : "پیشنهاد AI — نیازمند تأیید مدیر"}</Badge>
      </header>
      <Card className="mb-6">
        <b className="text-navy-900">توزیع پیشنهادی محتوا</b>
        <div className="my-4 flex h-11 gap-1 overflow-hidden rounded-lg">
          {distribution.map(d => (
            <span key={d.articleType} style={{ width: `${d.percentage}%` }} title={articleTypeLabels[d.articleType]} className="grid min-w-[28px] place-items-center bg-navy-700 text-xs text-white">
              {d.percentage}٪
            </span>
          ))}
        </div>
        <small className="text-gray-500">{distribution.map(d => `${articleTypeLabels[d.articleType]}: ${d.percentage}٪`).join(" · ")}</small>
      </Card>
      <p className={`${noticeClass} mb-6`}>امتیازها برآورد راهبردی AI هستند و داده قطعی حجم جست‌وجو محسوب نمی‌شوند. تقویم تا تأیید مدیر به وظیفه تولید تبدیل نمی‌شود.</p>
      <CalendarReview
        planId={plan.id}
        approved={plan.status === "APPROVED"}
        users={users}
        items={plan.items.map(i => ({ ...i, deadline: i.deadline.toISOString(), priorityScore: Number(i.priorityScore) }))}
      />
    </>
  );
}
