import type { BaleInlineKeyboardMarkup } from "./types";

export interface ConsultationTemplateData {
  publicCode: string;
  claimToken: string;
  category: string;
  city: string;
  caseStage: string;
  urgency: string;
  createdAt: Date;
}

const faDate = (date: Date) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(date);

export function openGroupMessage(data: ConsultationTemplateData): string {
  return [
    "🟡 درخواست مشاوره جدید",
    "",
    `کد: ${data.publicCode}`,
    `حوزه: ${data.category}`,
    `شهر پرونده: ${data.city}`,
    `مرحله: ${data.caseStage}`,
    `فوریت: ${data.urgency}`,
    `زمان ثبت: ${faDate(data.createdAt)}`,
    "",
    "برای دریافت درخواست، دکمه زیر را بزنید.",
  ].join("\n");
}

export function claimKeyboard(claimToken: string): BaleInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: "پذیرش درخواست", callback_data: `claim:${claimToken}` }]],
  };
}

export function assignedGroupMessage(input: {
  publicCode: string;
  category: string;
  lawyerName: string;
  acceptedAt: Date;
}): string {
  return [
    "🟢 درخواست پذیرفته شد",
    "",
    `کد: ${input.publicCode}`,
    `حوزه: ${input.category}`,
    `پذیرفته‌شده توسط: ${input.lawyerName}`,
    `زمان پذیرش: ${faDate(input.acceptedAt)}`,
  ].join("\n");
}

export function lawyerPrivateMessage(input: {
  publicCode: string;
  clientName: string;
  phone?: string | null;
  category: string;
  city: string;
  caseStage: string;
  urgency: string;
  summary: string;
}): string {
  return [
    "درخواست جدید به شما واگذار شد",
    "",
    `کد: ${input.publicCode}`,
    `نام مراجعه‌کننده: ${input.clientName}`,
    input.phone ? `تلفن: ${input.phone}` : null,
    `حوزه: ${input.category}`,
    `شهر: ${input.city}`,
    `مرحله: ${input.caseStage}`,
    `فوریت: ${input.urgency}`,
    "",
    "شرح اولیه:",
    input.summary,
    "",
    "این اطلاعات صرفاً برای بررسی اولیه است و پذیرش آن به معنی قبول رسمی وکالت نیست.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function lawyerStatusKeyboard(claimToken: string): BaleInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "ارتباط برقرار شد", callback_data: `status:${claimToken}:contacted` }],
      [
        { text: "کاربر پاسخ نداد", callback_data: `status:${claimToken}:no_answer` },
        { text: "ارجاع به مدیر", callback_data: `status:${claimToken}:return_admin` },
      ],
      [
        { text: "عدم تناسب", callback_data: `status:${claimToken}:not_fit` },
        { text: "پایان بررسی", callback_data: `status:${claimToken}:close` },
      ],
    ],
  };
}

export function userAssignedMessage(input: {
  publicCode: string;
  lawyerName: string;
}): string {
  return [
    `درخواست شما توسط ${input.lawyerName} پذیرفته شد.`,
    "",
    `کد درخواست: ${input.publicCode}`,
    "",
    "برای شروع گفت‌وگو روی دکمه زیر بزنید و کد درخواست را در اولین پیام برای وکیل ارسال کنید.",
  ].join("\n");
}

export function userHandoffKeyboard(input: {
  publicCode: string;
  lawyerChatUrl: string;
}): BaleInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "گفت‌وگو با وکیل", url: input.lawyerChatUrl }],
      [{ text: "کپی کد درخواست", copy_text: { text: input.publicCode } }],
    ],
  };
}

export function startKeyboard(miniAppUrl: string): BaleInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: "ثبت درخواست مشاوره", web_app: { url: miniAppUrl } }]],
  };
}
