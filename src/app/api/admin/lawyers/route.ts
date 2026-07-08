import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const members = await db.teamMember.findMany({
    where: {
      ...(status ? { status } : {}),
    },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const memberIds = members.map((m) => m.id);
  const taggables = await db.taggable.findMany({
    where: { taggableType: "TEAM_MEMBER", taggableId: { in: memberIds } },
    include: { tag: { select: { id: true, nameFA: true, nameEN: true } } },
  });

  const tagsByMember = new Map<number, { id: number; nameFA: string; nameEN: string }[]>();
  for (const t of taggables) {
    const arr = tagsByMember.get(t.taggableId) || [];
    arr.push(t.tag);
    tagsByMember.set(t.taggableId, arr);
  }

  const enriched = members.map((m) => ({
    ...m,
    tags: tagsByMember.get(m.id) || [],
  }));

  return NextResponse.json({ members: enriched });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { memberId, status } = await req.json();
  if (!memberId || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "پارامترهای نامعتبر" }, { status: 400 });
  }

  const member = await db.teamMember.update({
    where: { id: memberId },
    data: {
      status,
      isActive: status === "APPROVED",
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ member });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const body = await req.json();
  const { memberId, nameFA, nameEN, roleFA, roleEN, bioFA, bioEN, barNumber, phone, experience, education, photoUrl, licenseImage, isActive, status, tagIds } = body;
  if (!memberId) {
    return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (nameFA !== undefined) data.nameFA = nameFA;
  if (nameEN !== undefined) data.nameEN = nameEN;
  if (roleFA !== undefined) data.roleFA = roleFA;
  if (roleEN !== undefined) data.roleEN = roleEN;
  if (bioFA !== undefined) data.bioFA = bioFA;
  if (bioEN !== undefined) data.bioEN = bioEN;
  if (barNumber !== undefined) data.barNumber = barNumber || null;
  if (phone !== undefined) data.phone = phone || null;
  if (experience !== undefined) data.experience = experience;
  if (education !== undefined) data.education = education || null;
  if (photoUrl !== undefined) data.photoUrl = photoUrl || null;
  if (licenseImage !== undefined) data.licenseImage = licenseImage || null;
  if (isActive !== undefined) data.isActive = isActive;
  if (status !== undefined) data.status = status;

  try {
    const member = await db.teamMember.update({
      where: { id: memberId },
      data,
    });

    if (Array.isArray(tagIds)) {
      await db.taggable.deleteMany({
        where: { taggableType: "TEAM_MEMBER", taggableId: memberId },
      });
      if (tagIds.length > 0) {
        await db.taggable.createMany({
          data: tagIds.map((tagId: number) => ({
            tagId,
            taggableType: "TEAM_MEMBER" as const,
            taggableId: memberId,
          })),
        });
      }
    }

    return NextResponse.json({ member });
  } catch (err: any) {
    if (err?.code === "P2002") {
      const target = err.meta?.target?.[0] || "field";
      return NextResponse.json(
        { error: `مقدار تکراری برای فیلد ${target}` },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = parseInt(searchParams.get("id") || "0");
  if (!memberId) {
    return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
  }

  await db.article.updateMany({
    where: { authorId: memberId },
    data: { authorId: memberId },
  });

  const member = await db.teamMember.findUnique({ where: { id: memberId }, select: { userId: true } });

  await db.teamMember.delete({ where: { id: memberId } });

  if (member?.userId) {
    await db.user.delete({ where: { id: member.userId } }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
