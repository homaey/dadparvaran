import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const tags = await db.tag.findMany({ orderBy: { id: "asc" } });
  console.log("=== TAGS ===");
  for (const t of tags) console.log(`  ${t.id} | ${t.category} | ${t.nameFA} | ${t.slug}`);
  const members = await db.teamMember.findMany({ select: { id: true, nameFA: true, roleFA: true, roleEN: true } });
  console.log("=== MEMBERS ===");
  for (const m of members) console.log(`  ${m.id} | ${m.nameFA} | ${m.roleFA} | ${m.roleEN}`);
  await db.$disconnect();
}
main();
