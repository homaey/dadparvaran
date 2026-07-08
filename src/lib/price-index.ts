import { db } from "@/lib/db";

export async function getIndex(year: number, month: number) {
  const monthly = await db.priceIndex.findUnique({
    where: { jalaliYear_jalaliMonth: { jalaliYear: year, jalaliMonth: month } },
  });
  if (monthly) return { value: monthly.value, label: `${year}/${String(month).padStart(2, "0")}` };

  const annual = await db.priceIndex.findUnique({
    where: { jalaliYear_jalaliMonth: { jalaliYear: year, jalaliMonth: 0 } },
  });
  if (annual) return { value: annual.value, label: `${year} (سالانه)` };

  return null;
}
