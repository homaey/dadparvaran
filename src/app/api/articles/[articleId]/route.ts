import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { canDirectPublish } from "@/modules/article-publishing/policy";
import { detectSensitivePersonalData } from "@/modules/content-safety/pii";

const updateSchema = z.object({
  title: z.string().min(10),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  blocks: z.array(z.any()).min(1),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  readTimeMin: z.number().int().min(1).max(60).default(5),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  authorId: z.number().int().positive().optional(),
});

async function authorizeArticle(articleId: number) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const teamMemberId = (session?.user as { teamMemberId?: number | null } | undefined)?.teamMemberId;
  if (!session?.user || !["LAWYER", "ADMIN", "CONTENT_CREATOR"].includes(role ?? "")) return { error: "دسترسی غیرمجاز", status: 403 } as const;
  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) return { error: "مقاله یافت نشد", status: 404 } as const;
  if (role === "LAWYER" && article.authorId !== teamMemberId) return { error: "دسترسی غیرمجاز", status: 403 } as const;
  if (role === "CONTENT_CREATOR" && article.status === "PUBLISHED") return { error: "مقاله منتشرشده فقط توسط مدیر قابل ویرایش است", status: 403 } as const;
  return { article, role, teamMemberId };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const articleId = Number((await params).articleId);
  if (!Number.isInteger(articleId)) return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
  const auth = await authorizeArticle(articleId);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const tagRows = await db.taggable.findMany({ where: { taggableType: "ARTICLE", taggableId: articleId }, include: { tag: { select: { slug: true } } } });
  let blocks: unknown[] = [];
  try { blocks = JSON.parse(auth.article.blocks); } catch { blocks = []; }
  return NextResponse.json({ article: { ...auth.article, blocks, tags: tagRows.map((row) => row.tag.slug) } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const articleId = Number((await params).articleId);
  if (!Number.isInteger(articleId)) return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
  const auth = await authorizeArticle(articleId);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "داده نامعتبر است" }, { status: 400 });
  if (parsed.data.status === "PUBLISHED" && !canDirectPublish(auth.role))
    return NextResponse.json(
      { error: "انتشار مستقیم مجاز نیست؛ مقاله را برای تأیید ادمین ارسال کنید" },
      { status: 403 },
    );
  if (parsed.data.status === "PUBLISHED" && detectSensitivePersonalData(JSON.stringify(parsed.data.blocks)).length)
    return NextResponse.json({ error: "پیش از انتشار، اطلاعات شخصی احتمالی را از مقاله حذف کنید" }, { status: 409 });
  const duplicate = await db.article.findFirst({ where: { slug: parsed.data.slug, id: { not: articleId } }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: "این slug قبلاً استفاده شده است" }, { status: 409 });
  const canChooseAuthor = auth.role === "ADMIN" || auth.role === "CONTENT_CREATOR";
  const resolvedAuthorId = canChooseAuthor && parsed.data.authorId ? parsed.data.authorId : auth.article.authorId;
  const approvedAuthor = await db.teamMember.findFirst({
    where: { id: resolvedAuthorId, status: "APPROVED", isActive: true },
    select: { id: true },
  });
  if (!approvedAuthor) return NextResponse.json({ error: "نویسنده انتخاب‌شده فعال یا تأییدشده نیست" }, { status: 400 });
  const tags = parsed.data.tags.length
    ? await db.tag.findMany({ where: { slug: { in: parsed.data.tags } }, select: { id: true } })
    : [];
  const { categoryId, blocks, tags: _tags, authorId: _authorId, ...rest } = parsed.data;
  const article = await db.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: articleId },
      data: {
        ...rest,
        authorId: resolvedAuthorId,
        blocks: JSON.stringify(blocks),
        publishedAt: rest.status === "PUBLISHED" ? auth.article.publishedAt ?? new Date() : null,
        ...(categoryId ? { categoryId } : {}),
      },
    });
    await tx.taggable.deleteMany({ where: { taggableType: "ARTICLE", taggableId: articleId } });
    for (const tag of tags) {
      await tx.taggable.create({ data: { tagId: tag.id, taggableType: "ARTICLE", taggableId: articleId } });
    }
    return updated;
  });
  return NextResponse.json({ article });
}
