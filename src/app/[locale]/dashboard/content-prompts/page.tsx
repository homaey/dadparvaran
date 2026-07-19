"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FileText, Save, Loader2, CheckCircle, RotateCcw,
  CalendarDays, Shield, RefreshCw, ScrollText, PenTool,
} from "lucide-react";
import { ArticleType } from "@/lib/content-enums";
import { articleTypeLabels, articleTypeRole, articleTypeRoleLabels } from "@/modules/content-strategy/constants";

type PromptEntry = {
  key: string;
  label: string;
  category: string;
  categoryLabel: string;
  defaultValue: string;
};

const TABS = [
  { id: "article", label: "تولید مقاله", icon: FileText },
  { id: "calendar", label: "تقویم محتوا", icon: CalendarDays },
  { id: "review", label: "بازبینی کیفیت", icon: Shield },
  { id: "rewrite", label: "بازنویسی", icon: RefreshCw },
  { id: "forms", label: "اوراق قضایی", icon: ScrollText },
  { id: "category", label: "راهنمای دسته‌بندی", icon: PenTool },
];

// از خود enum خوانده می‌شود؛ فهرست دستی با هر تغییر تاکسونومی بی‌صدا کهنه می‌شد.
const CAT_ORDER = Object.values(ArticleType);

const ROLE_STYLES: Record<string, string> = {
  conversion: "bg-gold-100 text-gold-800",
  traffic: "bg-blue-100 text-blue-700",
  authority: "bg-purple-100 text-purple-700",
};

export default function ContentPromptsPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sysPrompts, setSysPrompts] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<PromptEntry[]>([]);
  const [catPrompts, setCatPrompts] = useState<Record<string, string>>({});
  const [catDefaults, setCatDefaults] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("article");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push(`/${locale}/auth/login`);
    if (status === "authenticated" && (session.user as any)?.role !== "ADMIN") router.push(`/${locale}/dashboard`);
  }, [status, session, locale, router]);

  useEffect(() => {
    fetch("/api/admin/content-prompts")
      .then((r) => r.json())
      .then((d) => {
        setSysPrompts(d.sysPrompts ?? {});
        setEntries(d.entries ?? []);
        setCatPrompts(d.catPrompts ?? {});
        setCatDefaults(d.catDefaults ?? {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/content-prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sysPrompts, catPrompts }),
      });
      if (!res.ok) throw new Error();
      setMsg({ type: "ok", text: isRTL ? "پرامپت‌ها ذخیره شد" : "Prompts saved" });
    } catch {
      setMsg({ type: "err", text: isRTL ? "خطا در ذخیره" : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  function resetSys(key: string) {
    const entry = entries.find((e) => e.key === key);
    if (entry) setSysPrompts((p) => ({ ...p, [key]: entry.defaultValue }));
  }

  function resetCat(type: string) {
    setCatPrompts((p) => ({ ...p, [type]: catDefaults[type] ?? "" }));
  }

  const tabEntries = entries.filter((e) => e.category === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {isRTL ? "مدیریت پرامپت‌های هوش مصنوعی" : "AI Prompts Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRTL
              ? "تمام پرامپت‌های سیستم هوش مصنوعی را از اینجا مدیریت کنید."
              : "Manage all AI system prompts from here."}
          </p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? "ذخیره همه" : "Save All"}
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.type === "ok" && <CheckCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "category" ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {isRTL
              ? "راهنمای اختصاصی هر نوع مقاله که هنگام تولید خودکار به هوش مصنوعی داده می‌شود."
              : "Per-article-type guidance given to AI during generation."}
          </p>
          {CAT_ORDER.map((type) => (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <label className="font-bold text-gray-800 text-sm">{articleTypeLabels[type] ?? type}</label>
                  {articleTypeRole[type] && (
                    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium ${ROLE_STYLES[articleTypeRole[type]] ?? "bg-gray-100 text-gray-600"}`}>
                      {articleTypeRoleLabels[articleTypeRole[type]]}
                    </span>
                  )}
                </div>
                <button onClick={() => resetCat(type)} className="flex items-center gap-1 shrink-0 text-xs text-gray-400 hover:text-primary-600">
                  <RotateCcw className="w-3 h-3" />
                  {isRTL ? "بازگردانی" : "Reset"}
                </button>
              </div>
              <textarea
                value={catPrompts[type] ?? ""}
                onChange={(e) => setCatPrompts((p) => ({ ...p, [type]: e.target.value }))}
                rows={8}
                dir="rtl"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm leading-7 resize-none"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tabEntries.map((entry) => (
            <div key={entry.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-gray-800 text-sm">{entry.label}</label>
                <button onClick={() => resetSys(entry.key)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600">
                  <RotateCcw className="w-3 h-3" />
                  {isRTL ? "بازگردانی" : "Reset"}
                </button>
              </div>
              <textarea
                value={sysPrompts[entry.key] ?? ""}
                onChange={(e) => setSysPrompts((p) => ({ ...p, [entry.key]: e.target.value }))}
                rows={6}
                dir="rtl"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm leading-7 resize-none"
              />
            </div>
          ))}
          {tabEntries.length === 0 && (
            <p className="text-gray-400 text-center py-8">پرامپتی در این دسته موجود نیست</p>
          )}
        </div>
      )}
    </div>
  );
}
