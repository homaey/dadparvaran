import { db } from "@/lib/db";
import { getBaleClient } from "@/modules/bale/client";
import {
  clientLinkedMessage,
  userAssignedMessage,
  userHandoffKeyboard,
} from "@/modules/bale/message-templates";
import { CONSULTATION_EVENT_TYPES } from "./constants";
import { recordConsultationEvent } from "./events";

export type ClientLinkResult =
  | { ok: true; publicCode: string; alreadyLinked: boolean }
  | { ok: false; reason: "TOKEN_INVALID" | "TAKEN_BY_ANOTHER_ACCOUNT" };

/**
 * اتصال حساب بله‌ی متقاضی به درخواستی که پیش‌تر از فرم سایت ثبت شده است.
 *
 * چرا وجود دارد: پیش از این، کاربر برای اینکه نتیجه را در بله بگیرد باید
 * *قبل از* ثبت درخواست تصمیم می‌گرفت و شش قدم می‌رفت (سایت → بازو → /start →
 * مینی‌اپ → فرم). حالا فرم را در سایت پر می‌کند و در صفحه‌ی موفقیت یک دکمه
 * می‌بیند که او را با `?start=<clientLinkToken>` به بازو می‌برد؛ همان یک ضربه
 * حسابش را به درخواست می‌بندد.
 *
 * پس از اتصال، این درخواست از نظر واگذاری دقیقاً مثل درخواست مینی‌اپ رفتار
 * می‌کند: با پذیرش وکیل، پیام و لینک گفت‌وگو برای متقاضی ارسال می‌شود.
 *
 * اگر درخواست پیش از اتصال پذیرفته شده باشد، همان‌جا پیام واگذاری فرستاده
 * می‌شود تا کاربر منتظر رویداد بعدی نماند.
 */
export async function linkClientBaleAccount(input: {
  token: string;
  baleUserId: string;
  baleUsername?: string;
}): Promise<ClientLinkResult> {
  const request = await db.consultationRequest.findUnique({
    where: { clientLinkToken: input.token },
    include: { assignedLawyer: { include: { baleAccount: true } } },
  });
  if (!request) return { ok: false, reason: "TOKEN_INVALID" };

  if (request.userBaleId && request.userBaleId !== input.baleUserId) {
    return { ok: false, reason: "TAKEN_BY_ANOTHER_ACCOUNT" };
  }

  const alreadyLinked = request.userBaleId === input.baleUserId;

  if (!alreadyLinked) {
    // شرط userBaleId: null مسابقه‌ی دو ضربه‌ی همزمان را می‌بندد — دومی صفر ردیف
    // به‌روزرسانی می‌کند و چون baleUserId یکی است، بی‌ضرر رد می‌شود.
    await db.consultationRequest.updateMany({
      where: { id: request.id, userBaleId: null },
      data: {
        userBaleId: input.baleUserId,
        userBaleUsername: input.baleUsername ?? null,
      },
    });

    await recordConsultationEvent({
      consultationRequestId: request.id,
      eventType: CONSULTATION_EVENT_TYPES.CLIENT_BALE_LINKED,
      actorType: "CLIENT",
      actorId: input.baleUserId,
      metadata: { source: request.source, wasAssigned: Boolean(request.assignedLawyerId) },
    });
  }

  const client = getBaleClient();
  const lawyer = request.assignedLawyer;

  if (lawyer?.baleAccount) {
    // درخواست پیش از اتصال پذیرفته شده بود — نتیجه را همین حالا بده.
    const chatUrl = lawyer.baleAccount.balePublicChatUrl;
    await client.sendMessage({
      chatId: input.baleUserId,
      text: userAssignedMessage({
        publicCode: request.publicCode,
        lawyerName: lawyer.nameFA,
        hasChatUrl: Boolean(chatUrl?.trim()),
      }),
      replyMarkup: userHandoffKeyboard({ publicCode: request.publicCode, lawyerChatUrl: chatUrl }),
    });
  } else {
    await client.sendMessage({
      chatId: input.baleUserId,
      text: clientLinkedMessage({ publicCode: request.publicCode, alreadyLinked }),
    });
  }

  return { ok: true, publicCode: request.publicCode, alreadyLinked };
}
