import { db } from "@/lib/db";
import { getBaleConfig } from "@/modules/bale/config";
import { validateBaleMiniAppInitData } from "@/modules/bale/miniapp-auth";
import { CONSULTATION_EVENT_TYPES } from "./constants";
import { createClaimToken, createPublicCode } from "./codes";
import { recordConsultationEvent } from "./events";
import type { ConsultationInput } from "./validation";

async function uniquePublicCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createPublicCode();
    const exists = await db.consultationRequest.findUnique({ where: { publicCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error("PUBLIC_CODE_GENERATION_FAILED");
}

export async function createConsultationRequest(input: ConsultationInput) {
  const config = getBaleConfig();
  const baleUser = validateBaleMiniAppInitData({
    initData: input.initData,
    botToken: config.BALE_BOT_TOKEN,
    maxAgeSeconds: config.BALE_MINIAPP_MAX_AGE_SECONDS,
    hmacMode: config.BALE_MINIAPP_HMAC_MODE,
  });

  if (baleUser.allowsWriteToPm === false) {
    throw new Error("BALE_PM_PERMISSION_REQUIRED");
  }

  const recentCount = await db.consultationRequest.count({
    where: {
      userBaleId: baleUser.id,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= 4) throw new Error("CONSULTATION_RATE_LIMITED");

  const request = await db.consultationRequest.create({
    data: {
      publicCode: await uniquePublicCode(),
      claimToken: createClaimToken(),
      source: "BALE_MINIAPP",
      status: "OPEN",
      userBaleId: baleUser.id,
      userBaleUsername: baleUser.username ?? null,
      clientName: input.clientName,
      phone: input.phone || null,
      category: input.category,
      subCategory: input.subCategory || null,
      city: input.city,
      clientRole: input.clientRole || null,
      caseStage: input.caseStage,
      urgency: input.urgency,
      summary: input.summary,
    },
  });

  await recordConsultationEvent({
    consultationRequestId: request.id,
    eventType: CONSULTATION_EVENT_TYPES.REQUEST_CREATED,
    actorType: "CLIENT",
    actorId: baleUser.id,
    metadata: {
      source: "BALE_MINIAPP",
      allowsWriteToPm: baleUser.allowsWriteToPm ?? null,
      queryId: baleUser.queryId ?? null,
    },
  });

  return { request, baleUser };
}
