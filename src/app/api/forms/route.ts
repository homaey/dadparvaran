import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    const template = await db.legalFormTemplate.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(template);
  }

  const categories = await db.legalFormCategory.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      templates: {
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true, slug: true, docType: true,
          titleFA: true, titleEN: true,
          descFA: true, descEN: true, order: true,
        },
      },
      children: {
        orderBy: { order: "asc" },
        include: {
          templates: {
            where: { isPublished: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
            select: {
              id: true, slug: true, docType: true,
              titleFA: true, titleEN: true,
              descFA: true, descEN: true, order: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(categories);
}
