"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { btnSecondary, inputClass } from "@/components/ui";
import JalaliDateInput from "@/components/JalaliDateInput";

type U = { id: string; name: string };

export default function AssignTask({ taskId, assigneeId, deadline, creators }: { taskId: number; assigneeId: string; deadline: string; creators: U[] }) {
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/tasks/${taskId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: f.get("assigneeId"), deadline: f.get("deadline") }),
    });
    const data = await res.json();
    setMsg(res.ok ? "ذخیره شد" : data.error);
    if (res.ok) router.refresh();
  }

  return (
    <form className="grid grid-cols-1 gap-2 sm:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-1 text-xs text-gray-600">نویسنده<select className={inputClass} name="assigneeId" defaultValue={assigneeId} required>{creators.map(u => <option value={u.id} key={u.id}>{u.name}</option>)}</select></label>
      <div className="grid gap-1 text-xs text-gray-600">
        <span>مهلت</span>
        <JalaliDateInput name="deadline" defaultValue={deadline} required />
      </div>
      <div className="flex items-end gap-2"><button className={btnSecondary}>تخصیص</button><small className="text-gray-500">{msg}</small></div>
    </form>
  );
}
