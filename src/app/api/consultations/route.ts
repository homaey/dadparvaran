import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { consultationInputSchema } from "@/modules/consultations/validation";
import { createConsultationRequest } from "@/modules/consultations/create-request";
import { publishConsultationToLawyersGroup } from "@/modules/consultations/publish-request";

export async function POST(request: NextRequest) {
  try {
    const parsed = consultationInputSchema.parse(await request.json());
    if (parsed.website) return NextResponse.json({ ok: true }, { status: 201 });

    const { request: saved, baleUser } = await createConsultationRequest(parsed);
    let postedToGroup = true;
    try {
      await publishConsultationToLawyersGroup(saved.id);
    } catch (error) {
      postedToGroup = false;
      console.error("Failed to publish consultation to Bale group", {
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
        canReceiveBotMessages: baleUser.allowsWriteToPm !== false,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "اطلاعات نامعتبر است." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "SERVER_ERROR";
    if (message === "CONSULTATION_RATE_LIMITED") {
      return NextResponse.json({ error: "تعداد درخواست‌های شما بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." }, { status: 429 });
    }
    if (message === "BALE_PM_PERMISSION_REQUIRED") {
      return NextResponse.json(
        { error: "ابتدا گفت‌وگوی بازوی دادپروران را شروع کنید تا امکان ارسال نتیجه واگذاری وجود داشته باشد." },
        { status: 409 }
      );
    }
    if (message.startsWith("BALE_INIT_DATA_")) {
      return NextResponse.json({ error: "هویت بله معتبر نیست. بازو را دوباره باز کنید." }, { status: 401 });
    }
    console.error("Consultation request failed", { error: message });
    return NextResponse.json({ error: "ثبت درخواست با خطا روبه‌رو شد." }, { status: 500 });
  }
}
