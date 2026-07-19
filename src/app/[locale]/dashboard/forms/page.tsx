"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, FileText,
  ChevronDown, ChevronUp, Save, X, FolderTree,
  Sparkles, Loader2,
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

const FORM_STYLES = `
  .form-editor-container {
    --border: #181818;
    --paper: #fff;
    --soft: #f8fafc;
    --line: #d9dee7;
    --blue: #194f8a;
    font-family: "B Nazanin","BNazanin","Nazanin","IRANSans","Vazirmatn","Estedad",Tahoma,Arial,sans-serif;
    font-size: 12px;
    line-height: 1.75;
    color: #111;
    direction: rtl;
  }
  .form-editor-container .page {
    width: 100%;
    background: #fff;
    padding: 6mm;
    box-sizing: border-box;
  }
  .form-editor-container .frame {
    border: 2px solid var(--border);
    padding: 4mm;
    position: relative;
  }
  .form-editor-container .brand-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 0 2mm;
  }
  .form-editor-container .brand-logo { width: 14mm; height: 14mm; margin-bottom: 1mm; }
  .form-editor-container .brand-logo img { width: 100%; height: 100%; object-fit: contain; }
  .form-editor-container .brand-text { font-size: 10px; font-weight: 900; text-align: center; }
  .form-editor-container .brand-sub { font-size: 9px; font-weight: 700; color: #333; text-align: center; }
  .form-editor-container .p-title { text-align: center; font-size: 15px; font-weight: 900; margin: 0 0 3mm; }
  .form-editor-container .top-meta {
    display: grid;
    grid-template-columns: 22mm 1fr 22mm 1fr;
    border: 1px solid var(--border);
    margin-bottom: 2mm;
    font-weight: 700;
    font-size: 10px;
  }
  .form-editor-container .top-meta > div {
    border-left: 1px solid var(--border);
    min-height: 7mm;
    padding: 1mm 1.5mm;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .form-editor-container .top-meta > div:nth-child(2n-1) { background: #f5f5f5; }
  .form-editor-container .top-meta > div:last-child { border-left: 0; }
  .form-editor-container .top-meta .val { justify-content: flex-start; font-weight: 400; }
  .form-editor-container table.print-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 2mm;
    font-size: 10px;
  }
  .form-editor-container .print-table th, .form-editor-container .print-table td {
    border: 1px solid var(--border);
    padding: 1mm;
    vertical-align: middle;
    text-align: center;
    word-break: break-word;
  }
  .form-editor-container .print-table th { background: #f7f7f7; font-weight: 800; }
  .form-editor-container .caption { background: #efefef !important; text-align: right !important; padding-right: 2mm !important; font-size: 11px !important; }
  .form-editor-container .role-cell { width: 18mm; background: #fbfbfb; font-weight: 800; }
  .form-editor-container .value { text-align: right; white-space: pre-wrap; min-height: 5mm; }
  .form-editor-container .section-row td { height: 16mm; vertical-align: top !important; }
  .form-editor-container .label-cell { width: 34mm; background: #f7f7f7; font-weight: 900; text-align: center !important; vertical-align: middle !important; line-height: 1.6; }
  .form-editor-container .body-box { border: 1px solid var(--border); padding: 2mm; margin-top: 1.5mm; min-height: 40mm; }
  .form-editor-container .body-head { font-weight: 900; margin-bottom: 1.5mm; font-size: 11px; }
  .form-editor-container .body-preview { white-space: pre-wrap; text-align: justify; line-height: 1.9; min-height: 30mm; font-size: 11px; }
  .form-editor-container .signature-line {
    height: 12mm;
    border: 1px solid var(--border);
    border-top: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 2mm;
    font-weight: 800;
    font-size: 10px;
  }
  .form-editor-container .footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--border);
    margin-top: 2mm;
    min-height: 14mm;
    font-size: 10px;
  }
  .form-editor-container .footer-grid > div { border-left: 1px solid var(--border); padding: 1.5mm; line-height: 1.7; }
  .form-editor-container .footer-grid > div:last-child { border-left: 0; }

  .form-editor-container [contenteditable=true]:focus {
    outline: 2px solid #6366f1;
    outline-offset: 1px;
    border-radius: 2px;
    background: #eef2ff;
  }
  .form-editor-container [contenteditable=true]:hover {
    background: #f5f3ff;
    cursor: text;
  }
`;

export default function AdminFormsPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";

  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [aiEditing, setAiEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const syncContentFromEditor = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      setForm((f) => ({ ...f, content: html }));
      return html;
    }
    return form.content;
  };

  const handleSave = async () => {
    const currentContent = syncContentFromEditor();
    const payload = {
      ...form,
      content: currentContent,
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

  const handleAiEdit = async () => {
    const currentContent = syncContentFromEditor();
    if (!currentContent.trim()) return;
    setAiEditing(true);
    try {
      const res = await fetch("/api/admin/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentContent, promptKey: "sys_forms_edit" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.result) {
        setForm((f) => ({ ...f, content: data.result }));
        if (contentRef.current) {
          contentRef.current.innerHTML = data.result;
        }
      }
    } catch {
      alert(isRTL ? "خطا در ویرایش با هوش مصنوعی" : "AI edit failed");
    } finally {
      setAiEditing(false);
    }
  };

  const togglePublish = async (t: Template) => {
    await fetch("/api/admin/forms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, isPublished: !t.isPublished }),
    });
    fetchData();
  };

  useEffect(() => {
    if (!showNew || !editingId || !contentRef.current) return;
    const el = contentRef.current;
    el.querySelectorAll(".value, .val, .body-preview, .body-head, .signature-line, .footer-grid div, .brand-text, .brand-sub, .p-title").forEach((node) => {
      (node as HTMLElement).setAttribute("contenteditable", "true");
    });
  }, [showNew, editingId, form.content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <style dangerouslySetInnerHTML={{ __html: FORM_STYLES }} />

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

          {/* Visual Document Editor */}
          {editingId && form.content && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isRTL ? "ویرایش متن سند" : "Edit Document Text"}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {isRTL ? "روی متن کلیک کنید تا ویرایش شود" : "Click on text to edit"}
                  </span>
                  <button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={aiEditing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {aiEditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isRTL ? "بهبود متن با AI" : "Improve text with AI"}
                  </button>
                </div>
              </div>
              <div className="bg-[#e9eaee] rounded-xl border border-gray-200 p-4 overflow-x-auto">
                <div
                  ref={contentRef}
                  className="form-editor-container bg-white mx-auto"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {isRTL
                  ? "قالب و ساختار سند ثابت است. فقط متن‌های داخل سند قابل ویرایش هستند."
                  : "Document structure is fixed. Only text content is editable."}
              </p>
            </div>
          )}

          {/* Hidden HTML textarea for new templates only */}
          {!editingId && (
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
                placeholder='<div class="page" dir="rtl">...</div>'
              />
            </div>
          )}

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
                  {t.category?.nameFA || "—"}
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
                <div className="form-editor-container" dangerouslySetInnerHTML={{ __html: t.content }} />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
