import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const db = new PrismaClient();

async function main() {
  const filePath = path.resolve(__dirname, "../_reference/cbi-index.json");
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const sourceTitle = data.sources?.annual_inflation_source_name_fa || "بانک مرکزی جمهوری اسلامی ایران";
  const sourceUrl = data.sources?.annual_inflation_source_url || null;

  // Delete old fake/sample data
  const deleted = await db.priceIndex.deleteMany({
    where: { sourceTitle: { contains: "ساختگی" } },
  });
  console.log(`Deleted ${deleted.count} fake sample records`);

  // Import monthly_index_flat
  const flat: Array<{ year: number; month_number: number; index: number }> = data.monthly_index_flat;
  let monthlyCount = 0;

  for (const row of flat) {
    await db.priceIndex.upsert({
      where: {
        jalaliYear_jalaliMonth: {
          jalaliYear: row.year,
          jalaliMonth: row.month_number,
        },
      },
      update: {
        value: row.index,
        sourceTitle,
        sourceUrl,
        publishedAt: new Date(),
      },
      create: {
        jalaliYear: row.year,
        jalaliMonth: row.month_number,
        value: row.index,
        sourceTitle,
        sourceUrl,
        publishedAt: new Date(),
      },
    });
    monthlyCount++;
  }

  console.log(`Imported ${monthlyCount} monthly records (${flat[0].year}/${flat[0].month_number} — ${flat[flat.length - 1].year}/${flat[flat.length - 1].month_number})`);

  // Summary
  const total = await db.priceIndex.count();
  const years = await db.priceIndex.groupBy({
    by: ["jalaliYear"],
    _count: true,
    orderBy: { jalaliYear: "asc" },
  });

  console.log(`\nTotal PriceIndex records in DB: ${total}`);
  console.log(`Year range: ${years[0].jalaliYear} — ${years[years.length - 1].jalaliYear}`);
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
