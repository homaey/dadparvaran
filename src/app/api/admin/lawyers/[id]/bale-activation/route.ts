import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createLawyerActivationCode } from "@/modules/consultations/activation";

export async function POST(_request: Request, context: { params: { id: string } }) {
  const user = await requireUser(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lawyerId = Number(context.params.id);
  if (!Number.isInteger(lawyerId)) return NextResponse.json({ error: "Invalid lawyer id" }, { status: 400 });
  const lawyer = await db.teamMember.findUnique({ where: { id: lawyerId }, select: { id: true } });
  if (!lawyer) return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });

  const activation = await createLawyerActivationCode(lawyerId);
  return NextResponse.json(activation, { status: 201 });
}
