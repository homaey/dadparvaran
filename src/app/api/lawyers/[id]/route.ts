import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const memberId = parseInt(id);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
  }

  const member = await db.teamMember.findUnique({
    where: { id: memberId, status: "APPROVED", isActive: true },
    select: {
      id: true,
      nameFA: true,
      nameEN: true,
      experience: true,
      barNumber: true,
      bioFA: true,
      bioEN: true,
      user: { select: { phone: true } },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "وکیل یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({ member });
}
