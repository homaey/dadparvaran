import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [categories, templates] = await Promise.all([
    db.legalFormCategory.findMany({
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    }),
    db.legalFormTemplate.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
  ]);

  return NextResponse.json({ categories, templates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { slug, categoryId, docType, titleFA, titleEN, descFA, descEN, content, isPublished, order } = body;
  if (!slug || !docType || !titleFA) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const template = await db.legalFormTemplate.create({
    data: {
      slug,
      categoryId: categoryId || null,
      docType,
      titleFA,
      titleEN: titleEN || "",
      descFA: descFA || "",
      descEN: descEN || "",
      content: content || "",
      isPublished: isPublished ?? true,
      order: order ?? 0,
    },
  });
  return NextResponse.json(template, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const template = await db.legalFormTemplate.update({ where: { id }, data });
  return NextResponse.json(template);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.legalFormTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
