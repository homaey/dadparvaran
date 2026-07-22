import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getBaleClient } from "./client";
import { getBaleConfig } from "./config";
import { parseBaleCallbackData } from "./callback-parser";
import { startKeyboard } from "./message-templates";
import type { BaleCallbackQuery, BaleMessage, BaleUpdate } from "./types";
import { activateLawyerBaleAccount } from "@/modules/consultations/activation";
import { claimConsultationRequest } from "@/modules/consultations/claim-request";
import { linkClientBaleAccount } from "@/modules/consultations/link-client-bale";
import { updateConsultationByLawyer } from "@/modules/consultations/update-status";

async function beginUpdate(updateId: string): Promise<boolean> {
  try {
    await db.baleProcessedUpdate.create({ data: { updateId, status: "RECEIVED" } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.baleProcessedUpdate.findUnique({ where: { updateId } });
      if (existing?.status === "PROCESSED") return false;
      await db.baleProcessedUpdate.update({
        where: { updateId },
        data: { status: "RECEIVED", attemptCount: { increment: 1 }, lastError: null },
      });
      return true;
    }
    throw error;
  }
}

async function finishUpdate(updateId: string, error?: unknown): Promise<void> {
  await db.baleProcessedUpdate.update({
    where: { updateId },
    data: error
      ? { status: "FAILED", lastError: error instanceof Error ? error.message.slice(0, 1000) : "Unknown error" }
      : { status: "PROCESSED", processedAt: new Date(), lastError: null },
  });
}

async function handleMessage(message: BaleMessage): Promise<void> {
  if (!message.from || !message.text) return;
  const client = getBaleClient();
  const config = getBaleConfig();
  const text = message.text.trim();
  const baleUserId = String(message.from.id);
  const lawyerAccount = await db.lawyerBaleAccount.findUnique({
    where: { baleUserId },
    include: { lawyer: true },
  });

  if (lawyerAccount && ["/available", "در دسترس هستم"].includes(text)) {
    await db.lawyerBaleAccount.update({ where: { id: lawyerAccount.id }, data: { isAvailable: true } });
    await client.sendMessage({ chatId: message.chat.id, text: "وضعیت شما: آماده پذیرش درخواست جدید." });
    return;
  }

  if (lawyerAccount && ["/unavailable", "درخواست جدید نمی‌پذیرم"].includes(text)) {
    await db.lawyerBaleAccount.update({ where: { id: lawyerAccount.id }, data: { isAvailable: false } });
    await client.sendMessage({ chatId: message.chat.id, text: "وضعیت شما: موقتاً درخواست جدید دریافت نمی‌کنید." });
    return;
  }

  if (lawyerAccount && ["/my_requests", "درخواست‌های فعال من"].includes(text)) {
    const active = await db.consultationRequest.findMany({
      where: {
        assignedLawyerId: lawyerAccount.lawyerId,
        status: { in: ["ASSIGNED", "HANDOFF_SENT", "CONTACTED", "UNDER_REVIEW", "QUALIFIED"] },
      },
      orderBy: { acceptedAt: "desc" },
      take: 20,
      select: { publicCode: true, category: true, status: true, clientName: true },
    });
    await client.sendMessage({
      chatId: message.chat.id,
      text: active.length
        ? ["درخواست‌های فعال شما:", "", ...active.map((item) => `${item.publicCode} | ${item.category} | ${item.clientName} | ${item.status}`)].join("\n")
        : "درخواست فعالی به شما واگذار نشده است.",
    });
    return;
  }

  // ‏/start با payload — از deep-link «پیگیری در بله» در صفحه‌ی موفقیت فرم
  // سایت می‌آید و حساب متقاضی را به همان درخواست می‌بندد. باید پیش از شاخه‌ی
  // /start عمومی بررسی شود، وگرنه پیام خوش‌آمد جای آن را می‌گیرد.
  const startPayload = text.match(/^\/start\s+([A-Za-z0-9_-]{8,64})$/);
  if (startPayload) {
    const result = await linkClientBaleAccount({
      token: startPayload[1],
      baleUserId,
      baleUsername: message.from.username,
    });
    if (!result.ok) {
      await client.sendMessage({
        chatId: message.chat.id,
        text:
          result.reason === "TAKEN_BY_ANOTHER_ACCOUNT"
            ? "این درخواست پیش‌تر به حساب بله دیگری متصل شده است."
            : "این لینک معتبر نیست. لطفاً دوباره از صفحه‌ی درخواست مشاوره اقدام کنید.",
      });
    }
    // پیام موفقیت را خودِ linkClientBaleAccount می‌فرستد، چون بسته به اینکه
    // درخواست پذیرفته شده باشد یا نه، دو پیام متفاوت لازم است.
    return;
  }

  if (text === "/start" || text.startsWith("/start ")) {
    await client.sendMessage({
      chatId: message.chat.id,
      text: lawyerAccount
        ? [
            `سلام ${lawyerAccount.lawyer.nameFA}.`,
            "",
            "دستورهای وکیل:",
            "/available — آماده پذیرش",
            "/unavailable — توقف پذیرش",
            "/my_requests — درخواست‌های فعال من",
          ].join("\n")
        : [
            "سلام؛ به سامانه درخواست مشاوره دادپروران خوش آمدید.",
            "",
            "برای ثبت درخواست، دکمه زیر را بزنید. ارسال درخواست به معنی پذیرش وکالت نیست.",
          ].join("\n"),
      ...(lawyerAccount ? {} : { replyMarkup: startKeyboard(config.BALE_MINIAPP_URL) }),
    });
    return;
  }

  const linkMatch = text.match(/^\/link\s+([A-Za-z0-9-]{8,40})$/i);
  if (linkMatch) {
    try {
      const result = await activateLawyerBaleAccount({
        code: linkMatch[1],
        baleUserId: String(message.from.id),
        baleUsername: message.from.username,
      });
      await client.sendMessage({
        chatId: message.chat.id,
        text: [
          `حساب بله شما به پروفایل ${result.lawyer.nameFA} متصل شد.`,
          "",
          "برای فعال‌شدن دریافت درخواست‌ها، مدیر باید لینک عمومی حساب و وضعیت تأیید را بررسی کند.",
        ].join("\n"),
      });
    } catch (error) {
      await client.sendMessage({
        chatId: message.chat.id,
        text: "کد فعال‌سازی نامعتبر، منقضی یا قبلاً استفاده شده است.",
      });
    }
  }
}

function claimReasonText(reason: string): string {
  switch (reason) {
    case "NOT_REGISTERED":
      return "حساب بله شما به پروفایل وکیل متصل نشده است.";
    case "NOT_ELIGIBLE":
      return "شما مجاز به پذیرش این درخواست نیستید.";
    case "CAPACITY_FULL":
      return "ظرفیت فعال شما تکمیل است.";
    case "ALREADY_CLAIMED":
      return "این درخواست قبلاً توسط وکیل دیگری پذیرفته شده است.";
    default:
      return "درخواست پیدا نشد یا قابل پذیرش نیست.";
  }
}

async function handleCallback(query: BaleCallbackQuery): Promise<void> {
  const client = getBaleClient();
  const parsed = parseBaleCallbackData(query.data);
  if (!parsed) {
    await client.answerCallbackQuery({ callbackQueryId: query.id, text: "دستور نامعتبر است.", showAlert: true });
    return;
  }

  try {
    if (parsed.kind === "claim") {
      const result = await claimConsultationRequest({
        claimToken: parsed.token,
        baleUserId: String(query.from.id),
      });
      if (!result.ok) {
        await client.answerCallbackQuery({ callbackQueryId: query.id, text: claimReasonText(result.reason), showAlert: true });
        return;
      }
      await client.answerCallbackQuery({ callbackQueryId: query.id, text: `درخواست ${result.publicCode} به شما واگذار شد.` });
      return;
    }

    await updateConsultationByLawyer({
      claimToken: parsed.token,
      baleUserId: String(query.from.id),
      action: parsed.action,
    });
    await client.answerCallbackQuery({ callbackQueryId: query.id, text: "وضعیت ثبت شد." });
  } catch (error) {
    await client.answerCallbackQuery({
      callbackQueryId: query.id,
      text: error instanceof Error ? error.message.slice(0, 180) : "خطا در پردازش درخواست",
      showAlert: true,
    });
  }
}

export async function handleBaleUpdate(update: BaleUpdate): Promise<void> {
  const updateId = String(update.update_id);
  if (!(await beginUpdate(updateId))) return;

  try {
    if (update.callback_query) await handleCallback(update.callback_query);
    else if (update.message) await handleMessage(update.message);
    await finishUpdate(updateId);
  } catch (error) {
    await finishUpdate(updateId, error);
    throw error;
  }
}
