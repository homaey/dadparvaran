import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const indices = await db.priceIndex.findMany({
    where: { jalaliMonth: { gte: 1 } },
    select: { jalaliYear: true, jalaliMonth: true },
    orderBy: [{ jalaliYear: "asc" }, { jalaliMonth: "asc" }],
  });

  const years = [...new Set(indices.map((i) => i.jalaliYear))].sort((a, b) => a - b);

  const monthsByYear: Record<number, number[]> = {};
  for (const idx of indices) {
    if (!monthsByYear[idx.jalaliYear]) monthsByYear[idx.jalaliYear] = [];
    monthsByYear[idx.jalaliYear].push(idx.jalaliMonth);
  }

  return NextResponse.json({ years, monthsByYear });
}
