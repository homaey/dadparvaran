import { db } from "@/lib/db";
import { CONSULTATION_EVENT_TYPES, isConsultationStatus, canTransition } from "./constants";
import { recordConsultationEvent } from "./events";

const actionMap = {
  contacted: { status: "CONTACTED", event: CONSULTATION_EVENT_TYPES.CONTACT_CONFIRMED },
  no_answer: { status: null, event: CONSULTATION_EVENT_TYPES.NO_ANSWER_REPORTED },
  return_admin: { status: "REFERRED", event: CONSULTATION_EVENT_TYPES.RETURNED_TO_ADMIN },
  not_fit: { status: "NOT_A_FIT", event: CONSULTATION_EVENT_TYPES.MARKED_NOT_A_FIT },
  close: { status: "CLOSED", event: CONSULTATION_EVENT_TYPES.CLOSED },
} as const;

export async function updateConsultationByLawyer(input: {
  claimToken: string;
  baleUserId: string;
  action: keyof typeof actionMap;
}) {
  const account = await db.lawyerBaleAccount.findUnique({ where: { baleUserId: input.baleUserId } });
  if (!account || !account.isVerified || !account.isActive) throw new Error("LAWYER_NOT_AUTHORIZED");

  const request = await db.consultationRequest.findUnique({ where: { claimToken: input.claimToken } });
  if (!request) throw new Error("CONSULTATION_NOT_FOUND");
  if (request.assignedLawyerId !== account.lawyerId) throw new Error("CONSULTATION_NOT_ASSIGNED_TO_LAWYER");

  const mapping = actionMap[input.action];
  const patch: Record<string, unknown> = {};
  if (mapping.status) {
    if (!isConsultationStatus(request.status) || !canTransition(request.status, mapping.status)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }
    patch.status = mapping.status;
    if (mapping.status === "CONTACTED") patch.contactedAt = new Date();
    if (mapping.status === "CLOSED") patch.closedAt = new Date();
  }

  const updated = Object.keys(patch).length
    ? await db.consultationRequest.update({ where: { id: request.id }, data: patch })
    : request;

  await recordConsultationEvent({
    consultationRequestId: request.id,
    eventType: mapping.event,
    actorType: "LAWYER",
    actorId: String(account.lawyerId),
    metadata: { action: input.action },
  });

  return updated;
}
