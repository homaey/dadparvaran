"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function LawyerApprovalActions({
  memberId,
  locale,
}: {
  memberId: number;
  locale: string;
}) {
  const router = useRouter();
  const isRTL = locale === "fa";
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function action(status: "APPROVED" | "REJECTED") {
    setLoading(status === "APPROVED" ? "approve" : "reject");
    await fetch("/api/admin/lawyers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, status }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => action("APPROVED")}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {isRTL ? "تأیید" : "Approve"}
      </button>
      <button
        onClick={() => action("REJECTED")}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium border border-red-200 transition-colors"
      >
        {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        {isRTL ? "رد" : "Reject"}
      </button>
    </div>
  );
}
