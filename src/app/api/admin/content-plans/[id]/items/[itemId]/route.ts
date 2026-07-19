import { NextResponse } from "next/server";
import { z } from "zod";
import { ArticleType, LegalCategory } from "@/lib/content-enums";
import { Roles } from "@/lib/roles";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({
  title: z.string().min(5).max(250),
  articleType: z.nativeEnum(ArticleType),
  legalCategory: z.nativeEnum(LegalCategory),
  keyword: z.string().min(2),
  searchIntent: z.string().min(2),
  targetAudience: z.string().min(2),
  popularityScore: z.number().int().min(0).max(100),
  businessScore: z.number().int().min(0).max(100),
  seoScore: z.number().int().min(0).max(100),
  educationalScore: z.number().int().min(0).max(100),
  assignedUserId: z.string().nullable(),
  deadline: z.coerce.date(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await authorize([Roles.ADMIN]);
  if ("error" in auth) return auth.error;
  const { id: idParam, itemId: itemIdParam } = await params;
  const id = Number(idParam);
  const itemId = Number(itemIdParam);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "داده نامعتبر است" }, { status: 400 });

  const priorityScore =
    parsed.data.popularityScore * 0.3 +
    parsed.data.businessScore * 0.3 +
    parsed.data.seoScore * 0.25 +
    parsed.data.educationalScore * 0.15;
  const result = await db.contentCalendarItem.updateMany({
    where: { id: itemId, contentPlanId: id, contentPlan: { status: { not: "APPROVED" } } },
    data: { ...parsed.data, priorityScore },
  });
  if (!result.count) return NextResponse.json({ error: "آیتم قابل ویرایش نیست" }, { status: 404 });
  return NextResponse.json({ ok: true, priorityScore });
}
