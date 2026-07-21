import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canTransition, isConsultationStatus } from "@/modules/consultations/constants";
import { recordConsultationEvent } from "@/modules/consultations/events";
import { completeConsultationHandoff } from "@/modules/consultations/handoff-request";

const patchSchema = z
  .object({
    status: z.string().optional(),
    assignedLawyerId: z.number().int().positive().nullable().optional(),
  })
  .refine((value) => !(value.status && value.assignedLawyerId !== undefined), {
    message: "Update status and assignment in separate operations",
  });

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const user = await requireUser(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const input = patchSchema.parse(await request.json());
    const current = await db.consultationRequest.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (input.status) {
      if (!isConsultationStatus(current.status) || !isConsultationStatus(input.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      if (!canTransition(current.status, input.status)) {
        return NextResponse.json({ error: "Invalid status transition" }, { status: 409 });
      }
    }

    if (input.assignedLawyerId !== undefined && input.assignedLawyerId !== null) {
      if (["CLOSED", "CANCELLED"].includes(current.status)) {
        return NextResponse.json({ error: "Closed requests cannot be assigned" }, { status: 409 });
      }
      const lawyer = await db.teamMember.findUnique({
        where: { id: input.assignedLawyerId },
        include: { baleAccount: true },
      });
      if (!lawyer || !lawyer.isActive || !lawyer.baleAccount?.isVerified || !lawyer.baleAccount.isActive) {
        return NextResponse.json({ error: "Lawyer Bale account is unavailable or unverified" }, { status: 400 });
      }
    }

    const assignmentRequested = input.assignedLawyerId !== undefined;
    const acceptedAt = assignmentRequested && input.assignedLawyerId !== null ? new Date() : undefined;
    const updated = await db.consultationRequest.update({
      where: { id },
      data: assignmentRequested
        ? input.assignedLawyerId === null
          ? {
              status: "OPEN",
              assignedLawyerId: null,
              acceptedAt: null,
              handoffSentAt: null,
              contactedAt: null,
            }
          : {
              status: "ASSIGNED",
              assignedLawyerId: input.assignedLawyerId,
              acceptedAt,
              handoffSentAt: null,
              contactedAt: null,
              closedAt: null,
            }
        : {
            ...(input.status ? { status: input.status } : {}),
            ...(input.status === "CLOSED" ? { closedAt: new Date() } : {}),
            ...(input.status === "CONTACTED" ? { contactedAt: current.contactedAt ?? new Date() } : {}),
            ...(input.status === "OPEN"
              ? { assignedLawyerId: null, acceptedAt: null, handoffSentAt: null, contactedAt: null }
              : {}),
          },
    });

    await recordConsultationEvent({
      consultationRequestId: id,
      eventType: "ADMIN_UPDATED",
      actorType: "ADMIN",
      actorId: user.userId,
      metadata: input,
    });

    let handoff: unknown = null;
    let handoffWarning: string | null = null;
    if (assignmentRequested && input.assignedLawyerId !== null) {
      try {
        handoff = await completeConsultationHandoff({ requestId: id, maxAttempts: 1 });
      } catch (error) {
        handoffWarning = error instanceof Error ? error.message : "Handoff failed";
      }
    }

    return NextResponse.json({ ok: true, request: updated, handoff, handoffWarning });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}
