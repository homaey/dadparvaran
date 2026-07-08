import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const membersWithoutUser = await db.teamMember.findMany({
    where: {
      userId: null,
      phone: { not: null },
      isActive: true,
    },
  });

  const created: { name: string; phone: string }[] = [];
  const skipped: { name: string; reason: string }[] = [];

  for (const member of membersWithoutUser) {
    if (!member.phone) {
      skipped.push({ name: member.nameFA, reason: "شماره موبایل ندارد" });
      continue;
    }

    const existingByPhone = await db.user.findUnique({ where: { phone: member.phone } });
    if (existingByPhone) {
      skipped.push({ name: member.nameFA, reason: "شماره موبایل قبلاً ثبت شده" });
      continue;
    }

    const hashed = await bcrypt.hash(member.phone, 12);
    const user = await db.user.create({
      data: {
        name: member.nameFA,
        email: `${member.phone}@lawyers.dadparvaran.com`,
        phone: member.phone,
        password: hashed,
        role: "LAWYER",
      },
    });

    await db.teamMember.update({
      where: { id: member.id },
      data: { userId: user.id },
    });

    created.push({ name: member.nameFA, phone: member.phone });
  }

  return NextResponse.json({
    message: `${created.length} حساب ایجاد شد`,
    created,
    skipped,
  });
}
