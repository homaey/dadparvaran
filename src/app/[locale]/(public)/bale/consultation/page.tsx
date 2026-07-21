import Script from "next/script";
import { BaleConsultationForm } from "./BaleConsultationForm";

export const metadata = {
  title: "درخواست مشاوره حقوقی در بله | دادپروران",
  robots: { index: false, follow: false },
};

export default function BaleConsultationPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] px-4 py-6 text-right" dir="rtl">
      <Script src="https://tapi.bale.ai/miniapp.js?3" strategy="afterInteractive" />
      <div className="mx-auto max-w-xl">
        <header className="mb-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-bold text-slate-900">درخواست بررسی اولیه پرونده</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            چند اطلاعات کوتاه ثبت کنید تا درخواست شما بدون نمایش اطلاعات حساس برای وکلای مرتبط ارسال شود.
          </p>
        </header>
        <BaleConsultationForm />
      </div>
    </main>
  );
}
