"use client";
import { Roles } from "@/lib/roles";
import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { workflowLabels, getAllowedTransitions } from "@/modules/workflow/workflow";
import { Card, btnPrimary, inputClass, fieldLabelClass } from "@/components/ui";

export default function WorkflowAction({ task, role, structured }: { task: { id: number; status: string; draftContent: string; reviewFeedback: string }; role: string; structured: boolean }) {
  const targets = getAllowedTransitions(role, task.status);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch(`/api/tasks/${task.id}/workflow`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: f.get("status"), draftContent: f.get("draftContent"), feedback: f.get("feedback") }),
    });
    const data = await res.json();
    setMsg(res.ok ? "وضعیت به‌روزرسانی شد" : data.error);
    if (res.ok) router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 font-fa-display text-lg font-bold text-navy-900">محتوا و اقدام</h2>
      <form onSubmit={submit} className="grid gap-4">
        <label className={fieldLabelClass}>متن پیش‌نویس<textarea className={`${inputClass} leading-8`} name="draftContent" rows={14} defaultValue={task.draftContent} readOnly={structured || role === Roles.ADMIN} /></label>
        {structured && <p className="text-xs text-gray-500">این متن از بخش‌های پیش‌نویس مقاله ساخته می‌شود. برای تغییر محتوا، وارد بخش ادامه مقاله شوید.</p>}
        {(role === Roles.ADMIN || task.reviewFeedback) && (
          <label className={fieldLabelClass}>بازخورد بازبینی<textarea className={inputClass} name="feedback" rows={4} defaultValue={task.reviewFeedback} readOnly={role !== Roles.ADMIN} /></label>
        )}
        {targets.length ? (
          <div className="flex items-center gap-3">
            <select className={inputClass} name="status" required defaultValue=""><option value="" disabled>اقدام بعدی</option>{targets.map(s => <option key={s} value={s}>{workflowLabels[s]}</option>)}</select>
            <button className={btnPrimary}>ثبت اقدام</button>
          </div>
        ) : (
          <p className="text-gray-500">در این وضعیت اقدامی برای نقش شما تعریف نشده است.</p>
        )}
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </form>
    </Card>
  );
}
