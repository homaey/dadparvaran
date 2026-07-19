import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({ coverImage: z.string().min(1).max(500) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize([Roles.ADMIN, Roles.CONTENT_CREATOR, Roles.LAWYER]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "داده نامعتبر است" }, { status: 400 });

  const article = await db.contentArticle.findUnique({
    where: { taskId: id },
    include: { task: { select: { assigneeId: true } } },
  });
  if (!article) return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });

  if (article.task?.assigneeId !== auth.session.userId)
    return NextResponse.json({ error: "فقط مسئول این تسک می‌تواند تصویر مقاله را تغییر دهد" }, { status: 403 });

  await db.contentArticle.update({ where: { id: article.id }, data: { coverImage: p.data.coverImage } });
  return NextResponse.json({ ok: true });
}
