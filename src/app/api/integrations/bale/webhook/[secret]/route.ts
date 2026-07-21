import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleBaleUpdate } from "@/modules/bale/webhook-handler";

const updateSchema = z.object({
  update_id: z.number().int().nonnegative(),
  message: z.any().optional(),
  edited_message: z.any().optional(),
  callback_query: z.any().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: { secret: string } }
) {
  if (!process.env.BALE_WEBHOOK_PATH_SECRET || context.params.secret !== process.env.BALE_WEBHOOK_PATH_SECRET) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const update = updateSchema.parse(await request.json());
    await handleBaleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bale webhook processing failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
