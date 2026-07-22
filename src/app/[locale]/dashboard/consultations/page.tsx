import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ConsultationAdminActions } from "./ConsultationAdminActions";

export const dynamic = "force-dynamic";

export default async function ConsultationDashboardPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const user = await requireUser(["ADMIN"]);
  if (!user) redirect("/fa/auth/login");

  const status = searchParams?.status?.trim();
  const [requests, lawyers, openCount, staleOpen] = await Promise.all([
    db.consultationRequest.findMany({
      where: status ? { status } : undefined,
      include: { assignedLawyer: { select: { id: true, nameFA: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.teamMember.findMany({
      where: { isActive: true, baleAccount: { is: { isVerified: true, isActive: true } } },
      select: { id: true, nameFA: true },
      orderBy: { nameFA: "asc" },
    }),
    db.consultationRequest.count({ where: { status: "OPEN" } }),
    // درخواست بازِ بیش از ۲۴ ساعت یعنی هیچ وکیلی آن را برنداشته — همان چیزی که
    // مدیر باید ببیند، چون متقاضی در این مدت هیچ خبری نگرفته است.
    db.consultationRequest.count({
      where: { status: "OPEN", createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return (
    <main className="space-y-6 p-4 md:p-8" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold">درخواست‌های مشاوره</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          صف نظارتی مدیر — شامل درخواست‌های فرم سایت و مینی‌اپ بله. متن گفت‌وگوی خصوصی
          کاربر و وکیل در این سامانه ذخیره نمی‌شود.
        </p>
      </header>

      {(openCount > 0 || staleOpen > 0) && (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border bg-white px-4 py-3">
            <span className="block text-xs text-slate-500">در انتظار پذیرش</span>
            <span className="text-xl font-bold">{openCount}</span>
          </div>
          {staleOpen > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="block text-xs text-red-700">بیش از ۲۴ ساعت بی‌پاسخ</span>
              <span className="text-xl font-bold text-red-800">{staleOpen}</span>
            </div>
          )}
        </div>
      )}

      <nav className="flex flex-wrap gap-2 text-sm">
        {["", "OPEN", "ASSIGNED", "HANDOFF_SENT", "CONTACTED", "REFERRED", "NOT_A_FIT", "CLOSED"].map((item) => (
          <a key={item || "ALL"} href={item ? `?status=${item}` : "?"} className={`rounded-full border px-3 py-1.5 ${status === item || (!status && !item) ? "bg-slate-900 text-white" : "bg-white"}`}>
            {item || "همه"}
          </a>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1100px] text-right text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="p-3">کد</th><th className="p-3">متقاضی</th><th className="p-3">موضوع</th><th className="p-3">شهر</th><th className="p-3">فوریت</th><th className="p-3">وضعیت</th><th className="p-3">وکیل</th><th className="p-3">ثبت</th><th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const isWebForm = request.source === "WEB_FORM";
              return (
              <tr key={request.id} className="border-t align-top">
                <td className="p-3">
                  <div className="font-mono" dir="ltr">{request.publicCode}</div>
                  {/* مبدأ تعیین می‌کند واگذاری چطور انجام می‌شود؛ برای مدیر مهم‌ترین
                      نشانه است وقتی می‌خواهد پیگیری کند چرا کاربر پاسخ نگرفته. */}
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${isWebForm ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>
                    {isWebForm ? (request.userBaleId ? "سایت + بله" : "فرم سایت") : "بله"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-semibold">{request.clientName}</div>
                  {request.phone && (
                    <a href={`tel:${request.phone}`} dir="ltr" className="mt-0.5 block font-mono text-xs text-sky-700 hover:underline">
                      {request.phone}
                    </a>
                  )}
                  {request.email && <div className="mt-0.5 text-xs text-slate-500" dir="ltr">{request.email}</div>}
                  {request.preferredContact && <div className="mt-0.5 text-xs text-slate-500">{request.preferredContact}</div>}
                </td>
                <td className="p-3"><div className="font-semibold">{request.category}</div><div className="mt-1 max-w-xs line-clamp-2 text-xs text-slate-500">{request.summary}</div></td>
                <td className="p-3">{request.city}</td>
                <td className="p-3">{request.urgency}</td>
                <td className="p-3 font-mono text-xs">{request.status}</td>
                <td className="p-3">{request.assignedLawyer?.nameFA ?? "—"}</td>
                <td className="p-3 whitespace-nowrap">{new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(request.createdAt)}</td>
                <td className="p-3"><ConsultationAdminActions requestId={request.id} currentStatus={request.status} lawyers={lawyers} /></td>
              </tr>
              );
            })}
            {requests.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-slate-500">درخواستی یافت نشد.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
