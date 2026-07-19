import { Roles } from "@/lib/roles";

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, Badge, btnPrimary, tableClass, thClass, tdClass } from "@/components/ui";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import DeletePlan from "./delete-plan";

const labels: Record<string, string> = { DRAFT: "پیش‌نویس", GENERATED: "نیازمند بررسی", APPROVED: "تأییدشده" };

export default async function Strategy() {
  await requireUser([Roles.ADMIN]);
  const t = await getTranslations("content.contentStrategy");
  const plans = await db.contentPlan.findMany({ include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fa-display text-2xl font-bold text-navy-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-navy-700" />
            {t("title")}
          </h1>
          <p className="mt-1 text-gray-500">{t("subtitle")}</p>
        </div>
        <Link className={`${btnPrimary} flex items-center gap-2`} href="/dashboard/content-strategy/generate">
          <Plus className="w-4 h-4" />
          {t("generateCta")}
        </Link>
      </header>
      {plans.length ? (
        <div className="overflow-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>عنوان</th>
                <th className={thClass}>دوره</th>
                <th className={thClass}>مقالات</th>
                <th className={thClass}>وضعیت</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id}>
                  <td className={tdClass}><Link className="hover:text-navy-700 font-medium" href={`/dashboard/content-strategy/${p.id}`}>{p.title}</Link></td>
                  <td className={tdClass}>{new Intl.DateTimeFormat("fa-IR").format(p.periodStart)} تا {new Intl.DateTimeFormat("fa-IR").format(p.periodEnd)}</td>
                  <td className={tdClass}>{p._count.items}</td>
                  <td className={tdClass}><Badge>{labels[p.status]}</Badge></td>
                  <td className={tdClass}><DeletePlan planId={p.id} title={p.title} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="text-center py-6">
          <Sparkles className="w-8 h-8 text-navy-400 mx-auto mb-2" />
          <p className="text-base font-bold text-navy-900 mb-1">هنوز تقویمی ایجاد نشده است</p>
          <p className="text-gray-500 text-sm mb-4">
            هوش مصنوعی مقالات منتشرشده و رقبای حقوقی را تحلیل کرده و موضوعات بهینه را پیشنهاد می‌دهد.
          </p>
          <Link className={`${btnPrimary} inline-flex items-center gap-2`} href="/dashboard/content-strategy/generate">
            <Plus className="w-4 h-4" />
            تهیه اولین تقویم محتوا
          </Link>
        </Card>
      )}
    </>
  );
}
