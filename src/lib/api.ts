import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function authorize(roles?: string[]) {
  const session = await getCurrentUser();
  if (!session) return { error: NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 }) };
  if (roles && !roles.includes(session.role)) return { error: NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 }) };
  return { session };
}
