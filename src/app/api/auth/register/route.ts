import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(["LAWYER"]),
});

// ثبت‌نام عمومی است (بخشی از جریان ثبت‌نام وکیل)، پس نرخ‌گیری IP-محور از ساخت
// انبوه حساب جلوگیری می‌کند بی‌آنکه جریان قانونی را بشکند.
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited("register", clientIp(req), REGISTER_LIMIT, REGISTER_WINDOW_MS)) {
      return NextResponse.json(
        { error: "تعداد تلاش‌های ثبت‌نام بیش از حد مجاز است. لطفاً بعداً تلاش کنید." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = schema.parse(body);

    const existing = await db.user.findFirst({
      where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این ایمیل یا شماره موبایل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
