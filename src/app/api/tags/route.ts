import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const tags = await db.tag.findMany({
    where: category ? { category } : undefined,
    orderBy: { nameFA: "asc" },
    select: { id: true, nameFA: true, nameEN: true, slug: true, category: true },
  });

  return NextResponse.json({ tags });
}
