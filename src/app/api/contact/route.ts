import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { notifyAdminViaBale } from "@/modules/notifications/bale-provider";

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(200),
  message: z.string().min(5).max(5000),
  // تله ربات: کاربر واقعی این فیلد مخفی را نمی‌بیند و پر نمی‌کند.
  website: z.string().max(200).optional(),
});

// محدودیت نرخ درون‌حافظه‌ای. pm2 در حالت fork تک‌نمونه اجرا می‌شود، پس این
// شمارنده بین همه درخواست‌ها مشترک است. با ری‌استارت صفر می‌شود — که برای
// جلوگیری از اسپم کافی است. اگر روزی به cluster mode رفتیم، به Redis نیاز است.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // پاک‌سازی تنبل تا Map بی‌نهایت رشد نکند
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // ربات شناسایی شد: پاسخ موفق می‌دهیم تا متوجه رد شدن نشود، ولی چیزی ذخیره نمی‌کنیم.
    if (data.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    if (isRateLimited(clientIp(req))) {
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
