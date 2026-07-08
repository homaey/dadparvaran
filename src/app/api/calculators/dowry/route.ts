import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateDowry } from "@/lib/calculators";
import { parseMoney } from "@/lib/money";
import { getIndex } from "@/lib/price-index";

const Schema = z.object({
  originalAmount: z.union([z.string(), z.number()]),
  marriageYear: z.coerce.number().int().min(1300).max(1500),
  marriageMonth: z.coerce.number().int().min(1).max(12),
  demandYear: z.coerce.number().int().min(1300).max(1500),
  demandMonth: z.coerce.number().int().min(1).max(12),
});

export async function POST(req: NextRequest) {
  try {
    const payload = Schema.parse(await req.json());
    const originalAmount = parseMoney(payload.originalAmount);

    const startIdx = await getIndex(payload.marriageYear, payload.marriageMonth);
    const endIdx = await getIndex(payload.demandYear, payload.demandMonth);

    if (!startIdx || !endIdx) {
      const missing: string[] = [];
      if (!startIdx) missing.push(`${payload.marriageYear}/${String(payload.marriageMonth).padStart(2, "0")}`);
      if (!endIdx) missing.push(`${payload.demandYear}/${String(payload.demandMonth).padStart(2, "0")}`);
      return NextResponse.json(
        {
          error: `شاخص بها برای دوره‌ی ${missing.join(" و ")} ثبت نشده است. لطفاً با مدیر سایت تماس بگیرید.`,
        },
        { status: 422 }
      );
    }

    const result = calculateDowry({
      originalAmount,
      startIndex: startIdx.value,
      endIndex: endIdx.value,
      startLabel: startIdx.label,
      endLabel: endIdx.label,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطای نامشخص" },
      { status: 400 }
    );
  }
}
