import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

function parsePersianNumber(input: string | number): number {
  if (typeof input === "number") return input;
  let s = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[,،٬]/g, "")
    .replace(/\//g, ".");
  return parseFloat(s);
}

const UpsertSchema = z.object({
  jalaliYear: z.coerce.number().int().min(1300).max(1600),
  jalaliMonth: z.coerce.number().int().min(0).max(12),
  value: z.union([z.string(), z.number()]).transform((v) => parsePersianNumber(v)),
  sourceTitle: z.string().optional(),
  sourceUrl: z.string().optional(),
});

const CsvRowSchema = z.object({
  jalaliYear: z.coerce.number().int().min(1300).max(1600),
  jalaliMonth: z.coerce.number().int().min(0).max(12).default(0),
  value: z.coerce.number().positive(),
  sourceTitle: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const indices = await db.priceIndex.findMany({
    orderBy: [{ jalaliYear: "desc" }, { jalaliMonth: "desc" }],
  });
  return NextResponse.json(indices);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // CSV import
    if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const text = await req.text();
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        return NextResponse.json({ error: "فایل CSV خالی یا بدون داده" }, { status: 400 });
      }

      const [headerLine, ...rows] = lines;
      const headers = headerLine.split(",").map((h) => h.trim());
      let imported = 0;

      for (const line of rows) {
        const cols = line.split(",").map((c) => c.trim());
        const record = Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
        const parsed = CsvRowSchema.safeParse(record);
        if (!parsed.success) continue;

        await db.priceIndex.upsert({
          where: {
            jalaliYear_jalaliMonth: {
              jalaliYear: parsed.data.jalaliYear,
              jalaliMonth: parsed.data.jalaliMonth,
            },
          },
          update: {
            value: parsed.data.value,
            sourceTitle: parsed.data.sourceTitle || null,
            publishedAt: new Date(),
          },
          create: {
            jalaliYear: parsed.data.jalaliYear,
            jalaliMonth: parsed.data.jalaliMonth,
            value: parsed.data.value,
            sourceTitle: parsed.data.sourceTitle || null,
            publishedAt: new Date(),
          },
        });
        imported++;
      }

      return NextResponse.json({ success: true, imported });
    }

    // JSON bulk import (CBI format: array of {year, month_number, index})
    const body = await req.json();

    if (Array.isArray(body)) {
      let imported = 0;
      for (const row of body) {
        const year = Number(row.year ?? row.jalaliYear);
        const month = Number(row.month_number ?? row.jalaliMonth ?? 0);
        const value = parsePersianNumber(row.index ?? row.value);
        if (!year || isNaN(value) || value <= 0) continue;

        await db.priceIndex.upsert({
          where: { jalaliYear_jalaliMonth: { jalaliYear: year, jalaliMonth: month } },
          update: { value, sourceTitle: row.sourceTitle || "بانک مرکزی", publishedAt: new Date() },
          create: { jalaliYear: year, jalaliMonth: month, value, sourceTitle: row.sourceTitle || "بانک مرکزی", publishedAt: new Date() },
        });
        imported++;
      }
      return NextResponse.json({ success: true, imported });
    }

    // Single record upsert
    const payload = UpsertSchema.parse(body);
    if (payload.value <= 0 || isNaN(payload.value)) {
      return NextResponse.json({ error: "مقدار شاخص نامعتبر است" }, { status: 400 });
    }

    await db.priceIndex.upsert({
      where: {
        jalaliYear_jalaliMonth: {
          jalaliYear: payload.jalaliYear,
          jalaliMonth: payload.jalaliMonth,
        },
      },
      update: {
        value: payload.value,
        sourceTitle: payload.sourceTitle || null,
        sourceUrl: payload.sourceUrl || null,
        publishedAt: new Date(),
      },
      create: {
        jalaliYear: payload.jalaliYear,
        jalaliMonth: payload.jalaliMonth,
        value: payload.value,
        sourceTitle: payload.sourceTitle || null,
        sourceUrl: payload.sourceUrl || null,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "خطا" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id } = await req.json();
  await db.priceIndex.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
