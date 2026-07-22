"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  CASE_STAGES,
  CONSULTATION_CATEGORIES,
  URGENCY_LEVELS,
} from "@/modules/consultations/web-constants";

declare global {
  interface Window {
    Bale?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
        colorScheme?: "light" | "dark";
      };
    };
  }
}

type FormState = {
  clientName: string;
  phone: string;
  category: string;
  subCategory: string;
  city: string;
  clientRole: string;
  caseStage: string;
  urgency: "عادی" | "فوری" | "بسیار فوری";
  summary: string;
  acceptedTerms: boolean;
  website: string;
};

const initialState: FormState = {
  clientName: "",
  phone: "",
  category: "",
  subCategory: "",
  city: "",
  clientRole: "",
  caseStage: "",
  urgency: "عادی",
  summary: "",
  acceptedTerms: false,
  website: "",
};

export function BaleConsultationForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ publicCode: string; postedToGroup: boolean } | null>(null);

  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const webApp = window.Bale?.WebApp;
      if (webApp) {
        webApp.ready();
        webApp.expand();
        webApp.enableClosingConfirmation?.();
        window.clearInterval(timer);
      } else if (attempts >= 100) {
        window.clearInterval(timer);
        setError("کتابخانه مینی‌اپ بله بارگذاری نشد. صفحه را از داخل بازوی رسمی دوباره باز کنید.");
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, []);

  const progress = useMemo(() => `${Math.round((step / 3) * 100)}%`, [step]);
  const set = <K extends keyof FormState,>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function validateStep(): boolean {
    if (step === 1 && (!form.clientName.trim() || !form.category || !form.city.trim())) {
      setError("نام، حوزه حقوقی و شهر را کامل کنید.");
      return false;
    }
    if (step === 2 && (!form.caseStage.trim() || !form.clientRole.trim())) {
      setError("سمت شما و مرحله فعلی پرونده را مشخص کنید.");
      return false;
    }
    setError("");
    return true;
  }

  function next() {
    if (validateStep()) setStep((value) => Math.min(3, value + 1));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.summary.trim().length < 40 || !form.acceptedTerms) {
      setError("شرح موضوع باید دست‌کم ۴۰ نویسه باشد و تأیید شرایط الزامی است.");
      return;
    }

    const initData = window.Bale?.WebApp?.initData;
    if (!initData) {
      setError("این فرم باید از داخل بازوی رسمی دادپروران در بله باز شود.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, initData }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ثبت درخواست ناموفق بود.");
      setResult({ publicCode: payload.publicCode, postedToGroup: payload.postedToGroup });
      window.Bale?.WebApp?.disableClosingConfirmation?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "خطای ناشناخته");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">درخواست ثبت شد</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">کد پیگیری خود را نگه دارید:</p>
        <div className="mx-auto mt-2 rounded-xl bg-slate-100 px-4 py-3 font-mono text-lg font-bold" dir="ltr">
          {result.publicCode}
        </div>
        {!result.postedToGroup && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            درخواست ثبت شده اما اعلان گروه با تأخیر روبه‌رو شده است و از پنل قابل پیگیری است.
          </p>
        )}
        <button
          type="button"
          onClick={() => window.Bale?.WebApp?.close()}
          className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
        >
          بستن
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-[#2AABEE] transition-all" style={{ width: progress }} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Field label="نام و نام خانوادگی">
            <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} className="input" maxLength={100} />
          </Field>
          <Field label="حوزه حقوقی">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input">
              <option value="">انتخاب کنید</option>
              {CONSULTATION_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="شهر مرتبط با پرونده">
            <input value={form.city} onChange={(e) => set("city", e.target.value)} className="input" maxLength={100} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="سمت شما در موضوع">
            <input value={form.clientRole} onChange={(e) => set("clientRole", e.target.value)} placeholder="مثلاً خواهان، خوانده، شاکی یا متهم" className="input" maxLength={100} />
          </Field>
          <Field label="مرحله فعلی پرونده">
            <select value={form.caseStage} onChange={(e) => set("caseStage", e.target.value)} className="input">
              <option value="">انتخاب کنید</option>
              {CASE_STAGES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="فوریت">
            <select value={form.urgency} onChange={(e) => set("urgency", e.target.value as FormState["urgency"])} className="input">
              {URGENCY_LEVELS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Field label="شرح کوتاه موضوع">
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} className="input min-h-36" maxLength={1000} placeholder="بدون ارسال اطلاعات بسیار حساس، اصل موضوع را کوتاه توضیح دهید." />
          </Field>
          <Field label="شماره تماس (اختیاری)">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" inputMode="tel" maxLength={20} />
          </Field>
          <input value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            <input type="checkbox" checked={form.acceptedTerms} onChange={(e) => set("acceptedTerms", e.target.checked)} className="mt-1" />
            <span>می‌پذیرم که ارسال فرم به معنی پذیرش پرونده یا تشکیل رابطه وکیل و موکل نیست و نتیجه یا مدت رسیدگی تضمین نمی‌شود.</span>
          </label>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep((value) => value - 1)} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700">بازگشت</button>
        )}
        {step < 3 ? (
          <button type="button" onClick={next} className="flex-1 rounded-xl bg-[#2AABEE] px-4 py-3 font-semibold text-white">ادامه</button>
        ) : (
          <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#2AABEE] px-4 py-3 font-semibold text-white disabled:opacity-60">
            {submitting ? "در حال ثبت..." : "ثبت درخواست"}
          </button>
        )}
      </div>
      <style jsx>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(203 213 225); padding: 0.75rem; outline: none; background: white; }
        .input:focus { border-color: #2AABEE; box-shadow: 0 0 0 3px rgba(42,171,238,.15); }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-800">{label}</span>{children}</label>;
}
