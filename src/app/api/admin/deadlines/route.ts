import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deadlines = await db.legalDeadline.findMany({
    orderBy: [{ category: "asc" }, { orderIndex: "asc" }],
  });
  return NextResponse.json(deadlines);
}

const CreateSchema = z.object({
  category: z.string(),
  title: z.string().min(1),
  days: z.coerce.number().int().positive(),
  foreignDays: z.coerce.number().int().positive().nullable().optional(),
  article: z.string().nullable().optional(),
  defaultMode: z.string().nullable().optional(),
  orderIndex: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      let count = 0;
      for (const item of body) {
        const data = CreateSchema.parse(item);
        await db.legalDeadline.upsert({
          where: { category_title: { category: data.category, title: data.title } },
          update: { ...data, foreignDays: data.foreignDays ?? null, article: data.article ?? null, defaultMode: data.defaultMode ?? null },
          create: { ...data, foreignDays: data.foreignDays ?? null, article: data.article ?? null, defaultMode: data.defaultMode ?? null },
        });
        count++;
      }
      return NextResponse.json({ imported: count });
    }

    const data = CreateSchema.parse(body);
    const record = await db.legalDeadline.create({
      data: { ...data, foreignDays: data.foreignDays ?? null, article: data.article ?? null, defaultMode: data.defaultMode ?? null },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطا" },
      { status: 400 }
    );
  }
}

const UpdateSchema = z.object({
  id: z.coerce.number().int(),
  category: z.string().optional(),
  title: z.string().min(1).optional(),
  days: z.coerce.number().int().positive().optional(),
  foreignDays: z.coerce.number().int().positive().nullable().optional(),
  article: z.string().nullable().optional(),
  defaultMode: z.string().nullable().optional(),
  orderIndex: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = UpdateSchema.parse(await req.json());
    const { id, ...rest } = data;
    const record = await db.legalDeadline.update({
      where: { id },
      data: rest,
    });
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطا" },
      { status: 400 }
    );
  }
}
