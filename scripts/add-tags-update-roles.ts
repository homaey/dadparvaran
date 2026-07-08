import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // Add 4 new APPLIED tags
  const newTags = [
    { nameFA: "دعاوی حقوقی", nameEN: "Civil Litigation", slug: "civil-litigation", category: "APPLIED" as const },
    { nameFA: "تنظیم قراردادها", nameEN: "Contract Drafting", slug: "contract-drafting", category: "APPLIED" as const },
    { nameFA: "امور پیمان", nameEN: "Contract & Procurement Affairs", slug: "contract-procurement", category: "APPLIED" as const },
    { nameFA: "داوری", nameEN: "Arbitration", slug: "arbitration", category: "APPLIED" as const },
  ];

  for (const tag of newTags) {
    const result = await db.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    console.log(`Tag: ${result.nameFA} (id=${result.id})`);
  }

  // Update عارف role
  const aref = await db.teamMember.update({
    where: { id: 4 },
    data: {
      roleFA: "وکیل پایه یک دادگستری",
      roleEN: "Licensed Bar Attorney",
    },
  });
  console.log(`Updated ${aref.nameFA}: ${aref.roleFA}`);

  // Update عرفان role
  const erfan = await db.teamMember.update({
    where: { id: 5 },
    data: {
      roleFA: "وکیل پایه یک دادگستری",
      roleEN: "Licensed Bar Attorney",
    },
  });
  console.log(`Updated ${erfan.nameFA}: ${erfan.roleFA}`);

  await db.$disconnect();
}
main();
