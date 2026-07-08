"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Plus, Trash2, Scale, AlertCircle } from "lucide-react";

type DiyeRate = {
  id: number;
  jalaliYear: number;
  amount: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  updatedAt: string;
};

export default function DiyeRatePage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [rates, setRates] = useState<DiyeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    jalaliYear: "",
    amount: "",
    sourceTitle: "",
    sourceUrl: "",
  });

  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    const res = await fetch("/api/admin/diye-rate");
    if (res.ok) setRates(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/diye-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jalaliYear: Number(form.jalaliYear),
        amount: Number(form.amount.replace(/[,،٬\s]/g, "")),
        sourceTitle: form.sourceTitle || undefined,
        sourceUrl: form.sourceUrl || undefined,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess("نرخ دیه با موفقیت ذخیره شد");
      setForm({ jalaliYear: "", amount: "", sourceTitle: "", sourceUrl: "" });
      fetchRates();
    } else {
      const data = await res.json();
      setError(data.error || "خطا در ذخیره");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا مطمئنید؟")) return;
    await fetch("/api/admin/diye-rate", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRates();
  }

  function formatAmount(amount: string): string {
    try {
      return BigInt(amount).toLocaleString("fa-IR");
    } catch {
      return amount;
    }
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
          <Scale className="w-6 h-6 inline-block me-2 text-gold-500" />
          {isRTL ? "مدیریت نرخ دیه" : "Diye Rate Management"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {isRTL
            ? "نرخ دیه کامل (ریال) مطابق بخشنامه سالانه قوه قضاییه"
            : "Full blood money rate (Rials) per annual judiciary directive"}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-primary-900 mb-4">
            {isRTL ? "ثبت / ویرایش نرخ" : "Add / Edit Rate"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? "سال شمسی" : "Jalali Year"}
              </span>
              <input
                type="number"
                required
                value={form.jalaliYear}
                onChange={(e) => setForm({ ...form, jalaliYear: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="۱۴۰۴"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? "مبلغ دیه کامل (ریال)" : "Full Diye Amount (Rials)"}
              </span>
              <input
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="۱۸,۰۰۰,۰۰۰,۰۰۰"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? "عنوان منبع" : "Source Title"}
              </span>
              <input
                value={form.sourceTitle}
                onChange={(e) => setForm({ ...form, sourceTitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder={isRTL ? "بخشنامه قوه قضاییه" : "Judiciary Directive"}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? "لینک منبع" : "Source URL"}
              </span>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-left focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                dir="ltr"
                placeholder="https://..."
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-primary-900 text-white py-3 font-bold text-sm hover:bg-primary-800 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 inline-block me-1" />
              {saving ? (isRTL ? "در حال ذخیره..." : "Saving...") : (isRTL ? "ذخیره نرخ" : "Save Rate")}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold text-primary-900">
            {isRTL ? "نرخ‌های ثبت‌شده" : "Registered Rates"}
            <span className="text-sm font-normal text-gray-400 ms-2">
              ({rates.length})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4 text-start">{isRTL ? "سال" : "Year"}</th>
                  <th className="p-4 text-start">{isRTL ? "دیه کامل (ریال)" : "Full Diye (Rials)"}</th>
                  <th className="p-4 text-start">{isRTL ? "منبع" : "Source"}</th>
                  <th className="p-4 text-start">{isRTL ? "به‌روزرسانی" : "Updated"}</th>
                  <th className="p-4 text-center w-16"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      {isRTL ? "در حال بارگذاری..." : "Loading..."}
                    </td>
                  </tr>
                ) : rates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      {isRTL ? "هنوز نرخی ثبت نشده" : "No rates registered"}
                    </td>
                  </tr>
                ) : (
                  rates.map((item) => (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-bold">{item.jalaliYear}</td>
                      <td className="p-4 font-mono">{formatAmount(item.amount)}</td>
                      <td className="p-4">
                        {item.sourceUrl ? (
                          <a href={item.sourceUrl} target="_blank" className="text-primary-600 hover:underline">
                            {item.sourceTitle || "مشاهده"}
                          </a>
                        ) : (
                          item.sourceTitle || "—"
                        )}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(item.updatedAt).toLocaleDateString(isRTL ? "fa-IR" : "en-US")}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
