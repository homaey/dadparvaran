import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const UpsertSchema = z.object({
  jalaliYear: z.coerce.number().int().min(1300).max(1600),
  amount: z.coerce.number().int().positive(),
  sourceTitle: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const rates = await db.diyeRate.findMany({
    orderBy: { jalaliYear: "desc" },
  });
  return NextResponse.json(
    rates.map((r) => ({ ...r, amount: r.amount.toString() }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  try {
    const payload = UpsertSchema.parse(await req.json());
    await db.diyeRate.upsert({
      where: { jalaliYear: payload.jalaliYear },
      update: {
        amount: BigInt(payload.amount),
        sourceTitle: payload.sourceTitle || null,
        sourceUrl: payload.sourceUrl || null,
      },
      create: {
        jalaliYear: payload.jalaliYear,
        amount: BigInt(payload.amount),
        sourceTitle: payload.sourceTitle || null,
        sourceUrl: payload.sourceUrl || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطا" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await req.json();
  await db.diyeRate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
