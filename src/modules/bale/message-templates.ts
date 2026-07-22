import type { BaleInlineKeyboardMarkup } from "./types";

export interface ConsultationTemplateData {
  publicCode: string;
  claimToken: string;
  category: string;
  city: string;
  caseStage: string;
  urgency: string;
  createdAt: Date;
  /** "BALE_MINIAPP" یا "WEB_FORM" — تعیین می‌کند واگذاری چطور انجام می‌شود. */
  source?: string;
}

const faDate = (date: Date) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(date);

/**
 * کارت گروه، پیش از پذیرش. عمداً نام و تلفن متقاضی را نشان نمی‌دهد — این
 * اطلاعات فقط پس از پذیرش و در پیام خصوصی به وکیلِ پذیرنده می‌رود، تا داده‌ی
 * شخصی در گروه چندنفره پخش نشود.
 *
 * خط «مسیر ارتباط» را اضافه کردیم چون وکیل باید پیش از زدن دکمه بداند که
 * پس از پذیرش، تماس تلفنی با اوست یا چت بله خودکار برقرار می‌شود.
 */
export function openGroupMessage(data: ConsultationTemplateData): string {
  const isWebForm = data.source === "WEB_FORM";
  return [
    "🟡 درخواست مشاوره جدید",
    "",
    `کد: ${data.publicCode}`,
    `حوزه: ${data.category}`,
    `شهر پرونده: ${data.city}`,
    `مرحله: ${data.caseStage}`,
    `فوریت: ${data.urgency}`,
    `زمان ثبت: ${faDate(data.createdAt)}`,
    isWebForm ? "مسیر ارتباط: 📞 تماس تلفنی (متقاضی در بله نیست)" : "مسیر ارتباط: 💬 چت در بله",
    "",
    isWebForm
      ? "با پذیرش، نام و شماره تماس متقاضی در پیام خصوصی برای شما ارسال می‌شود."
      : "با پذیرش، مشخصات متقاضی برای شما و لینک گفت‌وگو برای او ارسال می‌شود.",
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
  email?: string | null;
  preferredContact?: string | null;
  category: string;
  city: string;
  caseStage: string;
  urgency: string;
  summary: string;
  source?: string;
}): string {
  const isWebForm = input.source === "WEB_FORM";
  return [
    "درخواست جدید به شما واگذار شد",
    "",
    `کد: ${input.publicCode}`,
    `نام مراجعه‌کننده: ${input.clientName}`,
    input.phone ? `تلفن: ${input.phone}` : null,
    input.email ? `ایمیل: ${input.email}` : null,
    input.preferredContact ? `روش ارتباط دلخواه: ${input.preferredContact}` : null,
    `حوزه: ${input.category}`,
    `شهر: ${input.city}`,
    `مرحله: ${input.caseStage}`,
    `فوریت: ${input.urgency}`,
    "",
    "شرح اولیه:",
    input.summary,
    "",
    // متقاضیِ فرم سایت هیچ اعلانی دریافت نمی‌کند و منتظر تماس است؛ اگر وکیل این
    // را نداند، ممکن است انتظار داشته باشد طرف مقابل خودش پیام بدهد.
    isWebForm
      ? "⚠️ این متقاضی از فرم سایت آمده و حساب بله ندارد — هیچ اعلانی برای او ارسال نشده است. تماس با او بر عهده شماست."
      : null,
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
  /** اگر وکیل لینک گفت‌وگوی عمومی نداشته باشد، متن به «منتظر تماس» تغییر می‌کند. */
  hasChatUrl?: boolean;
}): string {
  return [
    `درخواست شما توسط ${input.lawyerName} پذیرفته شد.`,
    "",
    `کد درخواست: ${input.publicCode}`,
    "",
    input.hasChatUrl === false
      ? "وکیل به‌زودی با شما تماس می‌گیرد. این کد را برای پیگیری نگه دارید."
      : "برای شروع گفت‌وگو روی دکمه زیر بزنید و کد درخواست را در اولین پیام برای وکیل ارسال کنید.",
  ].join("\n");
}

/**
 * دکمه‌های پیام واگذاری به متقاضی.
 *
 * balePublicChatUrl تا وقتی وکیل یوزرنیم عمومی بله نداشته باشد خالی است
 * (فرآیند /link آن را از حساب می‌خواند و ممکن است null باشد). ارسال دکمه با
 * url خالی از سمت بله رد می‌شود و کل پیام واگذاری شکست می‌خورد، پس در آن حالت
 * فقط دکمه‌ی کپی کد را می‌فرستیم و متقاضی منتظر تماس وکیل می‌ماند.
 */
export function userHandoffKeyboard(input: {
  publicCode: string;
  lawyerChatUrl: string;
}): BaleInlineKeyboardMarkup {
  const rows: BaleInlineKeyboardMarkup["inline_keyboard"] = [];
  if (input.lawyerChatUrl?.trim()) {
    rows.push([{ text: "گفت‌وگو با وکیل", url: input.lawyerChatUrl }]);
  }
  rows.push([{ text: "کپی کد درخواست", copy_text: { text: input.publicCode } }]);
  return { inline_keyboard: rows };
}

/**
 * تأیید اتصال حساب بله به درخواستی که از فرم سایت ثبت شده است.
 * هنوز وکیلی آن را نپذیرفته، پس فقط انتظار را روشن می‌کند.
 */
export function clientLinkedMessage(input: {
  publicCode: string;
  alreadyLinked: boolean;
}): string {
  return [
    input.alreadyLinked
      ? "این درخواست از قبل به حساب شما متصل بود."
      : "✅ درخواست شما به حساب بله‌تان متصل شد.",
    "",
    `کد درخواست: ${input.publicCode}`,
    "",
    "به‌محض اینکه یکی از وکلا درخواست را بپذیرد، همین‌جا به شما اطلاع می‌دهیم و",
    "دکمه‌ی گفت‌وگوی مستقیم با وکیل را برایتان می‌فرستیم.",
  ].join("\n");
}

export function startKeyboard(miniAppUrl: string): BaleInlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: "ثبت درخواست مشاوره", web_app: { url: miniAppUrl } }]],
  };
}
