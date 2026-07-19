"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, Save, Globe, Users, Phone, CheckCircle, Loader2, Bot, Zap } from "lucide-react";

interface SiteData {
  siteName_fa?: string;
  siteName_en?: string;
  hero_badge_fa?: string;
  hero_title_fa?: string;
  hero_titleHighlight_fa?: string;
  hero_subtitle_fa?: string;
  hero_badge_en?: string;
  hero_title_en?: string;
  hero_titleHighlight_en?: string;
  hero_subtitle_en?: string;
  stats_cases?: string;
  stats_clients?: string;
  stats_experience?: string;
  stats_lawyers?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address_fa?: string;
  contact_address_en?: string;
}

interface AiSettingsData {
  provider: "openai" | "claude" | "parspack";
  hasApiKey: boolean;
  model: string;
}

export default function SettingsPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<SiteData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "stats" | "contact" | "ai">("hero");

  // AI settings state
  const [aiData, setAiData] = useState<AiSettingsData>({ provider: "openai", hasApiKey: false, model: "" });
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiSaving, setAiSaving] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiMsg, setAiMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push(`/${locale}/auth/login`);
    if (status === "authenticated" && (session.user as any)?.role !== "ADMIN") {
      router.push(`/${locale}/dashboard`);
    }
  }, [status, session, locale, router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/ai-settings").then((r) => r.json()),
    ])
      .then(([siteSettings, aiSettings]) => {
        setData(siteSettings);
        setAiData(aiSettings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function set(key: keyof SiteData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setMsg({ type: "ok", text: isRTL ? "تنظیمات ذخیره شد" : "Settings saved" });
    } catch {
      setMsg({ type: "err", text: isRTL ? "خطا در ذخیره" : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function saveAiSettings() {
    setAiSaving(true);
    setAiMsg(null);
    try {
      const body: Record<string, string> = {
        provider: aiData.provider,
        model: aiData.model,
      };
      if (aiApiKey) body.apiKey = aiApiKey;

      const res = await fetch("/api/admin/ai-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setAiData((prev) => ({ ...prev, hasApiKey: prev.hasApiKey || !!aiApiKey }));
      setAiApiKey("");
      setAiMsg({ type: "ok", text: isRTL ? "تنظیمات AI ذخیره شد" : "AI settings saved" });
    } catch {
      setAiMsg({ type: "err", text: isRTL ? "خطا در ذخیره تنظیمات AI" : "Failed to save AI settings" });
    } finally {
      setAiSaving(false);
    }
  }

  async function testAiConnection() {
    setAiTesting(true);
    setAiMsg(null);
    try {
      const res = await fetch("/api/admin/ai-settings", { method: "POST" });
      const result = await res.json();
      setAiMsg({ type: result.ok ? "ok" : "err", text: result.message });
    } catch {
      setAiMsg({ type: "err", text: isRTL ? "خطا در تست اتصال" : "Connection test failed" });
    } finally {
      setAiTesting(false);
    }
  }

  const defaultModels: Record<string, string[]> = {
    openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
    claude: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001", "claude-opus-4-20250514"],
    parspack: ["openai/gpt-4o-mini", "openai/gpt-4o", "openai/gpt-4.1-mini", "openai/gpt-4.1", "openai/gpt-5.5"],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const tabs = [
    { id: "hero" as const, label: isRTL ? "صفحه اصلی" : "Homepage Hero", icon: Globe },
    { id: "stats" as const, label: isRTL ? "آمار و ارقام" : "Statistics", icon: Users },
    { id: "contact" as const, label: isRTL ? "اطلاعات تماس" : "Contact Info", icon: Phone },
    { id: "ai" as const, label: isRTL ? "هوش مصنوعی" : "AI Settings", icon: Bot },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {isRTL ? "تنظیمات سایت" : "Site Settings"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRTL ? "ویرایش محتوای صفحات سایت از اینجا" : "Edit site page content from here"}
          </p>
        </div>
        {activeTab !== "ai" && (
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isRTL ? "ذخیره همه" : "Save All"}
          </button>
        )}
      </div>

      {msg && activeTab !== "ai" && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
          msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg.type === "ok" && <CheckCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {activeTab === "hero" && (
          <>
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-primary-600">
              {isRTL ? "بخش Hero — نسخه فارسی" : "Hero Section — Persian version"}
            </h2>
            <Field label={isRTL ? "نام سایت (فارسی)" : "Site Name (FA)"} value={data.siteName_fa ?? ""} onChange={(v) => set("siteName_fa", v)} />
            <Field label={isRTL ? "بج / برچسب" : "Badge text (FA)"} value={data.hero_badge_fa ?? ""} onChange={(v) => set("hero_badge_fa", v)} placeholder="موسسه حقوقی معتبر" />
            <Field label={isRTL ? "عنوان اصلی (FA)" : "Main Title (FA)"} value={data.hero_title_fa ?? ""} onChange={(v) => set("hero_title_fa", v)} placeholder="مشاوره و خدمات حقوقی" />
            <Field label={isRTL ? "بخش طلایی عنوان (FA)" : "Highlighted Title (FA)"} value={data.hero_titleHighlight_fa ?? ""} onChange={(v) => set("hero_titleHighlight_fa", v)} placeholder="تخصصی و مطمئن" />
            <Field label={isRTL ? "توضیح زیر عنوان (FA)" : "Subtitle (FA)"} value={data.hero_subtitle_fa ?? ""} onChange={(v) => set("hero_subtitle_fa", v)} textarea placeholder="با بیش از ۲۰ سال تجربه..." />

            <hr className="border-gray-100" />
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-blue-600">
              {isRTL ? "بخش Hero — نسخه انگلیسی" : "Hero Section — English version"}
            </h2>
            <Field label="Site Name (EN)" value={data.siteName_en ?? ""} onChange={(v) => set("siteName_en", v)} />
            <Field label="Badge (EN)" value={data.hero_badge_en ?? ""} onChange={(v) => set("hero_badge_en", v)} placeholder="Trusted Legal Firm" />
            <Field label="Main Title (EN)" value={data.hero_title_en ?? ""} onChange={(v) => set("hero_title_en", v)} placeholder="Legal Consultation &" />
            <Field label="Highlighted Title (EN)" value={data.hero_titleHighlight_en ?? ""} onChange={(v) => set("hero_titleHighlight_en", v)} placeholder="Expert Services" />
            <Field label="Subtitle (EN)" value={data.hero_subtitle_en ?? ""} onChange={(v) => set("hero_subtitle_en", v)} textarea placeholder="With over 20 years of experience..." />
          </>
        )}

        {activeTab === "stats" && (
          <>
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-primary-600">
              {isRTL ? "آمار کارت‌های Hero" : "Hero Stats Cards"}
            </h2>
            <p className="text-xs text-gray-400">{isRTL ? "مقادیر عددی نمایش داده می‌شوند — مثال: ۱۲۰۰+" : "Numeric values shown on the cards — e.g. 1200+"}</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label={isRTL ? "پرونده موفق" : "Successful Cases"} value={data.stats_cases ?? ""} onChange={(v) => set("stats_cases", v)} placeholder="۱۲۰۰+" />
              <Field label={isRTL ? "موکل راضی" : "Satisfied Clients"} value={data.stats_clients ?? ""} onChange={(v) => set("stats_clients", v)} placeholder="۳۵۰۰+" />
              <Field label={isRTL ? "سال تجربه" : "Years Experience"} value={data.stats_experience ?? ""} onChange={(v) => set("stats_experience", v)} placeholder="۲۰+" />
              <Field label={isRTL ? "وکیل متخصص" : "Expert Lawyers"} value={data.stats_lawyers ?? ""} onChange={(v) => set("stats_lawyers", v)} placeholder="۴" />
            </div>
          </>
        )}

        {activeTab === "contact" && (
          <>
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-primary-600">
              {isRTL ? "اطلاعات تماس" : "Contact Information"}
            </h2>
            <Field label={isRTL ? "شماره تلفن" : "Phone"} value={data.contact_phone ?? ""} onChange={(v) => set("contact_phone", v)} placeholder="+98 21 XXXX XXXX" dir="ltr" />
            <Field label={isRTL ? "ایمیل" : "Email"} value={data.contact_email ?? ""} onChange={(v) => set("contact_email", v)} placeholder="info@dadparvaran.com" dir="ltr" />
            <Field label={isRTL ? "آدرس (فارسی)" : "Address (FA)"} value={data.contact_address_fa ?? ""} onChange={(v) => set("contact_address_fa", v)} textarea placeholder="تهران، خیابان..." />
            <Field label={isRTL ? "آدرس (انگلیسی)" : "Address (EN)"} value={data.contact_address_en ?? ""} onChange={(v) => set("contact_address_en", v)} textarea placeholder="Tehran, ..." />
          </>
        )}

        {activeTab === "ai" && (
          <>
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-primary-600 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              {isRTL ? "تنظیمات هوش مصنوعی" : "AI Provider Settings"}
            </h2>
            <p className="text-xs text-gray-500">
              {isRTL
                ? "این تنظیمات برای تولید محتوا، بررسی کیفیت و استراتژی محتوا استفاده می‌شود. همه کاربران (ادمین و وکلا) از همین کلید API استفاده می‌کنند."
                : "These settings are used for content generation, quality review, and content strategy. All users (admin and lawyers) share the same API key."}
            </p>

            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "ارائه‌دهنده هوش مصنوعی" : "AI Provider"}
              </label>
              <div className="flex gap-3">
                {(["openai", "claude", "parspack"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setAiData((prev) => ({
                        ...prev,
                        provider: p,
                        model: defaultModels[p][0],
                      }));
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      aiData.provider === p
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {p === "openai" ? "OpenAI" : p === "claude" ? "Claude (Anthropic)" : "Parspack AI Studio"}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isRTL ? "کلید API" : "API Key"}
              </label>
              {aiData.hasApiKey && !aiApiKey && (
                <p className="text-xs text-green-600 mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {isRTL ? "کلید قبلاً تنظیم شده است. برای تغییر، کلید جدید وارد کنید." : "Key is already set. Enter a new one to change it."}
                </p>
              )}
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder={aiData.hasApiKey ? "••••••••••••" : (aiData.provider === "openai" ? "sk-..." : "sk-ant-...")}
                dir="ltr"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isRTL ? "مدل" : "Model"}
              </label>
              <select
                value={aiData.model || defaultModels[aiData.provider][0]}
                onChange={(e) => setAiData((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
              >
                {defaultModels[aiData.provider].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {isRTL ? "یا مدل سفارشی وارد کنید:" : "Or enter a custom model:"}
              </p>
              <input
                type="text"
                value={aiData.model}
                onChange={(e) => setAiData((prev) => ({ ...prev, model: e.target.value }))}
                placeholder={defaultModels[aiData.provider][0]}
                dir="ltr"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm mt-1"
              />
            </div>

            {/* AI Message */}
            {aiMsg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                aiMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {aiMsg.type === "ok" && <CheckCircle className="w-4 h-4 shrink-0" />}
                {aiMsg.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveAiSettings}
                disabled={aiSaving}
                className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isRTL ? "ذخیره تنظیمات AI" : "Save AI Settings"}
              </button>
              <button
                onClick={testAiConnection}
                disabled={aiTesting || !aiData.hasApiKey}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {aiTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isRTL ? "تست اتصال" : "Test Connection"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Note */}
      {activeTab !== "ai" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          <strong>{isRTL ? "نکته: " : "Note: "}</strong>
          {isRTL
            ? "مقادیر خالی از ترجمه‌های پیش‌فرض سایت استفاده می‌کنند. فقط مقادیری که می‌خواهید سفارشی کنید را پر کنید."
            : "Empty fields fall back to default site translations. Only fill in values you want to customize."}
        </div>
      )}

      {activeTab === "ai" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>{isRTL ? "نکته امنیتی: " : "Security note: "}</strong>
          {isRTL
            ? "کلید API به صورت رمزنگاری‌شده در دیتابیس ذخیره می‌شود. برای امنیت بیشتر، متغیر AI_ENCRYPTION_KEY در محیط سرور باید تنظیم شده باشد."
            : "API key is stored encrypted in the database. For security, AI_ENCRYPTION_KEY environment variable must be set on the server."}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  dir?: string;
}) {
  const cls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          dir={dir}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className={cls}
        />
      )}
    </div>
  );
}
