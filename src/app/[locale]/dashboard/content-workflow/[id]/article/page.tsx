import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { notFound } from "next/navigation";

import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadArticleContext } from "@/modules/article-engine/context";
import { getTemplate, templateForArticleType } from "@/modules/article-engine/templates";
import { articleTypeLabels, legalCategoryLabels } from "@/modules/content-strategy/constants";
import { Badge, noticeClass } from "@/components/ui";
import ArticleEditor from "./article-editor";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) notFound();
  const id = Number((await params).id);
  let data;
  try { data = await loadArticleContext(id); } catch { notFound(); }
  if (user.role !== Roles.ADMIN && data.task.assigneeId !== user.userId) notFound();
  const article = await db.contentArticle.findUnique({ where: { taskId: id }, include: { blocks: { orderBy: { position: "asc" } } } });
  const templateKey = templateForArticleType(data.item.articleType);
  const locked = new Set<string>([TaskStatus.REVIEW, TaskStatus.APPROVED, TaskStatus.PUBLISHED]).has(data.task.status);
  const isAssignee = data.task.assigneeId === user.userId;
  const editable = isAssignee && !locked;
  return (
    <>
      <header className="mb-6">
        <Link className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-700" href="/dashboard/articles/new/calendar">
          <ArrowRight className="h-4 w-4" /> بازگشت به مقالات ارجاعی
        </Link>
        <div>
          <h1 className="font-fa-display text-2xl font-bold text-navy-900">
            {article ? "پیش‌نویس مقاله ارجاعی" : "ساخت مقاله ارجاعی"}
          </h1>
          <p className="mt-1 text-gray-700">{data.task.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Badge>نوع محتوا: {articleTypeLabels[data.item.articleType] ?? data.item.articleType}</Badge>
            <span className="text-gray-500">حوزه حقوقی: {legalCategoryLabels[data.item.legalCategory] ?? data.item.legalCategory}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">موضوع، ساختار و پرامپت‌های این مقاله از تقویم محتوای تأییدشده دریافت شده است.</p>
        </div>
      </header>
      <p className={`${noticeClass} mb-6`}>پیش از ارسال، مواد قانونی، تاریخ‌ها، اعداد و ادعاهای حقوقی را کنترل کنید.</p>
      <ArticleEditor
        taskId={id}
        taskStatus={data.task.status}
        feedback={data.task.reviewFeedback ?? ""}
        editable={editable}
        isAssignee={isAssignee}
        isAdmin={user.role === Roles.ADMIN}
        definitions={getTemplate(templateKey)}
        article={article ? { id: article.id, blocks: article.blocks.map(b => ({ id: b.id, key: b.key, label: b.label, content: b.content, version: b.version })), coverImage: article.coverImage, imageGuidance: article.imageGuidance } : null}
      />
    </>
  );
}
