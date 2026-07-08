import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateDiye } from "@/lib/calculators";
import { db } from "@/lib/db";

const Schema = z.object({
  jalaliYear: z.coerce.number().int().min(1300).max(1500),
  percentage: z.coerce.number().min(0.01).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const payload = Schema.parse(await req.json());

    const rate = await db.diyeRate.findUnique({
      where: { jalaliYear: payload.jalaliYear },
    });

    if (!rate) {
      return NextResponse.json(
        {
          error: `نرخ دیه برای سال ${payload.jalaliYear} ثبت نشده است. لطفاً با مدیر سایت تماس بگیرید.`,
        },
        { status: 422 }
      );
    }

    const result = calculateDiye({
      fullDiyeAmount: rate.amount,
      percentage: payload.percentage,
      jalaliYear: payload.jalaliYear,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطای نامشخص" },
      { status: 400 }
    );
  }
}
