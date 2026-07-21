import { db } from "@/lib/db";
import { getBaleClient } from "@/modules/bale/client";
import { getBaleConfig } from "@/modules/bale/config";
import { claimKeyboard, openGroupMessage } from "@/modules/bale/message-templates";
import { CONSULTATION_EVENT_TYPES } from "./constants";
import { deliverWithPersistence } from "./delivery";
import { recordConsultationEvent } from "./events";

export async function publishConsultationToLawyersGroup(requestId: number): Promise<void> {
  const request = await db.consultationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("CONSULTATION_NOT_FOUND");
  if (request.status !== "OPEN") throw new Error("CONSULTATION_NOT_OPEN");

  const config = getBaleConfig();
  const client = getBaleClient();

  try {
    const sent = await deliverWithPersistence({
      consultationRequestId: request.id,
      recipientType: "LAWYERS_GROUP",
      recipientId: config.BALE_LAWYERS_GROUP_CHAT_ID,
      messageType: "CONSULTATION_OPEN",
      dedupeKey: `consultation:${request.id}:group-open`,
      operation: () =>
        client.sendMessage({
          chatId: config.BALE_LAWYERS_GROUP_CHAT_ID,
          text: openGroupMessage({
            publicCode: request.publicCode,
            claimToken: request.claimToken,
            category: request.category,
            city: request.city,
            caseStage: request.caseStage,
            urgency: request.urgency,
            createdAt: request.createdAt,
          }),
          replyMarkup: claimKeyboard(request.claimToken),
        }),
    });

    if (sent) {
      await db.consultationRequest.update({
        where: { id: request.id },
        data: {
          groupChatId: String(sent.chat.id),
          groupMessageId: String(sent.message_id),
        },
      });
    }

    await recordConsultationEvent({
      consultationRequestId: request.id,
      eventType: CONSULTATION_EVENT_TYPES.POSTED_TO_GROUP,
      actorType: "SYSTEM",
      metadata: { groupChatId: config.BALE_LAWYERS_GROUP_CHAT_ID },
    });
  } catch (error) {
    await recordConsultationEvent({
      consultationRequestId: request.id,
      eventType: CONSULTATION_EVENT_TYPES.POST_TO_GROUP_FAILED,
      actorType: "SYSTEM",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw error;
  }
}
