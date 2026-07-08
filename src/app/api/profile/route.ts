import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(3, "نام باید حداقل ۳ کاراکتر باشد"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر وارد کنید").optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // بررسی تکراری نبودن شماره
    if (data.phone) {
      const existing = await db.user.findFirst({
        where: { phone: data.phone, NOT: { id: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "این شماره موبایل قبلاً ثبت شده است" }, { status: 409 });
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        ...(data.phone ? { phone: data.phone } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
