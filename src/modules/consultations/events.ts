import { db } from "@/lib/db";

export async function recordConsultationEvent(input: {
  consultationRequestId: number;
  eventType: string;
  actorType: "SYSTEM" | "CLIENT" | "LAWYER" | "ADMIN" | "BALE";
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.consultationEvent.create({
    data: {
      consultationRequestId: input.consultationRequestId,
      eventType: input.eventType,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
}
