import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { getAiConfig } from "@/lib/ai-provider";
import { planInputSchema } from "@/modules/content-strategy/schema";
import { generateIranianCalendar } from "@/modules/content-strategy/ai-provider";

export async function POST(req: Request) {
  const auth = await authorize([Roles.ADMIN]);
  if ("error" in auth) return auth.error;

  const rawBody = await req.json().catch(() => null);
  const model = typeof rawBody?.model === "string" && rawBody.model ? rawBody.model : undefined;
  const parsed = planInputSchema.safeParse(rawBody);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "داده نامعتبر است" },
      { status: 400 },
    );

  const members = await db.user.findMany({
    where: { id: { in: parsed.data.teamMemberIds }, role: { in: [Roles.ADMIN, Roles.LAWYER, Roles.CONTENT_CREATOR] } },
    select: { id: true, name: true, role: true },
  });
  if (members.length !== new Set(parsed.data.teamMemberIds).size)
    return NextResponse.json({ error: "یک یا چند نویسنده انتخاب‌شده مجاز نیستند" }, { status: 400 });

  const published = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      title: true,
      publishedAt: true,
      category: { select: { nameFA: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 150,
  });

  const summaries = published.map((a) => ({
    title: a.title,
    category: a.category?.nameFA ?? null,
    publishedAt: a.publishedAt?.toISOString().slice(0, 10) ?? "",
  }));

  try {
    const generated = await generateIranianCalendar(parsed.data, members, summaries, model);

    const memberIds = new Set(members.map((m) => m.id));
    const config = await getAiConfig();

    const plan = await db.contentPlan.create({
      data: {
        title: parsed.data.title,
        periodStart: parsed.data.periodStart,
        periodEnd: parsed.data.periodEnd,
        articleCount: parsed.data.articleCount,
        goal: parsed.data.goal,
        targetAudience: parsed.data.targetAudience,
        legalServices: parsed.data.legalServices,
        priorityAreas: parsed.data.priorityAreas,
        status: "GENERATED",
        typeDistribution: JSON.stringify(generated.distribution),
        aiModel: model || config.model,
        createdById: auth.session.userId,
        items: {
          create: generated.items.map((i) => ({
            ...i,
            publicationDate: undefined,
            assignedUserId:
              i.assignedUserId && memberIds.has(i.assignedUserId) ? i.assignedUserId : null,
            deadline: new Date(i.publicationDate),
          })),
        },
      },
    });

    return NextResponse.json({ id: plan.id }, { status: 201 });
  } catch (e) {
    console.error("Calendar generation failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "تولید تقویم ناموفق بود" },
      { status: 502 },
    );
  }
}
