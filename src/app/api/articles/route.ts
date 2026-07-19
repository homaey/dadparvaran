import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { canDirectPublish } from "@/modules/article-publishing/policy";
import { detectSensitivePersonalData } from "@/modules/content-safety/pii";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "9")));
  const category = searchParams.get("category");
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category: { slug: category } } : {}),
  };

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readTimeMin: true,
        publishedAt: true,
        viewCount: true,
        category: { select: { nameFA: true, nameEN: true, slug: true } },
        author: { select: { nameFA: true, nameEN: true, slug: true } },
      },
    }),
    db.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

const createSchema = z.object({
  title: z.string().min(10),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  blocks: z.array(z.any()).default([]),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  readTimeMin: z.number().default(5),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  authorId: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const teamMemberId = (session?.user as any)?.teamMemberId;
  const teamMemberStatus = (session?.user as any)?.teamMemberStatus;

  if (!session?.user || !["LAWYER", "ADMIN", "CONTENT_CREATOR"].includes(role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  if (role === "LAWYER" && teamMemberStatus !== "APPROVED") {
    return NextResponse.json({ error: "فقط وکلای تأیید شده می‌توانند مقاله منتشر کنند" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    if (data.status === "PUBLISHED" && !canDirectPublish(role)) {
      return NextResponse.json(
        { error: "انتشار مستقیم مجاز نیست؛ مقاله را به‌صورت پیش‌نویس ذخیره و برای تأیید ادمین ارسال کنید" },
        { status: 403 },
      );
    }
    if (data.status === "PUBLISHED" && detectSensitivePersonalData(JSON.stringify(data.blocks)).length) {
      return NextResponse.json({ error: "پیش از انتشار، اطلاعات شخصی احتمالی را از مقاله حذف کنید" }, { status: 409 });
    }

    const existing = await db.article.findFirst({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "این slug قبلاً استفاده شده است" }, { status: 409 });
    }

    const canChooseAuthor = role === "ADMIN" || role === "CONTENT_CREATOR";
    const resolvedAuthorId = canChooseAuthor && data.authorId ? data.authorId : teamMemberId;

    if (!resolvedAuthorId) {
      return NextResponse.json({ error: "نویسنده مقاله را انتخاب کنید" }, { status: 400 });
    }

    const approvedAuthor = await db.teamMember.findFirst({
      where: { id: resolvedAuthorId, status: "APPROVED", isActive: true },
      select: { id: true },
    });
    if (!approvedAuthor) {
      return NextResponse.json({ error: "نویسنده انتخاب‌شده فعال یا تأییدشده نیست" }, { status: 400 });
    }

    const { categoryId, tags, blocks, authorId: _aid, ...rest } = data;
    const article = await db.article.create({
      data: {
        ...rest,
        blocks: JSON.stringify(blocks),
        author: { connect: { id: resolvedAuthorId } },
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });

    if (tags.length > 0) {
      for (const tagSlug of tags) {
        const tag = await db.tag.findUnique({ where: { slug: tagSlug } });
        if (tag) {
          await db.taggable.upsert({
            where: { tagId_taggableType_taggableId: { tagId: tag.id, taggableType: "ARTICLE", taggableId: article.id } },
            update: {},
            create: { tagId: tag.id, taggableType: "ARTICLE", taggableId: article.id },
          });
        }
      }
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
