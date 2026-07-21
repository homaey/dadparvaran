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
  const [requests, lawyers] = await Promise.all([
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
  ]);

  return (
    <main className="space-y-6 p-4 md:p-8" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold">درخواست‌های مشاوره بله</h1>
        <p className="mt-2 text-sm text-slate-600">صف نظارتی مدیر؛ متن گفت‌وگوی خصوصی کاربر و وکیل در این سامانه ذخیره نمی‌شود.</p>
      </header>

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
              <th className="p-3">کد</th><th className="p-3">موضوع</th><th className="p-3">شهر</th><th className="p-3">فوریت</th><th className="p-3">وضعیت</th><th className="p-3">وکیل</th><th className="p-3">ثبت</th><th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t align-top">
                <td className="p-3 font-mono" dir="ltr">{request.publicCode}</td>
                <td className="p-3"><div className="font-semibold">{request.category}</div><div className="mt-1 max-w-xs line-clamp-2 text-xs text-slate-500">{request.summary}</div></td>
                <td className="p-3">{request.city}</td>
                <td className="p-3">{request.urgency}</td>
                <td className="p-3 font-mono text-xs">{request.status}</td>
                <td className="p-3">{request.assignedLawyer?.nameFA ?? "—"}</td>
                <td className="p-3 whitespace-nowrap">{new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(request.createdAt)}</td>
                <td className="p-3"><ConsultationAdminActions requestId={request.id} currentStatus={request.status} lawyers={lawyers} /></td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-500">درخواستی یافت نشد.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
