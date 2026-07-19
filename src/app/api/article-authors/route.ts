import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { Roles } from "@/lib/roles";

export async function GET() {
  const auth = await authorize([Roles.ADMIN, Roles.LAWYER, Roles.CONTENT_CREATOR]);
  if ("error" in auth) return auth.error;

  const members = await db.teamMember.findMany({
    where: { status: "APPROVED", isActive: true },
    select: { id: true, nameFA: true, nameEN: true },
    orderBy: [{ order: "asc" }, { nameFA: "asc" }],
  });

  return NextResponse.json({ members });
}
