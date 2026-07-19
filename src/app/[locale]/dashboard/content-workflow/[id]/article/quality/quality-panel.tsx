"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Card, btnPrimary, btnSecondary, inputClass, noticeClass } from "@/components/ui";

type Finding = { severity: string; blockKey: string; issue: string; recommendation: string };
type Review = {
  id: number;
  status: string;
  legalScore: number;
  seoScore: number;
  readabilityScore: number;
  legalSummary: string;
  seoSummary: string;
  legalFindings: unknown;
  seoFindings: unknown;
  metaDescription: string | null;
  humanNote: string | null;
  contentSignature: string;
  createdAt: string;
};

function parseReviewValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function findings(value: unknown): Finding[] {
  const parsed = parseReviewValue(value);
  if (Array.isArray(parsed)) return parsed as Finding[];
  if (parsed && typeof parsed === "object" && "findings" in parsed && Array.isArray((parsed as { findings: unknown }).findings))
    return (parsed as { findings: Finding[] }).findings;
  return [];
}

function missingWarnings(value: unknown): string[] {
  const parsed = parseReviewValue(value);
  if (parsed && typeof parsed === "object" && "missingWarnings" in parsed && Array.isArray((parsed as { missingWarnings: unknown }).missingWarnings))
    return (parsed as { missingWarnings: string[] }).missingWarnings;
  return [];
}

export default function QualityPanel({
  taskId,
  taskStatus,
  articleId,
  canRun,
  canDecide,
  currentSignature,
  blockLabels,
  reviews,
}: {
  taskId: number;
  taskStatus: string;
  articleId: number;
  canRun: boolean;
  canDecide: boolean;
  currentSignature: string;
  blockLabels: Record<string, string>;
  reviews: Review[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "review" | "decision" | "publish">("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const latest = reviews[0];
  const legalFindings = latest ? findings(latest.legalFindings) : [];
  const seoFindings = latest ? findings(latest.seoFindings) : [];
  const legalWarnings = latest ? missingWarnings(latest.legalFindings) : [];
  const currentReport = Boolean(latest && latest.contentSignature === currentSignature);
  const approvalBlocked = legalFindings.some((finding) => finding.severity === "critical") || legalWarnings.length > 0;

  async function runReview() {
    setBusy("review");
    setMessage("در حال کنترل حقوقی، خوانایی و قابلیت جست‌وجوی مقاله…");
    const response = await fetch(`/api/articles/${articleId}/quality-review/run`, { method: "POST" });
    const data = await response.json();
    setBusy("");
    setMessage(response.ok ? "بررسی خودکار انجام شد." : data.error);
    if (response.ok) router.refresh();
  }

  async function decide(decision: "approve" | "request_changes") {
    setBusy("decision");
    setMessage("");
    const response = await fetch(`/api/articles/${articleId}/quality-review/${latest.id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note }),
    });
    const data = await response.json();
    setBusy("");
    setMessage(
      response.ok
        ? decision === "approve" ? "مقاله تأیید و آماده انتشار شد." : "مقاله برای اصلاح برگردانده شد."
        : data.error,
    );
    if (response.ok) router.refresh();
  }

  async function publish() {
    setBusy("publish");
    setMessage("");
    const response = await fetch(`/api/tasks/${taskId}/workflow`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error ?? "انتشار مقاله ناموفق بود");
      return;
    }
    router.push("/dashboard/articles");
    router.refresh();
  }

  if (taskStatus === "PUBLISHED") {
    return (
      <Card className="border-green-200 bg-green-50 text-center">
        <CheckCircle className="mx-auto mb-3 h-9 w-9 text-green-700" />
        <h2 className="font-fa-display text-lg font-bold text-green-900">مقاله منتشر شده است</h2>
      </Card>
    );
  }

  return (
    <section className="space-y-5">
      {taskStatus === "APPROVED" && (
        <Card className="border-green-200 bg-green-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-fa-display text-lg font-bold text-green-900">مقاله تأیید شده است</h2>
              <p className="mt-1 text-sm text-green-800">مرحله بعد فقط انتشار در سایت است.</p>
            </div>
            {canDecide && (
              <button type="button" className={btnPrimary} disabled={!!busy} onClick={publish}>
                {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {busy === "publish" ? "در حال انتشار…" : "انتشار در سایت"}
              </button>
            )}
          </div>
        </Card>
      )}

      {taskStatus === "REVIEW" && (!latest || !currentReport) && (
        <Card className="text-center">
          <h2 className="font-fa-display text-lg font-bold text-navy-900">کنترل خودکار مقاله</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-gray-600">
            سیستم مواد و ادعاهای حقوقی، خوانایی و نکات جست‌وجو را بررسی می‌کند و موارد نیازمند توجه را نشان می‌دهد.
          </p>
          {canRun && (
            <button type="button" className={`${btnPrimary} mt-5 min-w-48`} disabled={!!busy} onClick={runReview}>
              {busy === "review" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {busy === "review" ? "در حال بررسی…" : "شروع بررسی خودکار"}
            </button>
          )}
        </Card>
      )}

      {message && <p className={noticeClass}>{message}</p>}

      {latest && currentReport && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Score label="دقت حقوقی" value={latest.legalScore} />
            <Score label="قابلیت جست‌وجو" value={latest.seoScore} />
            <Score label="خوانایی" value={latest.readabilityScore} />
          </section>

          <Card>
            <h2 className="font-fa-display text-lg font-bold text-navy-900">موارد نیازمند توجه</h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">{latest.legalSummary}</p>
            <FindingList items={legalFindings} blockLabels={blockLabels} />
            {legalWarnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <b>هشدارهای ضروری:</b>
                <ul className="mt-2 list-disc space-y-1 pr-5">
                  {legalWarnings.map((warning, index) => <li key={index}>{warning}</li>)}
                </ul>
              </div>
            )}
          </Card>

          {(seoFindings.length > 0 || latest.seoSummary) && (
            <Card>
              <h2 className="font-fa-display text-lg font-bold text-navy-900">پیشنهادهای بهبود متن</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">{latest.seoSummary}</p>
              <FindingList items={seoFindings} blockLabels={blockLabels} />
            </Card>
          )}

          {canDecide && taskStatus === "REVIEW" && latest.status === "AI_REVIEWED" && (
            <Card>
              <h2 className="font-fa-display text-lg font-bold text-navy-900">تصمیم مدیر</h2>
              <p className="mt-1 text-sm text-gray-500">دلیل تأیید یا اصلاحات موردنیاز را کوتاه و روشن بنویسید.</p>
              <textarea
                className={`${inputClass} mt-4`}
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="مثلاً مواد قانونی و متن نهایی بررسی شد."
              />
              {approvalBlocked && (
                <p className={`${noticeClass} mt-3`}>تا رفع هشدار ضروری یا ایراد بحرانی، تأیید مقاله ممکن نیست.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className={btnPrimary} disabled={!!busy || approvalBlocked || note.trim().length < 10} onClick={() => decide("approve")}>
                  {busy === "decision" ? "در حال ثبت…" : "تأیید و آماده انتشار"}
                </button>
                <button type="button" className={btnSecondary} disabled={!!busy || note.trim().length < 3} onClick={() => decide("request_changes")}>
                  بازگرداندن برای اصلاح
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </section>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <span className="text-sm text-gray-500">{label}</span>
      <div className="my-2 font-fa-display text-3xl font-bold text-navy-800">{value} از ۱۰۰</div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <i className="block h-full bg-gradient-to-l from-navy-700 to-gold-400" style={{ width: `${value}%` }} />
      </div>
    </Card>
  );
}

function FindingList({ items, blockLabels }: { items: Finding[]; blockLabels: Record<string, string> }) {
  if (!items.length) return <p className="mt-4 text-sm text-green-700">مورد مهمی پیدا نشد.</p>;
  const severityLabels: Record<string, string> = {
    critical: "بحرانی",
    high: "مهم",
    medium: "متوسط",
    low: "جزئی",
  };
  return (
    <ul className="mt-4 space-y-3">
      {items.map((finding, index) => (
        <li key={index} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-7">
          <b className="text-navy-800">
            {severityLabels[finding.severity] ?? "نیازمند توجه"} · {blockLabels[finding.blockKey] ?? "متن مقاله"}
          </b>
          <p className="text-gray-700">{finding.issue}</p>
          <p className="text-gray-500"><b>راه‌حل:</b> {finding.recommendation}</p>
        </li>
      ))}
    </ul>
  );
}
