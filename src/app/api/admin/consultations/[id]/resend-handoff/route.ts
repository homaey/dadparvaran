import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { completeConsultationHandoff } from "@/modules/consultations/handoff-request";

export async function POST(_request: Request, context: { params: { id: string } }) {
  const user = await requireUser(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(context.params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const result = await completeConsultationHandoff({ requestId: id, maxAttempts: 3 });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Handoff failed" },
      { status: 500 }
    );
  }
}
