"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeletePlan({ planId, title }: { planId: number; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`تقویم «${title}» حذف شود؟ همه آیتم‌های آن هم پاک می‌شوند.`)) return;
    setBusy(true);
    try {
      let res = await fetch(`/api/admin/content-plans/${planId}`, { method: "DELETE" });
      let data = await res.json();

      // اگر تقویم تأیید شده و وظیفه ساخته، سرور تعداد را برمی‌گرداند تا کاربر آگاهانه تصمیم بگیرد.
      if (res.status === 409 && data.needsForce) {
        if (!confirm(`${data.error}\n\nمطمئن هستید؟ این کار برگشت‌پذیر نیست.`)) return;
        res = await fetch(`/api/admin/content-plans/${planId}?force=true`, { method: "DELETE" });
        data = await res.json();
      }

      if (!res.ok) {
        alert(data.error ?? "حذف ناموفق بود");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      aria-label={`حذف ${title}`}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      حذف
    </button>
  );
}
