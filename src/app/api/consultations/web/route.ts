import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { webConsultationInputSchema } from "@/modules/consultations/web-validation";
import { createWebConsultationRequest } from "@/modules/consultations/create-web-request";
import { publishConsultationToLawyersGroup } from "@/modules/consultations/publish-request";

/**
 * ثبت درخواست مشاوره از فرم سایت (متقاضی بدون حساب بله).
 *
 * مسیر خواهرِ /api/consultations است که ورودی مینی‌اپ بله را می‌گیرد. دلیل
 * جدا بودن: آن مسیر initData امضاشده را الزامی می‌کند و بدون آن ۴۰۱ می‌دهد.
 * این‌جا هویت تأییدشده‌ای وجود ندارد، پس اعتبارسنجی و نرخ‌گیریِ متفاوتی دارد.
 *
 * نتیجه در هر دو مسیر یکسان است: یک ConsultationRequest با status=OPEN که
 * روی گروه وکلا در بله منتشر می‌شود و هر وکیل می‌تواند بپذیرد.
 */
function buildBaleFollowUpUrl(clientLinkToken: string | null): string | null {
  const botUrl = process.env.BALE_BOT_PUBLIC_URL?.trim();
  if (!botUrl || !clientLinkToken) return null;
  return `${botUrl.replace(/\/$/, "")}?start=${encodeURIComponent(clientLinkToken)}`;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = webConsultationInputSchema.parse(await request.json());

    // تله ربات: پاسخ موفق می‌دهیم تا ربات متوجه فیلتر شدن نشود، اما چیزی ثبت نمی‌کنیم.
    if (parsed.website) {
      return NextResponse.json({ ok: true, publicCode: "DP-0000-000000", postedToGroup: true }, { status: 201 });
    }

    const saved = await createWebConsultationRequest(parsed);

    let postedToGroup = true;
    try {
      await publishConsultationToLawyersGroup(saved.id);
    } catch (error) {
      // درخواست ثبت شده و در پنل مدیریت قابل پیگیری است؛ فقط اعلان گروه نرسیده.
      postedToGroup = false;
      console.error("Failed to publish web consultation to Bale group", {
        requestId: saved.id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }

    return NextResponse.json(
      {
        ok: true,
        publicCode: saved.publicCode,
        status: saved.status,
        postedToGroup,
        // deep-link «پیگیری در بله». از env سرور ساخته می‌شود نه NEXT_PUBLIC_*،
        // تا تغییر آدرس بازو نیازی به بیلد دوباره‌ی کلاینت نداشته باشد. اگر
        // بازو تنظیم نشده باشد null است و دکمه در فرم رندر نمی‌شود.
        baleFollowUpUrl: buildBaleFollowUpUrl(saved.clientLinkToken),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "اطلاعات فرم نامعتبر است." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "SERVER_ERROR";
    if (message === "CONSULTATION_RATE_LIMITED") {
      return NextResponse.json(
        { error: "با این شماره اخیراً چند درخواست ثبت شده است. لطفاً یک ساعت دیگر تلاش کنید یا تلفنی تماس بگیرید." },
        { status: 429 }
      );
    }
    console.error("Web consultation request failed", { error: message });
    return NextResponse.json({ error: "ثبت درخواست با خطا روبه‌رو شد. لطفاً تلفنی تماس بگیرید." }, { status: 500 });
  }
}
