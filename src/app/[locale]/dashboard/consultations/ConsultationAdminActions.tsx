"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = [
  "OPEN",
  "ASSIGNED",
  "HANDOFF_SENT",
  "CONTACTED",
  "UNDER_REVIEW",
  "QUALIFIED",
  "NOT_A_FIT",
  "REFERRED",
  "CLOSED",
  "CANCELLED",
] as const;

export function ConsultationAdminActions({
  requestId,
  currentStatus,
  lawyers,
}: {
  requestId: number;
  currentStatus: string;
  lawyers: Array<{ id: number; nameFA: string }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [lawyerId, setLawyerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function update(payload: Record<string, unknown>) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/consultations/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "به‌روزرسانی ناموفق بود.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="flex min-w-[260px] gap-2">
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-2 py-2">
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button disabled={loading || status === currentStatus} onClick={() => update({ status })} className="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-50">
          ثبت وضعیت
        </button>
      </div>
      <div className="flex min-w-[260px] gap-2">
        <select value={lawyerId} onChange={(event) => setLawyerId(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-2 py-2">
          <option value="">انتخاب وکیل</option>
          {lawyers.map((lawyer) => <option key={lawyer.id} value={lawyer.id}>{lawyer.nameFA}</option>)}
        </select>
        <button disabled={loading || !lawyerId} onClick={() => update({ assignedLawyerId: Number(lawyerId) })} className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50">
          واگذاری
        </button>
      </div>
      <button
        type="button"
        disabled={loading || !["ASSIGNED", "HANDOFF_SENT"].includes(currentStatus)}
        onClick={async () => {
          setLoading(true);
          setError("");
          try {
            const response = await fetch(`/api/admin/consultations/${requestId}/resend-handoff`, { method: "POST" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "ارسال مجدد ناموفق بود.");
            router.refresh();
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "خطای ناشناخته");
          } finally {
            setLoading(false);
          }
        }}
        className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 disabled:opacity-50"
      >
        ارسال مجدد اطلاعات واگذاری
      </button>
      {error && <p className="max-w-[260px] text-red-700">{error}</p>}
    </div>
  );
}
