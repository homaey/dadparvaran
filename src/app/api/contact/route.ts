import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { notifyAdminViaBale } from "@/modules/notifications/bale-provider";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(200),
  message: z.string().min(5).max(5000),
  // تله ربات: کاربر واقعی این فیلد مخفی را نمی‌بیند و پر نمی‌کند.
  website: z.string().max(200).optional(),
});

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // ربات شناسایی شد: پاسخ موفق می‌دهیم تا متوجه رد شدن نشود، ولی چیزی ذخیره نمی‌کنیم.
    if (data.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (isRateLimited("contact", clientIp(req), RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "تعداد پیام‌های ارسالی بیش از حد مجاز است. لطفاً بعداً تلاش کنید." },
        { status: 429 }
      );
    }

    const { website: _honeypot, ...payload } = data;
    const saved = await db.contactMessage.create({ data: payload });

    // اعلان بعد از ذخیره و بدون await شکست‌پذیر: سرنخ نباید به‌خاطر
    // قطعی پیام‌رسان از دست برود. notifyAdminViaBale خودش throw نمی‌کند.
    await notifyAdminViaBale(
      "پیام جدید از فرم تماس",
      [
        `نام: ${payload.name}`,
        `ایمیل: ${payload.email}`,
        payload.phone ? `تلفن: ${payload.phone}` : null,
        "",
        payload.message,
      ]
        .filter((l) => l !== null)
        .join("\n")
    );

    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
