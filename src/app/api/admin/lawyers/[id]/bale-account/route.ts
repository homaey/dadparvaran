import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const patchSchema = z.object({
  balePublicChatUrl: z.string().url().refine((value) => value.startsWith("https://ble.ir/"), "Bale URL required").optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  maxOpenRequests: z.number().int().min(0).max(100).optional(),
  allowedCategories: z.array(z.string().min(1).max(80)).max(50).optional(),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const user = await requireUser(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lawyerId = Number(context.params.id);
  if (!Number.isInteger(lawyerId)) return NextResponse.json({ error: "Invalid lawyer id" }, { status: 400 });
  const input = patchSchema.parse(await request.json());
  const existing = await db.lawyerBaleAccount.findUnique({ where: { lawyerId } });
  if (!existing) return NextResponse.json({ error: "Bale account not linked" }, { status: 404 });
  if (input.isVerified === true && !(input.balePublicChatUrl ?? existing.balePublicChatUrl)) {
    return NextResponse.json({ error: "Public Bale chat URL is required before verification" }, { status: 400 });
  }

  // separate the array-typed field so the JSON-string version replaces it in the
  // update input instead of colliding at the type level with the string column
  const { allowedCategories, ...rest } = input;
  const account = await db.lawyerBaleAccount.update({
    where: { lawyerId },
    data: {
      ...rest,
      ...(allowedCategories ? { allowedCategories: JSON.stringify(allowedCategories) } : {}),
      ...(input.isVerified === true ? { verifiedAt: new Date() } : {}),
    },
  });
  return NextResponse.json({ ok: true, account });
}
