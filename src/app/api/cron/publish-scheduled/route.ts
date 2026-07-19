import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const articles = await db.article.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    select: { id: true, title: true, scheduledAt: true },
  });

  if (articles.length === 0) {
    return NextResponse.json({ published: 0, message: "هیچ مقاله‌ای برای انتشار وجود ندارد" });
  }

  const ids = articles.map((a) => a.id);
  await db.article.updateMany({
    where: { id: { in: ids } },
    data: { status: "PUBLISHED", publishedAt: now },
  });

  return NextResponse.json({
    published: ids.length,
    articles: articles.map((a) => ({ id: a.id, title: a.title })),
  });
}
