import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, Eye, Edit2, BookOpen, Clock } from "lucide-react";
import ArticleCreationOptions from "@/components/dashboard/ArticleCreationOptions";

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const teamMemberId = (session?.user as any)?.teamMemberId;

  if (!["LAWYER", "ADMIN", "CONTENT_CREATOR"].includes(role)) {
    redirect(`/${locale}/dashboard`);
  }

  const isRTL = locale === "fa";

  const articles = await db.article.findMany({
    where: role === "LAWYER" ? { authorId: teamMemberId } : {},
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { nameFA: true, nameEN: true } },
      author: true,
    },
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: isRTL ? "پیش‌نویس" : "Draft", color: "bg-gray-100 text-gray-600" },
    SCHEDULED: { label: isRTL ? "زمان‌بندی‌شده" : "Scheduled", color: "bg-blue-100 text-blue-700" },
    PUBLISHED: { label: isRTL ? "منتشر شده" : "Published", color: "bg-green-100 text-green-700" },
    ARCHIVED: { label: isRTL ? "بایگانی" : "Archived", color: "bg-yellow-100 text-yellow-700" },
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRTL ? "مقالات" : "Articles"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isRTL ? "روش ساخت مقاله را انتخاب کنید." : "Choose how you want to create an article."}
        </p>
      </div>

      <ArticleCreationOptions locale={locale} />

      <h2 className="text-lg font-bold text-gray-900">
        {isRTL ? "مقالات ذخیره‌شده" : "Saved Articles"}
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isRTL ? "هنوز مقاله‌ای ندارید" : "No articles yet"}</p>
            <Link
              href={`/${locale}/dashboard/articles/new`}
              className="mt-4 inline-flex items-center gap-1.5 text-primary-600 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {isRTL ? "اولین مقاله را بنویسید" : "Write your first article"}
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-start">{isRTL ? "عنوان" : "Title"}</th>
                <th className="px-6 py-3 text-start">{isRTL ? "دسته‌بندی" : "Category"}</th>
                <th className="px-6 py-3 text-start">{isRTL ? "وضعیت" : "Status"}</th>
                <th className="px-6 py-3 text-start">{isRTL ? "بازدید" : "Views"}</th>
                <th className="px-6 py-3 text-start">{isRTL ? "تاریخ" : "Date"}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {articles.map((article: any) => {
                const s = statusMap[article.status];
                return (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {article.category ? (isRTL ? article.category.nameFA : article.category.nameEN) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{article.viewCount}</td>
                    <td className="px-6 py-4 text-xs">
                      {article.status === "SCHEDULED" && article.scheduledAt ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(article.scheduledAt).toLocaleDateString(isRTL ? "fa-IR" : "en-US")}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString(isRTL ? "fa-IR" : "en-US")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/${locale}/articles/${article.slug}`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/articles/${article.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
