"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, Save, Globe, Users, Phone, CheckCircle, Loader2 } from "lucide-react";

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

export default function SettingsPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<SiteData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "stats" | "contact">("hero");

  useEffect(() => {
    if (status === "unauthenticated") router.push(`/${locale}/auth/login`);
    if (status === "authenticated" && (session.user as any)?.role !== "ADMIN") {
      router.push(`/${locale}/dashboard`);
    }
  }, [status, session, locale, router]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const tabs = [
    { id: "hero" as const, label: isRTL ? "صفحه اصلی (Hero)" : "Homepage Hero", icon: Globe },
    { id: "stats" as const, label: isRTL ? "آمار و ارقام" : "Statistics", icon: Users },
    { id: "contact" as const, label: isRTL ? "اطلاعات تماس" : "Contact Info", icon: Phone },
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
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isRTL ? "ذخیره همه" : "Save All"}
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
          msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg.type === "ok" && <CheckCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <strong>{isRTL ? "نکته: " : "Note: "}</strong>
        {isRTL
          ? "مقادیر خالی از ترجمه‌های پیش‌فرض سایت استفاده می‌کنند. فقط مقادیری که می‌خواهید سفارشی کنید را پر کنید."
          : "Empty fields fall back to default site translations. Only fill in values you want to customize."}
      </div>
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
