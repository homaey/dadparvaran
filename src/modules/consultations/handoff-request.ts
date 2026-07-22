import { db } from "@/lib/db";
import { getBaleClient } from "@/modules/bale/client";
import { getBaleConfig } from "@/modules/bale/config";
import {
  assignedGroupMessage,
  lawyerPrivateMessage,
  lawyerStatusKeyboard,
  userAssignedMessage,
  userHandoffKeyboard,
} from "@/modules/bale/message-templates";
import { CONSULTATION_EVENT_TYPES } from "./constants";
import { deliverWithPersistence } from "./delivery";
import { recordConsultationEvent } from "./events";

export async function completeConsultationHandoff(input: {
  requestId: number;
  maxAttempts?: number;
}) {
  const request = await db.consultationRequest.findUnique({
    where: { id: input.requestId },
    include: {
      assignedLawyer: { include: { baleAccount: true } },
    },
  });
  if (!request || !request.assignedLawyerId || !request.assignedLawyer?.baleAccount) {
    throw new Error("HANDOFF_ASSIGNMENT_INCOMPLETE");
  }

  const account = request.assignedLawyer.baleAccount;
  const lawyer = request.assignedLawyer;
  const acceptedAt = request.acceptedAt ?? new Date();
  const client = getBaleClient();
  const config = getBaleConfig();
  const maxAttempts = input.maxAttempts ?? 1;
  const groupChatId = request.groupChatId ?? config.BALE_LAWYERS_GROUP_CHAT_ID;
  const groupMessageId = request.groupMessageId ? Number(request.groupMessageId) : null;

  const operations: Array<{ kind: "group" | "lawyer" | "client"; promise: Promise<unknown> }> = [];
  if (groupMessageId && Number.isFinite(groupMessageId)) {
    operations.push({
      kind: "group",
      promise: deliverWithPersistence({
        consultationRequestId: request.id,
        recipientType: "LAWYERS_GROUP",
        recipientId: groupChatId,
        messageType: "CONSULTATION_ASSIGNED_EDIT",
        dedupeKey: `consultation:${request.id}:assigned-edit:${request.assignedLawyerId}`,
        maxAttempts,
        operation: () =>
          client.editMessageText({
            chatId: groupChatId,
            messageId: groupMessageId,
            text: assignedGroupMessage({
              publicCode: request.publicCode,
              category: request.category,
              lawyerName: lawyer.nameFA,
              acceptedAt,
            }),
          }),
      }),
    });
  }

  operations.push({
    kind: "lawyer",
    promise: deliverWithPersistence({
      consultationRequestId: request.id,
      recipientType: "LAWYER",
      recipientId: account.baleUserId,
      messageType: "LAWYER_HANDOFF",
      dedupeKey: `consultation:${request.id}:lawyer-handoff:${request.assignedLawyerId}`,
      maxAttempts,
      operation: () =>
        client.sendMessage({
          chatId: account.baleUserId,
          text: lawyerPrivateMessage({
            publicCode: request.publicCode,
            clientName: request.clientName,
            phone: request.phone,
            email: request.email,
            preferredContact: request.preferredContact,
            category: request.category,
            city: request.city,
            caseStage: request.caseStage,
            urgency: request.urgency,
            summary: request.summary,
            source: request.source,
          }),
          replyMarkup: lawyerStatusKeyboard(request.claimToken),
        }),
    }),
  });

  // متقاضیِ فرم سایت شناسه بله ندارد، پس اعلانی برای او ارسال نمی‌شود و
  // واگذاری با رسیدنِ پیام خصوصی به وکیل کامل محسوب می‌شود.
  const clientReachableInBale = Boolean(request.userBaleId);
  const clientBaleId = request.userBaleId;

  if (clientReachableInBale && clientBaleId) {
    operations.push({
      kind: "client",
      promise: deliverWithPersistence({
        consultationRequestId: request.id,
        recipientType: "CLIENT",
        recipientId: clientBaleId,
        messageType: "CLIENT_HANDOFF",
        dedupeKey: `consultation:${request.id}:client-handoff:${request.assignedLawyerId}`,
        maxAttempts,
        operation: () =>
          client.sendMessage({
            chatId: clientBaleId,
            text: userAssignedMessage({
              publicCode: request.publicCode,
              lawyerName: lawyer.nameFA,
              hasChatUrl: Boolean(account.balePublicChatUrl?.trim()),
            }),
            replyMarkup: userHandoffKeyboard({
              publicCode: request.publicCode,
              lawyerChatUrl: account.balePublicChatUrl,
            }),
          }),
      }),
    });
  }

  const settled = await Promise.allSettled(operations.map((item) => item.promise));
  const results = operations.map((item, index) => ({ kind: item.kind, status: settled[index].status }));
  const clientHandoffSucceeded = clientReachableInBale
    ? results.some((item) => item.kind === "client" && item.status === "fulfilled")
    : results.some((item) => item.kind === "lawyer" && item.status === "fulfilled");

  if (clientHandoffSucceeded) {
    await db.consultationRequest.updateMany({
      where: { id: request.id, status: "ASSIGNED" },
      data: { status: "HANDOFF_SENT", handoffSentAt: new Date() },
    });
  }

  await recordConsultationEvent({
    consultationRequestId: request.id,
    eventType: clientHandoffSucceeded
      ? CONSULTATION_EVENT_TYPES.HANDOFF_SENT
      : CONSULTATION_EVENT_TYPES.HANDOFF_FAILED,
    actorType: "SYSTEM",
    metadata: { results },
  });

  return { clientHandoffSucceeded, results };
}
