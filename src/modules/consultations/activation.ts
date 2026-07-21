import { db } from "@/lib/db";
import { createActivationCode, hashActivationCode } from "./codes";

export async function createLawyerActivationCode(lawyerId: number, ttlMinutes = 15) {
  const rawCode = createActivationCode();
  const codeHash = hashActivationCode(rawCode);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

  await db.lawyerBaleActivationCode.deleteMany({
    where: { lawyerId, usedAt: null },
  });

  await db.lawyerBaleActivationCode.create({
    data: { lawyerId, codeHash, expiresAt },
  });

  return { code: rawCode, expiresAt };
}

export async function activateLawyerBaleAccount(input: {
  code: string;
  baleUserId: string;
  baleUsername?: string;
}) {
  const codeHash = hashActivationCode(input.code);
  const record = await db.lawyerBaleActivationCode.findUnique({
    where: { codeHash },
    include: { lawyer: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) throw new Error("ACTIVATION_CODE_INVALID");

  return db.$transaction(async (tx) => {
    const existingByBale = await tx.lawyerBaleAccount.findUnique({ where: { baleUserId: input.baleUserId } });
    if (existingByBale && existingByBale.lawyerId !== record.lawyerId) {
      throw new Error("BALE_ACCOUNT_ALREADY_LINKED");
    }

    const account = await tx.lawyerBaleAccount.upsert({
      where: { lawyerId: record.lawyerId },
      create: {
        lawyerId: record.lawyerId,
        baleUserId: input.baleUserId,
        baleUsername: input.baleUsername ?? null,
        balePublicChatUrl: input.baleUsername ? `https://ble.ir/${input.baleUsername}` : "",
        isVerified: false,
        isActive: true,
        isAvailable: true,
      },
      update: {
        baleUserId: input.baleUserId,
        baleUsername: input.baleUsername ?? null,
        ...(input.baleUsername ? { balePublicChatUrl: `https://ble.ir/${input.baleUsername}` } : {}),
      },
    });

    await tx.lawyerBaleActivationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { account, lawyer: record.lawyer };
  });
}
