import { db } from "@/lib/db";
import { getBaleClient } from "@/modules/bale/client";
import { getBaleConfig } from "@/modules/bale/config";
import {
  ACTIVE_LAWYER_REQUEST_STATUSES,
  CONSULTATION_EVENT_TYPES,
} from "./constants";
import { recordConsultationEvent } from "./events";
import { completeConsultationHandoff } from "./handoff-request";

export type ClaimResult =
  | { ok: true; requestId: number; publicCode: string; lawyerName: string }
  | { ok: false; reason: "NOT_REGISTERED" | "NOT_ELIGIBLE" | "CAPACITY_FULL" | "ALREADY_CLAIMED" | "NOT_FOUND" };

function categoryAllowed(raw: string, category: string): boolean {
  try {
    const categories = JSON.parse(raw) as unknown;
    return !Array.isArray(categories) || categories.length === 0 || categories.includes(category);
  } catch {
    return true;
  }
}

function memberIsActive(status: string, isMember?: boolean): boolean {
  return status === "creator" || status === "administrator" || status === "member" || (status === "restricted" && isMember === true);
}

export async function claimConsultationRequest(input: {
  claimToken: string;
  baleUserId: string;
}): Promise<ClaimResult> {
  const client = getBaleClient();
  const config = getBaleConfig();

  const account = await db.lawyerBaleAccount.findUnique({
    where: { baleUserId: input.baleUserId },
    include: { lawyer: true },
  });
  if (!account) return { ok: false, reason: "NOT_REGISTERED" };
  if (!account.isVerified || !account.isActive || !account.isAvailable || !account.lawyer.isActive) {
    return { ok: false, reason: "NOT_ELIGIBLE" };
  }

  const membership = await client.getChatMember(config.BALE_LAWYERS_GROUP_CHAT_ID, input.baleUserId);
  if (!memberIsActive(membership.status, membership.is_member)) {
    return { ok: false, reason: "NOT_ELIGIBLE" };
  }

  const request = await db.consultationRequest.findUnique({ where: { claimToken: input.claimToken } });
  if (!request) return { ok: false, reason: "NOT_FOUND" };
  if (!categoryAllowed(account.allowedCategories, request.category)) {
    return { ok: false, reason: "NOT_ELIGIBLE" };
  }

  const activeCount = await db.consultationRequest.count({
    where: {
      assignedLawyerId: account.lawyerId,
      status: { in: ACTIVE_LAWYER_REQUEST_STATUSES },
    },
  });
  if (activeCount >= account.maxOpenRequests) {
    return { ok: false, reason: "CAPACITY_FULL" };
  }

  await recordConsultationEvent({
    consultationRequestId: request.id,
    eventType: CONSULTATION_EVENT_TYPES.CLAIM_ATTEMPTED,
    actorType: "LAWYER",
    actorId: String(account.lawyerId),
  });

  const acceptedAt = new Date();
  const updated = await db.consultationRequest.updateMany({
    where: {
      id: request.id,
      status: "OPEN",
      assignedLawyerId: null,
    },
    data: {
      status: "ASSIGNED",
      assignedLawyerId: account.lawyerId,
      acceptedAt,
    },
  });

  if (updated.count !== 1) {
    await recordConsultationEvent({
      consultationRequestId: request.id,
      eventType: CONSULTATION_EVENT_TYPES.CLAIM_REJECTED,
      actorType: "LAWYER",
      actorId: String(account.lawyerId),
      metadata: { reason: "ALREADY_CLAIMED" },
    });
    return { ok: false, reason: "ALREADY_CLAIMED" };
  }

  await recordConsultationEvent({
    consultationRequestId: request.id,
    eventType: CONSULTATION_EVENT_TYPES.CLAIM_SUCCEEDED,
    actorType: "LAWYER",
    actorId: String(account.lawyerId),
  });

  try {
    await completeConsultationHandoff({ requestId: request.id, maxAttempts: 1 });
  } catch (error) {
    console.error("Consultation was claimed but handoff orchestration failed", {
      requestId: request.id,
      error: error instanceof Error ? error.message : "unknown",
    });
  }

  return {
    ok: true,
    requestId: request.id,
    publicCode: request.publicCode,
    lawyerName: account.lawyer.nameFA,
  };
}
