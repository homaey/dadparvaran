import { db } from "@/lib/db";
import { CONSULTATION_EVENT_TYPES } from "./constants";
import { createClaimToken, createPublicCode } from "./codes";
import { recordConsultationEvent } from "./events";
import type { WebConsultationInput } from "./web-validation";

/** مبدأ درخواست‌های ثبت‌شده از فرم سایت. مقابلِ "BALE_MINIAPP". */
export const WEB_FORM_SOURCE = "WEB_FORM";

async function uniquePublicCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createPublicCode();
    const exists = await db.consultationRequest.findUnique({ where: { publicCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error("PUBLIC_CODE_GENERATION_FAILED");
}

/**
 * ثبت درخواست مشاوره‌ای که از فرم سایت آمده است.
 *
 * برخلاف مسیر مینی‌اپ، این‌جا هویت تأییدشده‌ای (initData امضاشده‌ی بله) در کار
 * نیست. تنها سه سد در برابر سوءاستفاده داریم:
 *   ۱. تله‌ی ربات (honeypot) که در لایه‌ی API بررسی می‌شود،
 *   ۲. نرخ‌گیری بر اساس شماره‌ی موبایلِ نرمال‌شده،
 *   ۳. اجباری بودن شماره‌ی موبایل که هزینه‌ی ارسال انبوه را بالا می‌برد.
 * شماره تأیید نمی‌شود (پیامک OTP نداریم)؛ وکیل هنگام تماس عملاً آن را می‌سنجد.
 */
export async function createWebConsultationRequest(input: WebConsultationInput) {
  const recentCount = await db.consultationRequest.count({
    where: {
      phone: input.phone,
      source: WEB_FORM_SOURCE,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= 3) throw new Error("CONSULTATION_RATE_LIMITED");

  const request = await db.consultationRequest.create({
    data: {
      publicCode: await uniquePublicCode(),
      claimToken: createClaimToken(),
      source: WEB_FORM_SOURCE,
      status: "OPEN",
      // متقاضی حساب بله ندارد — واگذاری تلفنی انجام می‌شود.
      userBaleId: null,
      userBaleUsername: null,
      clientName: input.clientName,
      phone: input.phone,
      email: input.email || null,
      preferredContact: input.preferredContact,
      category: input.category,
      subCategory: input.subCategory || null,
      city: input.city,
      clientRole: input.clientRole || null,
      caseStage: input.caseStage,
      urgency: input.urgency,
      summary: input.summary,
    },
  });

  await recordConsultationEvent({
    consultationRequestId: request.id,
    eventType: CONSULTATION_EVENT_TYPES.REQUEST_CREATED,
    actorType: "CLIENT",
    actorId: null,
    metadata: { source: WEB_FORM_SOURCE, preferredContact: input.preferredContact },
  });

  return request;
}
