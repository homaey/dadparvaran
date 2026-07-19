import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { buildArticleExport, ExportNotReadyError } from "@/modules/article-export/serializer";

export async function GET(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const articleId = Number((await params).articleId);
  if (!Number.isInteger(articleId) || articleId < 1)
    return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
  const article = await db.contentArticle.findUnique({ where: { id: articleId }, select: { task: { select: { assigneeId: true, reviewerId: true } } } });
  if (!article?.task) return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
  if (auth.session.role !== Roles.ADMIN && article.task.assigneeId !== auth.session.userId && article.task.reviewerId !== auth.session.userId)
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  try {
    const data = await buildArticleExport(articleId);
    const download = new URL(req.url).searchParams.get("download") === "1";
    return NextResponse.json(data, { headers: download ? { "Content-Disposition": `attachment; filename="article-${articleId}.json"`, "Content-Type": "application/json; charset=utf-8" } : {} });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خروجی ناموفق بود" }, { status: error instanceof ExportNotReadyError ? 409 : 404 });
  }
}
