import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Scale, BookOpen, FileText, Layers, Grid3X3, Hash, Landmark,
  Plus, Eye, Trash2, Search,
} from "lucide-react";
import LawDeleteButton from "@/components/dashboard/LawDeleteButton";

const TYPE_LABELS: Record<string, string> = {
  LAW: "قانون",
  BOOK: "کتاب",
  PART: "بخش",
  CHAPTER: "باب",
  SECTION: "فصل",
  SUBSECTION: "مبحث",
  ARTICLE: "ماده",
};

export default async function AdminLawsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  const isRTL = locale === "fa";

  const laws = await db.legalNode.findMany({
    where: { type: "LAW" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      lawKey: true,
      adoptionDate: true,
      adoptionAuthority: true,
      createdAt: true,
    },
  });

  const lawIds = laws.map((l) => l.id);
  const nodeCounts = await db.legalNode.groupBy({
    by: ["lawId"],
    where: { lawId: { in: lawIds } },
    _count: { id: true },
  });
  const countMap = new Map(nodeCounts.map((c) => [c.lawId, c._count.id]));

  const articleCounts = await db.legalNode.groupBy({
    by: ["lawId"],
    where: { lawId: { in: lawIds }, type: "ARTICLE" },
    _count: { id: true },
  });
  const articleCountMap = new Map(articleCounts.map((c) => [c.lawId, c._count.id]));

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? "مدیریت قوانین" : "Laws Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRTL
              ? `${laws.length} قانون در سیستم ثبت شده است`
              : `${laws.length} laws in the system`}
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard/laws/import`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isRTL ? "وارد کردن قانون جدید" : "Import New Law"}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <Scale className="w-6 h-6 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{laws.length}</div>
          <div className="text-xs text-gray-500">{isRTL ? "قوانین" : "Laws"}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <FileText className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(articleCountMap.values()).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-xs text-gray-500">{isRTL ? "مواد" : "Articles"}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <Layers className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(countMap.values()).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-xs text-gray-500">{isRTL ? "کل نودها" : "Total Nodes"}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <Landmark className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {new Set(laws.map((l) => l.adoptionAuthority).filter(Boolean)).size}
          </div>
          <div className="text-xs text-gray-500">{isRTL ? "مراجع تصویب" : "Authorities"}</div>
        </div>
      </div>

      {/* Laws list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-start px-5 py-3.5 font-semibold text-gray-600">#</th>
                <th className="text-start px-5 py-3.5 font-semibold text-gray-600">
                  {isRTL ? "عنوان قانون" : "Law Title"}
                </th>
                <th className="text-start px-5 py-3.5 font-semibold text-gray-600">
                  {isRTL ? "کلید" : "Key"}
                </th>
                <th className="text-center px-5 py-3.5 font-semibold text-gray-600">
                  {isRTL ? "مواد" : "Articles"}
                </th>
                <th className="text-center px-5 py-3.5 font-semibold text-gray-600">
                  {isRTL ? "نودها" : "Nodes"}
                </th>
                <th className="text-start px-5 py-3.5 font-semibold text-gray-600">
                  {isRTL ? "تاریخ تصویب" : "Adoption Date"}
                </th>
                <th className="text-end px-5 py-3.5 font-semibold text-gray-600">
                  {isRTL ? "عملیات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {laws.map((law, idx) => (
                <tr key={law.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate" title={law.title}>
                      {law.title}
                    </div>
                    {law.adoptionAuthority && (
                      <div className="text-xs text-gray-400 mt-0.5">{law.adoptionAuthority}</div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-lg text-xs font-mono">
                      {law.lawKey || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-700">
                    {articleCountMap.get(law.id) ?? 0}
                  </td>
                  <td className="px-5 py-3 text-center text-gray-700">
                    {countMap.get(law.id) ?? 0}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {law.adoptionDate || "-"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/${locale}/laws/${law.lawKey || law.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {isRTL ? "مشاهده" : "View"}
                      </Link>
                      <LawDeleteButton lawId={law.id} lawTitle={law.title} locale={locale} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {laws.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isRTL ? "هیچ قانونی ثبت نشده" : "No laws found"}</p>
            <Link
              href={`/${locale}/dashboard/laws/import`}
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              {isRTL ? "اولین قانون را وارد کنید" : "Import your first law"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
