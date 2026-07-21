import { db } from "@/lib/db";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DELIVERY_LEASE_MS = 5 * 60 * 1000;

/**
 * Persistent, de-duplicated delivery with a short database lease.
 * A concurrent caller that sees an active PROCESSING lease returns null instead
 * of sending the same message twice. A stale lease can be recovered later.
 */
export async function deliverWithPersistence<T>(input: {
  consultationRequestId?: number;
  recipientType: string;
  recipientId: string;
  messageType: string;
  dedupeKey: string;
  maxAttempts?: number;
  operation: () => Promise<T>;
}): Promise<T | null> {
  const delivery = await db.notificationDelivery.upsert({
    where: { dedupeKey: input.dedupeKey },
    create: {
      consultationRequestId: input.consultationRequestId,
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      messageType: input.messageType,
      dedupeKey: input.dedupeKey,
      status: "PENDING",
    },
    update: {},
  });

  if (delivery.status === "SENT") return null;

  const acquired = await db.notificationDelivery.updateMany({
    where: {
      id: delivery.id,
      status: { not: "SENT" },
      OR: [
        { status: { not: "PROCESSING" } },
        { updatedAt: { lt: new Date(Date.now() - DELIVERY_LEASE_MS) } },
      ],
    },
    data: {
      status: "PROCESSING",
      attemptCount: 0,
      lastError: null,
    },
  });

  if (acquired.count !== 1) return null;

  const maxAttempts = input.maxAttempts ?? 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await input.operation();
      await db.notificationDelivery.update({
        where: { id: delivery.id },
        data: { status: "SENT", attemptCount: attempt, sentAt: new Date(), lastError: null },
      });
      return result;
    } catch (error) {
      lastError = error;
      await db.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: attempt >= maxAttempts ? "ABANDONED" : "PROCESSING",
          attemptCount: attempt,
          lastError: error instanceof Error ? error.message.slice(0, 1000) : "Unknown delivery error",
        },
      });
      if (attempt < maxAttempts) await sleep(250 * 2 ** (attempt - 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Bale delivery failed");
}
