import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LayoutDashboard, BookOpen, ShieldCheck, AlertCircle } from "lucide-react";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const teamMemberId = (session?.user as any)?.teamMemberId;

  let stats: { label: string; value: number | string; icon: any; color: string }[] = [];

  if (role === "LAWYER" && teamMemberId) {
    const articleCount = await db.article.count({ where: { authorId: teamMemberId } });

    stats = [
      { label: isRTL ? "مقالات من" : "My Articles", value: articleCount, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
    ];
  }

  if (role === "ADMIN") {
    const [approvedMembers, pendingMembers, articles] = await Promise.all([
      db.teamMember.count({ where: { status: "APPROVED" } }),
      db.teamMember.count({ where: { status: "PENDING" } }),
      db.article.count({ where: { status: "PUBLISHED" } }),
    ]);

    stats = [
      { label: isRTL ? "وکلای تأیید‌شده" : "Approved Lawyers", value: approvedMembers, icon: ShieldCheck, color: "bg-green-50 text-green-600" },
      { label: isRTL ? "وکلا در انتظار" : "Pending Lawyers", value: pendingMembers, icon: AlertCircle, color: "bg-yellow-50 text-yellow-600" },
      { label: isRTL ? "مقالات منتشر‌شده" : "Published Articles", value: articles, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
    ];
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRTL ? `خوش آمدید، ${session?.user?.name}` : `Welcome, ${session?.user?.name}`}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString(isRTL ? "fa-IR" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {role === "LAWYER" && (session?.user as any)?.teamMemberStatus === "PENDING" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">
              {isRTL ? "حساب شما در انتظار تأیید است" : "Your account is pending approval"}
            </h3>
            <p className="text-yellow-700 text-sm mt-1">
              {isRTL
                ? "مدارک شما توسط ادمین بررسی می‌شود. معمولاً ۲۴ تا ۴۸ ساعت طول می‌کشد."
                : "Your documents are being reviewed by admin. Usually takes 24-48 hours."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
