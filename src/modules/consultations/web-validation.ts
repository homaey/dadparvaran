import { z } from "zod";
import {
  CASE_STAGES,
  CONSULTATION_CATEGORIES,
  PREFERRED_CONTACT,
  URGENCY_LEVELS,
} from "./web-constants";

/**
 * فرم مشاوره‌ی سایت — برای متقاضیانی که حساب بله ندارند.
 *
 * تفاوت اصلی با مینی‌اپ (validation.ts): آن‌جا هویت از initData بله می‌آید و
 * تلفن اختیاری است، چون واگذاری از طریق چت بله انجام می‌شود. این‌جا هیچ کانال
 * بازگشتی وجود ندارد جز آنچه کاربر می‌نویسد، پس **تلفن اجباری است** — بدون آن
 * هیچ عضو گروه نمی‌تواند با متقاضی تماس بگیرد و درخواست بلااستفاده می‌ماند.
 */

/** موبایل ایران: ۰۹XXXXXXXXX یا +۹۸۹XXXXXXXXX. ارقام فارسی هم پذیرفته می‌شود. */
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const fa = PERSIAN_DIGITS.indexOf(char);
    if (fa !== -1) return String(fa);
    return String(ARABIC_DIGITS.indexOf(char));
  });
}

/** به فرم استاندارد ۰۹XXXXXXXXX درمی‌آورد، یا null اگر موبایل معتبر نبود. */
export function normalizeIranMobile(raw: string): string | null {
  const digits = normalizeDigits(raw).replace(/[\s\-()]/g, "");
  const withoutCountry = digits
    .replace(/^\+98/, "0")
    .replace(/^0098/, "0")
    .replace(/^98(?=9\d{9}$)/, "0");
  const normalized = withoutCountry.startsWith("9") && withoutCountry.length === 10
    ? `0${withoutCountry}`
    : withoutCountry;
  return /^09\d{9}$/.test(normalized) ? normalized : null;
}

export const webConsultationInputSchema = z.object({
  clientName: z.string().trim().min(3, "نام و نام خانوادگی را کامل بنویسید.").max(100),
  phone: z
    .string()
    .trim()
    .min(1, "شماره تماس الزامی است.")
    .transform((value) => normalizeIranMobile(value))
    .refine((value): value is string => value !== null, {
      message: "شماره موبایل معتبر نیست. نمونه درست: ۰۹۱۲۳۴۵۶۷۸۹",
    }),
  email: z.string().trim().email("ایمیل معتبر نیست.").max(150).optional().or(z.literal("")),
  preferredContact: z.enum(PREFERRED_CONTACT).default("تماس تلفنی"),
  category: z.enum(CONSULTATION_CATEGORIES, { errorMap: () => ({ message: "حوزه حقوقی را انتخاب کنید." }) }),
  subCategory: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().min(2, "شهر مرتبط با پرونده را بنویسید.").max(100),
  clientRole: z.string().trim().max(100).optional().or(z.literal("")),
  caseStage: z.enum(CASE_STAGES, { errorMap: () => ({ message: "مرحله فعلی پرونده را انتخاب کنید." }) }),
  urgency: z.enum(URGENCY_LEVELS).default("عادی"),
  summary: z
    .string()
    .trim()
    .min(40, "شرح موضوع باید دست‌کم ۴۰ نویسه باشد تا وکیل بتواند ارزیابی اولیه کند.")
    .max(2000),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "برای ارسال درخواست باید شرایط را بپذیرید." }),
  }),
  /** تله ربات — کاربر واقعی این را نمی‌بیند، پس همیشه خالی می‌ماند. */
  website: z.string().max(200).optional(),
});

export type WebConsultationInput = z.infer<typeof webConsultationInputSchema>;
