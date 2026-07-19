import { Roles } from "@/lib/roles";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadQualityArticle } from "@/modules/quality-review/context";
import QualityPanel from "./quality-panel";
import { TaskStatus } from "@/lib/content-enums";

export default async function QualityPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) notFound();
  const id = Number((await params).id);
  const article = await db.contentArticle.findUnique({
    where: { taskId: id },
    include: {
      task: true,
      blocks: { select: { key: true, label: true } },
      qualityReviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!article?.task || (user.role !== Roles.ADMIN && article.task.assigneeId !== user.userId)) notFound();
  let signature = "";
  try { signature = (await loadQualityArticle(article.id)).signature; } catch {}
  return (
    <>
      <header className="mb-6">
        <div>
          <h1 className="font-fa-display text-2xl font-bold text-navy-900">بررسی نهایی مقاله</h1>
          <p className="mt-1 text-gray-500">کنترل خودکار متن، تصمیم مدیر و انتشار در یک مسیر</p>
        </div>
      </header>
      <QualityPanel
        taskId={id}
        taskStatus={article.task.status}
        articleId={article.id}
        canRun={user.role === Roles.ADMIN && article.task.status === TaskStatus.REVIEW}
        canDecide={user.role === Roles.ADMIN}
        currentSignature={signature}
        blockLabels={Object.fromEntries(article.blocks.map((block) => [block.key, block.label]))}
        reviews={article.qualityReviews.map(r => ({ id: r.id, status: r.status, legalScore: r.legalScore, seoScore: r.seoScore, readabilityScore: r.readabilityScore, legalSummary: r.legalSummary, seoSummary: r.seoSummary, legalFindings: r.legalFindings, seoFindings: r.seoFindings, metaDescription: r.metaDescription, humanNote: r.humanNote, contentSignature: r.contentSignature, createdAt: r.createdAt.toISOString() }))}
      />
    </>
  );
}
