"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Save, User, Phone, Mail, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const locale = useLocale();
  const isRTL = locale === "fa";

  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name ?? "",
        phone: (session.user as any).phone ?? "",
      });
    }
  }, [session]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await update({ name: form.name });
      setMsg({ type: "ok", text: isRTL ? "اطلاعات با موفقیت ذخیره شد" : "Profile updated successfully" });
    } catch (err: any) {
      setMsg({ type: "err", text: err.message ?? (isRTL ? "خطای سرور" : "Server error") });
    } finally {
      setSaving(false);
    }
  }

  const role = (session?.user as any)?.role;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRTL ? "پروفایل من" : "My Profile"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isRTL ? "اطلاعات شخصی خود را ویرایش کنید" : "Edit your personal information"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
          {session?.user?.name?.charAt(0) ?? "?"}
        </div>
        <div>
          <div className="font-bold text-gray-900">{session?.user?.name}</div>
          <div className="text-sm text-gray-500">{session?.user?.email}</div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
            role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"
          }`}>
            {role === "ADMIN" ? (isRTL ? "ادمین" : "Admin") : (isRTL ? "وکیل" : "Lawyer")}
          </span>
        </div>
      </div>

      <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-600" />
          {isRTL ? "اطلاعات شخصی" : "Personal Information"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {isRTL ? "نام و نام خانوادگی" : "Full Name"} *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            minLength={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder={isRTL ? "نام کامل" : "Full name"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Mail className="inline w-3.5 h-3.5 me-1" />
            {isRTL ? "ایمیل" : "Email"}
          </label>
          <input
            type="email"
            value={session?.user?.email ?? ""}
            disabled
            className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">{isRTL ? "ایمیل قابل تغییر نیست" : "Email cannot be changed"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Phone className="inline w-3.5 h-3.5 me-1" />
            {isRTL ? "شماره موبایل" : "Phone Number"}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            pattern="^09\d{9}$"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="09xxxxxxxxx"
            dir="ltr"
          />
        </div>

        {msg && (
          <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl ${
            msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {msg.type === "ok" && <CheckCircle className="w-4 h-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? (isRTL ? "در حال ذخیره..." : "Saving...") : (isRTL ? "ذخیره تغییرات" : "Save Changes")}
        </button>
      </form>

      {/* Change Password */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPwSaving(true);
          setPwMsg(null);
          try {
            const res = await fetch("/api/profile/password", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pwForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPwMsg({ type: "ok", text: isRTL ? "رمز عبور با موفقیت تغییر کرد" : "Password changed successfully" });
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          } catch (err: any) {
            setPwMsg({ type: "err", text: err.message ?? (isRTL ? "خطای سرور" : "Server error") });
          } finally {
            setPwSaving(false);
          }
        }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary-600" />
          {isRTL ? "تغییر رمز عبور" : "Change Password"}
        </h2>

        {[
          { key: "currentPassword" as const, label: isRTL ? "رمز عبور فعلی" : "Current Password", show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
          { key: "newPassword" as const, label: isRTL ? "رمز عبور جدید" : "New Password", show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
          { key: "confirmPassword" as const, label: isRTL ? "تکرار رمز عبور جدید" : "Confirm New Password", show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
        ].map(({ key, label, show, toggle }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                required
                minLength={key === "currentPassword" ? 1 : 8}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm pe-10"
                dir="ltr"
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        {pwMsg && (
          <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl ${
            pwMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {pwMsg.type === "ok" && <CheckCircle className="w-4 h-4 shrink-0" />}
            {pwMsg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={pwSaving}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Lock className="w-4 h-4" />
          {pwSaving ? (isRTL ? "در حال تغییر..." : "Changing...") : (isRTL ? "تغییر رمز عبور" : "Change Password")}
        </button>
      </form>
    </div>
  );
}
