"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  CASE_STAGES,
  CONSULTATION_CATEGORIES,
  PREFERRED_CONTACT,
  URGENCY_LEVELS,
} from "@/modules/consultations/web-constants";

/**
 * فرم درخواست مشاوره برای متقاضیانی که حساب بله ندارند.
 *
 * سه گام دارد چون فرم تک‌صفحه‌ای با ده فیلد در موبایل رهاشدگی بالایی دارد؛
 * تقسیم به گام‌های کوتاه با نوار پیشرفت، تکمیل را بالا می‌برد. اعتبارسنجی در
 * هر گام انجام می‌شود تا کاربر خطای فیلد گام اول را در انتهای فرم نبیند.
 *
 * محتوای این فرم مستقیماً به‌صورت کارت درخواست در گروه وکلای بله منتشر می‌شود
 * (POST /api/consultations/web) و هر وکیل می‌تواند آن را بپذیرد. نام و شماره
 * فقط پس از پذیرش و در پیام خصوصیِ وکیلِ پذیرنده فاش می‌شود.
 */

type FormState = {
  clientName: string;
  phone: string;
  email: string;
  preferredContact: (typeof PREFERRED_CONTACT)[number];
  category: string;
  city: string;
  clientRole: string;
  caseStage: string;
  urgency: (typeof URGENCY_LEVELS)[number];
  summary: string;
  acceptedTerms: boolean;
  website: string;
};

const initialState: FormState = {
  clientName: "",
  phone: "",
  email: "",
  preferredContact: "تماس تلفنی",
  category: "",
  city: "",
  clientRole: "",
  caseStage: "",
  urgency: "عادی",
  summary: "",
  acceptedTerms: false,
  website: "",
};

const TOTAL_STEPS = 3;

const STEP_TITLES = [
  { title: "مشخصات تماس", hint: "تا وکیل بتواند با شما ارتباط بگیرد" },
  { title: "موضوع پرونده", hint: "تا درخواست به وکیل متخصص همان حوزه برسد" },
  { title: "شرح ماجرا", hint: "تا ارزیابی اولیه پیش از تماس انجام شود" },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15";

export function WebConsultationForm({ officePhone, officePhoneDisplay }: {
  officePhone: string;
  officePhoneDisplay: string;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    publicCode: string;
    postedToGroup: boolean;
    baleFollowUpUrl: string | null;
  } | null>(null);

  const progress = useMemo(() => `${Math.round((step / TOTAL_STEPS) * 100)}%`, [step]);
  const set = <K extends keyof FormState,>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  function validateStep(): boolean {
    if (step === 1) {
      if (form.clientName.trim().length < 3) {
        setError("نام و نام خانوادگی را کامل بنویسید.");
        return false;
      }
      if (!/^0?9\d{9}$/.test(form.phone.replace(/[\s\-()]/g, "").replace(/^\+98/, "0"))) {
        setError("شماره موبایل معتبر نیست. نمونه‌ی درست: ۰۹۱۲۳۴۵۶۷۸۹");
        return false;
      }
    }
    if (step === 2 && (!form.category || !form.city.trim() || !form.caseStage)) {
      setError("حوزه حقوقی، شهر پرونده و مرحله‌ی فعلی را مشخص کنید.");
      return false;
    }
    setError("");
    return true;
  }

  function next() {
    if (validateStep()) setStep((value) => Math.min(TOTAL_STEPS, value + 1));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.summary.trim().length < 40) {
      setError("شرح موضوع باید دست‌کم ۴۰ نویسه باشد تا وکیل بتواند ارزیابی اولیه کند.");
      return;
    }
    if (!form.acceptedTerms) {
      setError("برای ارسال درخواست باید شرایط را بپذیرید.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/consultations/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ثبت درخواست ناموفق بود.");
      setResult({
        publicCode: payload.publicCode,
        postedToGroup: payload.postedToGroup,
        baleFollowUpUrl: payload.baleFollowUpUrl ?? null,
      });
      trackEvent("consultation_submit", { category: form.category, urgency: form.urgency });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "خطای ناشناخته رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-3xl border border-green-100 bg-green-50/60 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-fa mb-2 text-xl font-bold text-primary-900">درخواست شما ثبت شد</h3>
        <p className="mx-auto mb-6 max-w-md text-sm leading-7 text-gray-600">
          درخواست شما در همین لحظه برای وکلای مؤسسه ارسال شد. اولین وکیلی که آن را بپذیرد،
          در ساعات کاری با شماره‌ی <span dir="ltr" className="font-medium">{form.phone}</span> تماس می‌گیرد.
        </p>

        <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-gray-200 bg-white p-4">
          <span className="mb-2 block text-xs text-gray-500">کد پیگیری</span>
          <div className="flex items-center justify-center gap-2">
            <span dir="ltr" className="font-mono text-lg font-bold text-primary-900">
              {result.publicCode}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(result.publicCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
              className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-700"
              aria-label="کپی کد پیگیری"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copied && <span className="mt-1 block text-xs text-green-600">کپی شد</span>}
        </div>

        {!result.postedToGroup && (
          <p className="mx-auto mb-6 max-w-md rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            درخواست ثبت شده اما ارسال اعلان با تأخیر روبه‌رو شده است. اگر عجله دارید،
            لطفاً مستقیم تماس بگیرید.
          </p>
        )}

        {/* پیشنهاد بله *پس از* ثبت درخواست می‌آید، نه پیش از آن. کاربر دیگر
            مجبور نیست میان «بله دارم / ندارم» تصمیم بگیرد تا بتواند درخواست
            بدهد؛ اگر بله دارد، یک ضربه کافی است تا نتیجه را همان‌جا بگیرد. */}
        {result.baleFollowUpUrl && (
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-[#2AABEE]/25 bg-[#2AABEE]/5 p-5">
            <div className="mb-2 flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#2AABEE]" />
              <h4 className="font-fa font-bold text-primary-900">بله دارید؟</h4>
            </div>
            <p className="mb-4 text-sm leading-7 text-gray-600">
              با یک ضربه، نتیجه را در بله دنبال کنید. به‌محض پذیرش درخواست، پیام
              می‌گیرید و می‌توانید مستقیم با وکیل گفت‌وگو کنید — بدون منتظر ماندن برای تماس.
            </p>
            <a
              href={result.baleFollowUpUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="consultation-success-bale"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-3.5 font-semibold text-white transition-all hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" />
              پیگیری در بله
            </a>
            <p className="mt-3 text-xs leading-6 text-gray-500">
              اگر بله ندارید نیازی به این کار نیست — وکیل تلفنی با شما تماس می‌گیرد.
            </p>
          </div>
        )}

        <a
          href={`tel:${officePhone}`}
          data-cta="consultation-success-tel"
          dir="ltr"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Phone className="h-4 w-4" />
          {officePhoneDisplay}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      {/* نوار پیشرفت */}
      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-fa text-lg font-bold text-primary-900">{STEP_TITLES[step - 1].title}</h3>
          <span className="text-xs text-gray-400">گام {step} از {TOTAL_STEPS}</span>
        </div>
        <p className="mb-3 text-xs text-gray-500">{STEP_TITLES[step - 1].hint}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-gold-500 transition-all duration-300" style={{ width: progress }} />
        </div>
      </div>

      {/* تله ربات — از دید کاربر و صفحه‌خوان پنهان است */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -m-px h-px w-px overflow-hidden opacity-0"
      />

      {step === 1 && (
        <div className="space-y-4">
          <Field label="نام و نام خانوادگی" required htmlFor="clientName">
            <input
              id="clientName"
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              className={inputClass}
              maxLength={100}
              autoComplete="name"
            />
          </Field>
          <Field label="شماره موبایل" required htmlFor="phone" hint="وکیل با همین شماره با شما تماس می‌گیرد.">
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              inputMode="tel"
              dir="ltr"
              placeholder="09123456789"
              maxLength={20}
              autoComplete="tel"
            />
          </Field>
          <Field label="ایمیل" htmlFor="email" hint="اختیاری — برای ارسال مدارک یا خلاصه‌ی مشاوره.">
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              dir="ltr"
              maxLength={150}
              autoComplete="email"
            />
          </Field>
          <Field label="روش ارتباط دلخواه" htmlFor="preferredContact">
            <div className="grid grid-cols-3 gap-2">
              {PREFERRED_CONTACT.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => set("preferredContact", option)}
                  aria-pressed={form.preferredContact === option}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.preferredContact === option
                      ? "border-primary-600 bg-primary-50 text-primary-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="حوزه حقوقی" required htmlFor="category">
            <select
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">انتخاب کنید</option>
              {CONSULTATION_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="شهر مرتبط با پرونده" required htmlFor="city" hint="شهری که پرونده در آن مطرح است یا خواهد شد.">
            <input
              id="city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
              maxLength={100}
              placeholder="مثلاً اهواز"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="مرحله فعلی پرونده" required htmlFor="caseStage">
              <select
                id="caseStage"
                value={form.caseStage}
                onChange={(e) => set("caseStage", e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">انتخاب کنید</option>
                {CASE_STAGES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="سمت شما" htmlFor="clientRole" hint="اختیاری">
              <input
                id="clientRole"
                value={form.clientRole}
                onChange={(e) => set("clientRole", e.target.value)}
                className={inputClass}
                maxLength={100}
                placeholder="خواهان، خوانده، شاکی…"
              />
            </Field>
          </div>
          <Field label="فوریت" htmlFor="urgency">
            <div className="grid grid-cols-3 gap-2">
              {URGENCY_LEVELS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => set("urgency", option)}
                  aria-pressed={form.urgency === option}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.urgency === option
                      ? "border-gold-500 bg-gold-50 text-gold-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Field
            label="شرح موضوع"
            required
            htmlFor="summary"
            hint="ماجرا را کوتاه و روشن بنویسید: چه اتفاقی افتاده، چه مدرکی دارید، چه می‌خواهید. از نوشتن شماره حساب، رمز و اطلاعات بسیار حساس خودداری کنید."
          >
            <textarea
              id="summary"
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              className={`${inputClass} min-h-40 resize-y leading-7`}
              maxLength={2000}
            />
            <div className="mt-1.5 flex justify-between text-xs">
              <span className={form.summary.trim().length < 40 ? "text-gray-400" : "text-green-600"}>
                {form.summary.trim().length < 40
                  ? `دست‌کم ${40 - form.summary.trim().length} نویسه دیگر`
                  : "طول مناسب است"}
              </span>
              <span className="text-gray-400">{form.summary.length} / ۲۰۰۰</span>
            </div>
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-700">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(e) => set("acceptedTerms", e.target.checked)}
              className="mt-1.5 h-4 w-4 cursor-pointer accent-primary-700"
            />
            <span>
              می‌پذیرم که ارسال این فرم به معنی پذیرش پرونده یا تشکیل رابطه‌ی وکیل و موکل نیست
              و نتیجه یا مدت رسیدگی تضمین نمی‌شود.
            </span>
          </label>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="cursor-pointer rounded-xl border border-gray-200 px-6 py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            بازگشت
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={next}
            className="flex-1 cursor-pointer rounded-xl bg-primary-700 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-primary-800"
          >
            ادامه
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-gold-500/25 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ارسال…
              </>
            ) : (
              "ارسال درخواست مشاوره"
            )}
          </button>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-gray-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        نام و شماره‌ی شما در فهرست عمومی نمایش داده نمی‌شود و فقط برای وکیلی که درخواست را
        می‌پذیرد ارسال می‌گردد.
      </p>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  hint,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-800">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>
      {hint && <p className="mb-2 text-xs leading-6 text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}
