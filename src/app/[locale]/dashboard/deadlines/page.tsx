"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Plus, Edit3, Clock, AlertCircle, Check, X } from "lucide-react";

type Deadline = {
  id: number;
  category: string;
  title: string;
  days: number;
  foreignDays: number | null;
  article: string | null;
  defaultMode: string | null;
  orderIndex: number;
  isActive: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  civil: "آیین دادرسی مدنی",
  executionCivil: "اجرای احکام مدنی",
  criminal: "آیین دادرسی کیفری",
};

export default function DeadlinesAdminPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Deadline>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ category: "civil", title: "", days: "", foreignDays: "", article: "", defaultMode: "" });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const res = await fetch("/api/admin/deadlines");
    if (res.ok) setDeadlines(await res.json());
    setLoading(false);
  }

  async function handleUpdate(id: number) {
    setError(null);
    const res = await fetch("/api/admin/deadlines", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) {
      setEditId(null);
      setSuccess("ذخیره شد");
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } else {
      const d = await res.json();
      setError(d.error || "خطا");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addForm,
        days: Number(addForm.days),
        foreignDays: addForm.foreignDays ? Number(addForm.foreignDays) : null,
        article: addForm.article || null,
        defaultMode: addForm.defaultMode || null,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setAddForm({ category: "civil", title: "", days: "", foreignDays: "", article: "", defaultMode: "" });
      setSuccess("اضافه شد");
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } else {
      const d = await res.json();
      setError(d.error || "خطا");
    }
  }

  async function toggleActive(id: number, current: boolean) {
    await fetch("/api/admin/deadlines", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    fetchData();
  }

  const filtered = deadlines.filter((d) => {
    if (filter !== "all" && d.category !== filter) return false;
    if (search && !d.title.includes(search) && !(d.article || "").includes(search)) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">مدیریت مهلت‌های قضایی</h1>
          <p className="text-sm text-gray-500 mt-1">{deadlines.length} مهلت ثبت شده</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-primary-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors">
          <Plus className="w-4 h-4" />
          افزودن مهلت جدید
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="عنوان مهلت" required className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm col-span-2" />
          <input value={addForm.days} onChange={(e) => setAddForm({ ...addForm, days: e.target.value })} placeholder="مدت (روز)" type="number" required className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input value={addForm.foreignDays} onChange={(e) => setAddForm({ ...addForm, foreignDays: e.target.value })} placeholder="مدت خارج (اختیاری)" type="number" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input value={addForm.article} onChange={(e) => setAddForm({ ...addForm, article: e.target.value })} placeholder="ماده قانونی" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <div className="flex gap-2 col-span-2 md:col-span-3">
            <button type="submit" className="bg-primary-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-800">ذخیره</button>
            <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">انصراف</button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <option value="all">همه دسته‌ها</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">عنوان</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-20">مدت</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-20">خارج</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-32">دسته</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-36">ماده</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">وضعیت</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">عمل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    {editId === d.id ? (
                      <input value={editForm.title ?? d.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-lg border px-2 py-1 text-sm" />
                    ) : d.title}
                  </td>
                  <td className="px-4 py-2.5">
                    {editId === d.id ? (
                      <input type="number" value={editForm.days ?? d.days} onChange={(e) => setEditForm({ ...editForm, days: Number(e.target.value) })} className="w-16 rounded-lg border px-2 py-1 text-sm" />
                    ) : `${d.days} روز`}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{d.foreignDays ? `${d.foreignDays} روز` : "—"}</td>
                  <td className="px-4 py-2.5"><span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{CATEGORY_LABELS[d.category] || d.category}</span></td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{d.article || "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => toggleActive(d.id, d.isActive)} className={`w-8 h-5 rounded-full transition-colors ${d.isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${d.isActive ? "translate-x-3" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {editId === d.id ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => handleUpdate(d.id)} className="text-emerald-600 hover:text-emerald-800"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditId(d.id); setEditForm({}); }} className="text-gray-400 hover:text-primary-600"><Edit3 className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
