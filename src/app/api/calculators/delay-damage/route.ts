import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateDelayDamage } from "@/lib/calculators";
import { daysBetweenJalali, jalaliYear, jalaliMonth } from "@/lib/jalali";
import { parseMoney } from "@/lib/money";
import { getIndex } from "@/lib/price-index";

const Schema = z.object({
  principal: z.union([z.string(), z.number()]),
  fromDate: z.string().min(8),
  toDate: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const payload = Schema.parse(await req.json());
    const principal = parseMoney(payload.principal);
    const fromYear = jalaliYear(payload.fromDate);
    const fromMonth = jalaliMonth(payload.fromDate);
    const toYear = jalaliYear(payload.toDate);
    const toMonth = jalaliMonth(payload.toDate);
    const days = daysBetweenJalali(payload.fromDate, payload.toDate);

    const startIdx = await getIndex(fromYear, fromMonth);
    const endIdx = await getIndex(toYear, toMonth);

    if (!startIdx || !endIdx) {
      const missing: string[] = [];
      if (!startIdx) missing.push(`${fromYear}/${String(fromMonth).padStart(2, "0")}`);
      if (!endIdx) missing.push(`${toYear}/${String(toMonth).padStart(2, "0")}`);
      return NextResponse.json(
        {
          error: `شاخص بها برای دوره‌ی ${missing.join(" و ")} ثبت نشده است. لطفاً با مدیر سایت تماس بگیرید.`,
        },
        { status: 422 }
      );
    }

    const result = calculateDelayDamage({
      principal,
      startIndex: startIdx.value,
      endIndex: endIdx.value,
      startLabel: startIdx.label,
      endLabel: endIdx.label,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      days,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطای نامشخص" },
      { status: 400 }
    );
  }
}
