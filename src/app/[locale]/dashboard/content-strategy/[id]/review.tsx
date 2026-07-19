"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArticleType, LegalCategory } from "@/lib/content-enums";
import { articleTypeDescriptions, articleTypeLabels, legalCategoryLabels } from "@/modules/content-strategy/constants";
import { Card, Badge, btnPrimary, btnSecondary, inputClass, noticeClass } from "@/components/ui";
import JalaliDateInput from "@/components/JalaliDateInput";

type Item = {
  id: number; title: string; articleType: string; legalCategory: string; keyword: string; searchIntent: string; targetAudience: string;
  popularityScore: number; businessScore: number; seoScore: number; educationalScore: number; priorityScore: number;
  assignedUserId: string | null; deadline: string; status: string; contentPlanId: number; taskId: number | null;
};

export default function CalendarReview({ planId, approved, items, users }: { planId: number; approved: boolean; items: Item[]; users: { id: string; name: string }[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function save(item: Item, form: HTMLFormElement) {
    setBusy(String(item.id));
    setMessage("");
    const f = new FormData(form);
    const body = {
      title: f.get("title"), articleType: f.get("articleType"), legalCategory: f.get("legalCategory"), keyword: item.keyword,
      searchIntent: item.searchIntent, targetAudience: item.targetAudience,
      popularityScore: Number(f.get("popularityScore")), businessScore: Number(f.get("businessScore")),
      seoScore: Number(f.get("seoScore")), educationalScore: Number(f.get("educationalScore")),
      assignedUserId: f.get("assignedUserId") || null, deadline: f.get("deadline"),
    };
    const res = await fetch(`/api/admin/content-plans/${planId}/items/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy("");
    setMessage(res.ok ? "تغییرات ذخیره شد" : data.error);
    if (res.ok) router.refresh();
  }

  async function approve() {
    if (!confirm("با تأیید، همه موارد به وظیفه تولید تبدیل می‌شوند. ادامه می‌دهید؟")) return;
    setBusy("approve");
    const res = await fetch(`/api/admin/content-plans/${planId}/approve`, { method: "POST" });
    const data = await res.json();
    setBusy("");
    setMessage(res.ok ? "تقویم تأیید و وظایف ایجاد شد" : data.error);
    if (res.ok) router.refresh();
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-fa-display text-lg font-bold text-navy-900">آیتم‌های تقویم</h2>
        {!approved && <button className={btnPrimary} disabled={!!busy} onClick={approve}>{busy === "approve" ? "در حال ایجاد وظایف…" : "تأیید نهایی و ایجاد وظایف"}</button>}
      </div>
      {message && <p className={`${noticeClass} mb-4`}>{message}</p>}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map(item => (
          <Card key={item.id}>
            <div className="mb-3 flex items-center gap-3">
              <Badge>{articleTypeLabels[item.articleType]}</Badge>
              <b className="text-navy-800">{Math.round(item.priorityScore)}</b>
              <div className="h-2 min-w-[90px] flex-1 overflow-hidden rounded-full bg-gray-200">
                <i className="block h-full bg-gradient-to-l from-navy-700 to-gold-400" style={{ width: `${item.priorityScore}%` }} />
              </div>
            </div>
            <form onSubmit={e => { e.preventDefault(); void save(item, e.currentTarget); }} className="grid gap-3">
              <label className="grid gap-1 text-sm">عنوان<input className={inputClass} name="title" defaultValue={item.title} disabled={approved} /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span><b>نوع محتوا</b> <small className="text-gray-500">(قالب و پرامپت)</small></span>
                  <select className={inputClass} name="articleType" defaultValue={item.articleType} disabled={approved}>
                    {Object.values(ArticleType).map(type => <option key={type} value={type}>{articleTypeLabels[type]}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span><b>حوزه حقوقی</b> <small className="text-gray-500">(موضوع)</small></span>
                  <select className={inputClass} name="legalCategory" defaultValue={item.legalCategory} disabled={approved}>
                    {Object.values(LegalCategory).map(category => <option key={category} value={category}>{legalCategoryLabels[category]}</option>)}
                  </select>
                </label>
              </div>
              <p className="text-xs leading-6 text-gray-500">{articleTypeDescriptions[item.articleType]}</p>
              <p className="text-sm text-gray-600"><b>کلیدواژه:</b> {item.keyword}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-xs">مسئول<select className={inputClass} name="assignedUserId" defaultValue={item.assignedUserId ?? ""} disabled={approved}><option value="">انتخاب کنید</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
                <div className="grid gap-1 text-xs">
                  <span>انتشار</span>
                  <JalaliDateInput name="deadline" defaultValue={item.deadline.slice(0, 10)} disabled={approved} />
                </div>
              </div>
              <input type="hidden" name="popularityScore" value={item.popularityScore} />
              <input type="hidden" name="businessScore" value={item.businessScore} />
              <input type="hidden" name="seoScore" value={item.seoScore} />
              <input type="hidden" name="educationalScore" value={item.educationalScore} />
              {!approved && <button className={btnSecondary} disabled={busy === String(item.id)}>{busy === String(item.id) ? "…" : "ذخیره"}</button>}
            </form>
          </Card>
        ))}
      </div>
    </section>
  );
}
