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

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const year = req.nextUrl.searchParams.get("year");
  const where = year ? { jalaliYear: Number(year) } : {};
  const holidays = await db.holiday.findMany({
    where,
    orderBy: [{ jalaliYear: "asc" }, { jalaliMonth: "asc" }, { jalaliDay: "asc" }],
  });
  return NextResponse.json(holidays);
}

const HolidaySchema = z.object({
  jalaliYear: z.coerce.number().int().min(1300).max(1500),
  jalaliMonth: z.coerce.number().int().min(1).max(12),
  jalaliDay: z.coerce.number().int().min(1).max(31),
  title: z.string().nullable().optional(),
  isFixed: z.boolean().optional(),
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
        const data = HolidaySchema.parse(item);
        await db.holiday.upsert({
          where: {
            jalaliYear_jalaliMonth_jalaliDay: {
              jalaliYear: data.jalaliYear,
              jalaliMonth: data.jalaliMonth,
              jalaliDay: data.jalaliDay,
            },
          },
          update: { title: data.title ?? null, isFixed: data.isFixed ?? false },
          create: { ...data, title: data.title ?? null, isFixed: data.isFixed ?? false },
        });
        count++;
      }
      return NextResponse.json({ imported: count });
    }

    const data = HolidaySchema.parse(body);
    const record = await db.holiday.create({
      data: { ...data, title: data.title ?? null, isFixed: data.isFixed ?? false },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطا" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await db.holiday.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
