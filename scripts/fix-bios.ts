import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  await db.teamMember.update({
    where: { id: 4 },
    data: {
      bioFA: "وکیل پایه یک دادگستری با تخصص در امور ملکی، ثبتی و قراردادها.",
      bioEN: "Licensed bar attorney specializing in property, registration and contract matters.",
    },
  });
  await db.teamMember.update({
    where: { id: 5 },
    data: {
      bioFA: "وکیل پایه یک دادگستری با تمرکز بر دعاوی خانوادگی و حقوق خانواده.",
      bioEN: "Licensed bar attorney focused on family disputes and family law.",
    },
  });
  console.log("Bios updated");
  await db.$disconnect();
}
main();
