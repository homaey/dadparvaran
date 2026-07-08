import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseJalaliDate, jalaliKey } from "@/lib/jalali";
import { calculateDeadline } from "@/lib/deadline-calculator";

const CalcSchema = z.object({
  deadlineId: z.coerce.number().int().positive(),
  startDate: z.string().min(8),
  isForeign: z.boolean().default(false),
  thursdayOff: z.boolean().default(false),
  mode: z.enum(["deadline", "minimum"]).default("deadline"),
  customHolidays: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const payload = CalcSchema.parse(await req.json());
    const start = parseJalaliDate(payload.startDate);

    const deadline = await db.legalDeadline.findUnique({
      where: { id: payload.deadlineId },
    });
    if (!deadline || !deadline.isActive) {
      return NextResponse.json({ error: "مهلت انتخاب‌شده یافت نشد" }, { status: 404 });
    }

    const days = payload.isForeign && deadline.foreignDays
      ? deadline.foreignDays
      : deadline.days;

    const mode = deadline.defaultMode === "minimum" ? "minimum" as const : payload.mode;

    const dbHolidays = await db.holiday.findMany({
      where: {
        jalaliYear: { in: [start.jy - 1, start.jy, start.jy + 1, start.jy + 2] },
      },
    });

    const holidaySet = new Set<string>();
    for (const h of dbHolidays) {
      holidaySet.add(jalaliKey({ jy: h.jalaliYear, jm: h.jalaliMonth, jd: h.jalaliDay }));
    }
    for (const custom of payload.customHolidays) {
      try {
        const p = parseJalaliDate(custom);
        holidaySet.add(jalaliKey(p));
      } catch {}
    }

    const result = calculateDeadline({
      startDate: start,
      days,
      holidaySet,
      thursdayOff: payload.thursdayOff,
      mode,
      deadlineTitle: deadline.title,
      article: deadline.article,
      isForeign: payload.isForeign && !!deadline.foreignDays,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطای نامشخص" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const deadlines = await db.legalDeadline.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { orderIndex: "asc" }],
  });

  const categories: Record<string, { label: string; items: typeof deadlines }> = {
    civil: { label: "آیین دادرسی مدنی", items: [] },
    executionCivil: { label: "اجرای احکام مدنی", items: [] },
    criminal: { label: "آیین دادرسی کیفری", items: [] },
  };

  for (const d of deadlines) {
    if (categories[d.category]) {
      categories[d.category].items.push(d);
    }
  }

  return NextResponse.json(categories);
}
