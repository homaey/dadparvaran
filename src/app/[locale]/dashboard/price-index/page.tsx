"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Plus, Upload, Trash2, TrendingUp, AlertCircle } from "lucide-react";

type PriceIndex = {
  id: number;
  jalaliYear: number;
  jalaliMonth: number;
  value: number;
  sourceTitle: string | null;
  sourceUrl: string | null;
  updatedAt: string;
};

const MONTH_NAMES = [
  "سالانه", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export default function PriceIndexPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [indices, setIndices] = useState<PriceIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    jalaliYear: "",
    jalaliMonth: "1",
    value: "",
    sourceTitle: "بانک مرکزی جمهوری اسلامی ایران",
    sourceUrl: "",
  });

  useEffect(() => {
    fetchIndices();
  }, []);

  async function fetchIndices() {
    const res = await fetch("/api/admin/price-index");
    if (res.ok) setIndices(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/price-index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jalaliYear: Number(form.jalaliYear),
        jalaliMonth: Number(form.jalaliMonth),
        value: form.value,
        sourceTitle: form.sourceTitle || undefined,
        sourceUrl: form.sourceUrl || undefined,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess("شاخص با موفقیت ذخیره شد");
      setForm({ ...form, value: "" });
      fetchIndices();
    } else {
      const data = await res.json();
      setError(data.error || "خطا در ذخیره");
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    const text = await file.text();
    const res = await fetch("/api/admin/price-index", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(`${data.imported} ردیف با موفقیت وارد شد`);
      fetchIndices();
    } else {
      const data = await res.json();
      setError(data.error || "خطا در وارد کردن CSV");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleJsonUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const records = data.monthly_index_flat || (Array.isArray(data) ? data : null);
      if (!records) {
        setError("ساختار فایل JSON نامعتبر — باید آرایه یا شیء با کلید monthly_index_flat باشد");
        return;
      }

      const res = await fetch("/api/admin/price-index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });

      if (res.ok) {
        const result = await res.json();
        setSuccess(`${result.imported} ردیف از JSON با موفقیت وارد شد`);
        fetchIndices();
      } else {
        const result = await res.json();
        setError(result.error || "خطا در وارد کردن JSON");
      }
    } catch {
      setError("فایل JSON معتبر نیست");
    }

    if (jsonFileRef.current) jsonFileRef.current.value = "";
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا مطمئنید؟")) return;
    await fetch("/api/admin/price-index", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchIndices();
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
          <TrendingUp className="w-6 h-6 inline-block me-2 text-gold-500" />
          {isRTL ? "مدیریت شاخص بها" : "Price Index Management"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {isRTL
            ? "شاخص بهای کالاها و خدمات مصرفی (بانک مرکزی) برای محاسبه‌ی خسارت تأخیر تأدیه و مهریه"
            : "Consumer Price Index for delay damage and dowry calculations"}
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
            {isRTL ? "ثبت / ویرایش شاخص ماهانه" : "Add / Edit Monthly Index"}
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
                {isRTL ? "ماه" : "Month"}
              </span>
              <select
                value={form.jalaliMonth}
                onChange={(e) => setForm({ ...form, jalaliMonth: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              >
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? "مقدار شاخص" : "Index Value"}
              </span>
              <input
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder={isRTL ? "مثلاً ۳۰۹۳/۵ یا 3093.5" : "e.g. 3093.5"}
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1">
                {isRTL ? "فرمت فارسی (۳۰۹۳/۵) یا لاتین (3093.5) پذیرفته می‌شود" : "Persian (۳۰۹۳/۵) or Latin (3093.5) format accepted"}
              </p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? "عنوان منبع" : "Source Title"}
              </span>
              <input
                value={form.sourceTitle}
                onChange={(e) => setForm({ ...form, sourceTitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder={isRTL ? "بانک مرکزی" : "Central Bank"}
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
              {saving ? (isRTL ? "در حال ذخیره..." : "Saving...") : (isRTL ? "ذخیره شاخص" : "Save Index")}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <label className="block cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                <Upload className="w-4 h-4" />
                {isRTL ? "وارد کردن از CSV" : "Import CSV"}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>
            <label className="block cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                <Upload className="w-4 h-4" />
                {isRTL ? "وارد کردن از JSON (فرمت بانک مرکزی)" : "Import JSON (CBI format)"}
              </div>
              <input
                ref={jsonFileRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400">
              {isRTL
                ? "CSV: jalaliYear,jalaliMonth,value,sourceTitle | JSON: فایل monthly_index_flat"
                : "CSV: jalaliYear,jalaliMonth,value,sourceTitle | JSON: monthly_index_flat file"}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold text-primary-900">
            {isRTL ? "شاخص‌های ثبت‌شده" : "Registered Indices"}
            <span className="text-sm font-normal text-gray-400 ms-2">
              ({indices.length})
            </span>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                <tr>
                  <th className="p-4 text-start">{isRTL ? "سال" : "Year"}</th>
                  <th className="p-4 text-start">{isRTL ? "ماه" : "Month"}</th>
                  <th className="p-4 text-start">{isRTL ? "شاخص" : "Value"}</th>
                  <th className="p-4 text-start">{isRTL ? "منبع" : "Source"}</th>
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
                ) : indices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      {isRTL ? "هنوز شاخصی ثبت نشده" : "No indices registered"}
                    </td>
                  </tr>
                ) : (
                  indices.map((item) => (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-bold">{item.jalaliYear}</td>
                      <td className="p-4">{MONTH_NAMES[item.jalaliMonth]}</td>
                      <td className="p-4 font-mono">{item.value}</td>
                      <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate">
                        {item.sourceUrl ? (
                          <a href={item.sourceUrl} target="_blank" className="text-primary-600 hover:underline">
                            {item.sourceTitle || "مشاهده"}
                          </a>
                        ) : (
                          item.sourceTitle || "—"
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
