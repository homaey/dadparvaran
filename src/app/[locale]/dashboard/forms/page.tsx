"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, FileText,
  ChevronDown, ChevronUp, Save, X, FolderTree,
} from "lucide-react";

interface Category {
  id: number;
  nameFA: string;
  nameEN: string;
  slug: string;
  order: number;
}

interface Template {
  id: number;
  slug: string;
  categoryId: number | null;
  category: Category | null;
  docType: string;
  titleFA: string;
  titleEN: string;
  descFA: string;
  descEN: string;
  content: string;
  isPublished: boolean;
  order: number;
}

const DOC_TYPES = [
  { value: "petition", label: "دادخواست" },
  { value: "complaint", label: "شکواییه" },
  { value: "declaration", label: "اظهارنامه" },
  { value: "appeal", label: "تجدیدنظرخواهی" },
];

export default function AdminFormsPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";

  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    slug: "", categoryId: "" as string, docType: "petition",
    titleFA: "", titleEN: "", descFA: "", descEN: "",
    content: "", isPublished: true, order: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/forms");
    const data = await res.json();
    setCategories(data.categories || []);
    setTemplates(data.templates || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({
      slug: "", categoryId: "", docType: "petition",
      titleFA: "", titleEN: "", descFA: "", descEN: "",
      content: "", isPublished: true, order: 0,
    });
    setEditingId(null);
    setShowNew(false);
  };

  const startEdit = (t: Template) => {
    setForm({
      slug: t.slug,
      categoryId: t.categoryId?.toString() || "",
      docType: t.docType,
      titleFA: t.titleFA,
      titleEN: t.titleEN,
      descFA: t.descFA,
      descEN: t.descEN,
      content: t.content,
      isPublished: t.isPublished,
      order: t.order,
    });
    setEditingId(t.id);
    setShowNew(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      ...(editingId ? { id: editingId } : {}),
    };

    const res = await fetch("/api/admin/forms", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isRTL ? "آیا از حذف اطمینان دارید؟" : "Are you sure?")) return;
    await fetch(`/api/admin/forms?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const togglePublish = async (t: Template) => {
    await fetch("/api/admin/forms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, isPublished: !t.isPublished }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold text-gray-900 ${isRTL ? "font-fa" : ""}`}>
            {isRTL ? "مدیریت اوراق قضایی" : "Legal Forms Management"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? `${templates.length} نمونه در ${categories.length} دسته‌بندی` : `${templates.length} templates in ${categories.length} categories`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowNew(true); }}
          className="inline-flex items-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isRTL ? "افزودن نمونه" : "Add Template"}
        </button>
      </div>

      {/* New/Edit Form */}
      {showNew && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? (isRTL ? "ویرایش نمونه" : "Edit Template") : (isRTL ? "نمونه جدید" : "New Template")}
            </h2>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "عنوان فارسی" : "Title (FA)"} *</label>
              <input
                value={form.titleFA}
                onChange={(e) => setForm({ ...form, titleFA: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "عنوان انگلیسی" : "Title (EN)"}</label>
              <input
                value={form.titleEN}
                onChange={(e) => setForm({ ...form, titleEN: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "اسلاگ (URL)" : "Slug"} *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                dir="ltr"
                placeholder="dadkhast-motalebe-vajh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "نوع سند" : "Doc Type"} *</label>
              <select
                value={form.docType}
                onChange={(e) => setForm({ ...form, docType: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{isRTL ? dt.label : dt.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "دسته‌بندی" : "Category"}</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{isRTL ? "بدون دسته‌بندی" : "No Category"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameFA}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "ترتیب" : "Order"}</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "توضیح فارسی" : "Description (FA)"}</label>
              <textarea
                value={form.descFA}
                onChange={(e) => setForm({ ...form, descFA: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                rows={2}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? "توضیح انگلیسی" : "Description (EN)"}</label>
              <textarea
                value={form.descEN}
                onChange={(e) => setForm({ ...form, descEN: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                rows={2}
                dir="ltr"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isRTL ? "محتوای سند (HTML)" : "Document Content (HTML)"} *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
              rows={12}
              dir="ltr"
              placeholder='<div class="legal-form-doc" dir="rtl">...</div>'
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{isRTL ? "منتشر شده" : "Published"}</span>
            </label>
            <div className="flex-1" />
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {isRTL ? "انصراف" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={!form.slug || !form.titleFA}
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isRTL ? "ذخیره" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">{isRTL ? "عنوان" : "Title"}</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">{isRTL ? "دسته" : "Category"}</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">{isRTL ? "نوع" : "Type"}</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">{isRTL ? "وضعیت" : "Status"}</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">{isRTL ? "عملیات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{t.titleFA}</div>
                  <div className="text-xs text-gray-400 mt-0.5" dir="ltr">{t.slug}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {t.category?.nameFA || (isRTL ? "—" : "—")}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                    {DOC_TYPES.find(d => d.value === t.docType)?.label || t.docType}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => togglePublish(t)} className="cursor-pointer">
                    {t.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Eye className="w-4 h-4" /> {isRTL ? "فعال" : "Active"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <EyeOff className="w-4 h-4" /> {isRTL ? "غیرفعال" : "Hidden"}
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 cursor-pointer"
                      title={isRTL ? "پیش‌نمایش" : "Preview"}
                    >
                      {expandedId === t.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-gold-600 cursor-pointer"
                      title={isRTL ? "ویرایش" : "Edit"}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                      title={isRTL ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a
                      href={`/${locale}/forms/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-primary-600"
                      title={isRTL ? "مشاهده در سایت" : "View on site"}
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  {isRTL ? "هنوز نمونه‌ای ثبت نشده است" : "No templates yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Expanded preview */}
        {expandedId && (() => {
          const t = templates.find(x => x.id === expandedId);
          if (!t) return null;
          return (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                {isRTL ? "پیش‌نمایش محتوا:" : "Content Preview:"}
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: t.content }} />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
