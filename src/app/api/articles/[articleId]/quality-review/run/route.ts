import { Roles } from "@/lib/roles";
import { TaskStatus } from "@/lib/content-enums";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { getAiConfig } from "@/lib/ai-provider";
import { loadQualityArticle } from "@/modules/quality-review/context";
import { runLegalReviewer, runSeoReviewer } from "@/modules/quality-review/reviewers";

export async function POST(_: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const articleId = Number((await params).articleId);
  try {
    const { article, reviewArticle, signature } = await loadQualityArticle(articleId);
    const task = article.task!;
    if (auth.session.role !== Roles.ADMIN && task.assigneeId !== auth.session.userId && task.reviewerId !== auth.session.userId)
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    if (task.status !== TaskStatus.REVIEW)
      return NextResponse.json({ error: "ارزیابی کیفیت فقط پس از ارسال مقاله به بازبینی قابل اجراست" }, { status: 409 });
    const [legal, seo, config] = await Promise.all([runLegalReviewer(reviewArticle), runSeoReviewer(reviewArticle), getAiConfig()]);
    const review = await db.articleQualityReview.create({
      data: {
        articleId,
        status: "AI_REVIEWED",
        legalScore: legal.score,
        seoScore: seo.score,
        readabilityScore: seo.readabilityScore,
        legalSummary: legal.summary,
        seoSummary: seo.summary,
        legalFindings: JSON.stringify({ findings: legal.findings, missingWarnings: legal.missingWarnings }),
        seoFindings: JSON.stringify(seo.findings),
        metaDescription: seo.metaDescription,
        contentSignature: signature,
        model: `${config.provider}:${config.model}`,
      },
    });
    return NextResponse.json({ id: review.id });
  } catch (error) {
    console.error("Quality review failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "ارزیابی کیفیت ناموفق بود" }, { status: 502 });
  }
}
