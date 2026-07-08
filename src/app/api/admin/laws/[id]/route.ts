import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function getAllDescendantIds(parentId: number): Promise<number[]> {
  const children = await db.legalNode.findMany({
    where: { parentId },
    select: { id: true },
  });
  const ids: number[] = [];
  for (const child of children) {
    ids.push(child.id);
    const sub = await getAllDescendantIds(child.id);
    ids.push(...sub);
  }
  return ids;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await params;
  const lawId = parseInt(id, 10);
  if (isNaN(lawId)) {
    return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });
  }

  const law = await db.legalNode.findFirst({
    where: { id: lawId, type: "LAW" },
    select: { id: true, title: true },
  });

  if (!law) {
    return NextResponse.json({ error: "قانون یافت نشد" }, { status: 404 });
  }

  try {
    await db.$transaction(async (tx) => {
      const descendants = await getAllDescendantIds(lawId);
      const allIds = [lawId, ...descendants];

      await tx.taggable.deleteMany({
        where: { taggableType: "LEGAL_NODE", taggableId: { in: allIds } },
      });

      await tx.nodeRelatedRuling.deleteMany({
        where: { legalNodeId: { in: allIds } },
      });

      for (let i = descendants.length - 1; i >= 0; i--) {
        await tx.legalNode.delete({ where: { id: descendants[i] } });
      }

      await tx.legalNode.delete({ where: { id: lawId } });
    }, { timeout: 30000 });

    return NextResponse.json({ success: true, message: `«${law.title}» حذف شد` });
  } catch (err: any) {
    console.error("Law delete error:", err);
    return NextResponse.json(
      { error: "خطا در حذف قانون", details: [err.message] },
      { status: 500 }
    );
  }
}
