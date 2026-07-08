import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  const data = row ? JSON.parse(row.data) : {};
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Merge with existing data
  const row = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  const existing = row ? JSON.parse(row.data) : {};
  const merged = { ...existing, ...body };

  await db.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", data: JSON.stringify(merged) },
    update: { data: JSON.stringify(merged) },
  });

  return NextResponse.json({ ok: true });
}
