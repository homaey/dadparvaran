"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Plus, Trash2, Calendar, AlertCircle, Check, Upload } from "lucide-react";

type Holiday = {
  id: number;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
  title: string | null;
  isFixed: boolean;
};

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export default function HolidaysAdminPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("1405");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ year: "1405", month: "1", day: "1", title: "" });
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { fetchData(); }, [yearFilter]);

  async function fetchData() {
    const res = await fetch(`/api/admin/holidays?year=${yearFilter}`);
    if (res.ok) setHolidays(await res.json());
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jalaliYear: Number(addForm.year),
        jalaliMonth: Number(addForm.month),
        jalaliDay: Number(addForm.day),
        title: addForm.title || null,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setSuccess("اضافه شد");
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } else {
      const d = await res.json();
      setError(d.error || "خطا");
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/holidays?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleImport() {
    setError(null);
    try {
      const data = JSON.parse(importText);
      const items = Array.isArray(data) ? data : data.holidays || data.items || data.data || [];
      const mapped = items.map((item: any) => {
        if (item.jalaliYear) return item;
        if (item.date) {
          const parts = String(item.date).replace(/-/g, "/").split("/").map(Number);
          return { jalaliYear: parts[0], jalaliMonth: parts[1], jalaliDay: parts[2], title: item.title || item.name || null };
        }
        return null;
      }).filter(Boolean);

      const res = await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapped),
      });
      if (res.ok) {
        const result = await res.json();
        setSuccess(`${result.imported} تعطیلی وارد شد`);
        setShowImport(false);
        setImportText("");
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const d = await res.json();
        setError(d.error || "خطا در وارد کردن");
      }
    } catch {
      setError("فرمت JSON نامعتبر است");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">مدیریت تعطیلات رسمی</h1>
          <p className="text-sm text-gray-500 mt-1">{holidays.length} تعطیلی در سال {yearFilter}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            وارد کردن انبوه
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-primary-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-800">
            <Plus className="w-4 h-4" />
            افزودن
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}

      {showImport && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-bold text-sm mb-3">وارد کردن انبوه تعطیلات (JSON)</h3>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-32 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono"
            dir="ltr"
            placeholder={'[\n  {"jalaliYear": 1405, "jalaliMonth": 1, "jalaliDay": 1, "title": "نوروز"},\n  {"date": "1405/06/31", "title": "..."}\n]'}
          />
          <div className="flex gap-2 mt-3">
            <button onClick={handleImport} className="bg-primary-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-800">وارد کردن</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">انصراف</button>
          </div>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <input value={addForm.year} onChange={(e) => setAddForm({ ...addForm, year: e.target.value })} placeholder="سال" type="number" required className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <select value={addForm.month} onChange={(e) => setAddForm({ ...addForm, month: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
            {MONTH_NAMES.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
          </select>
          <input value={addForm.day} onChange={(e) => setAddForm({ ...addForm, day: e.target.value })} placeholder="روز" type="number" min={1} max={31} required className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="عنوان (اختیاری)" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <div className="flex gap-2 col-span-2 md:col-span-4">
            <button type="submit" className="bg-primary-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-800">ذخیره</button>
            <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">انصراف</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {[1404, 1405, 1406].map((y) => (
          <button key={y} onClick={() => setYearFilter(String(y))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${yearFilter === String(y) ? "bg-primary-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {y}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">تاریخ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">عنوان</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-24">نوع</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">حذف</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-2.5">{h.jalaliDay} {MONTH_NAMES[h.jalaliMonth - 1]} {h.jalaliYear}</td>
                <td className="px-4 py-2.5 text-gray-600">{h.title || "—"}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${h.isFixed ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                    {h.isFixed ? "ثابت شمسی" : "متغیر"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button onClick={() => handleDelete(h.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {holidays.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">تعطیلی ثبت نشده</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
