"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import { Eye, EyeOff, Loader2, Phone, Scale } from "lucide-react";

export default function LawyerLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";

  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      identifier: form.phone,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(isRTL ? "شماره موبایل یا رمز عبور اشتباه است" : "Invalid phone or password");
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gold-700 via-gold-600 to-gold-500 flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isRTL ? "ورود وکلا" : "Lawyer Login"}
          </h1>
          <p className="text-white/80 text-sm mt-2">
            {isRTL ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-3.5 h-3.5 me-1" />
                {isRTL ? "شماره موبایل" : "Phone Number"}
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                pattern="^09\d{9}$"
                placeholder="09xxxxxxxxx"
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                {isRTL ? "شماره موبایل ثبت‌شده خود را وارد کنید" : "Enter your registered phone number"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "رمز عبور" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pe-12 text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {isRTL ? "رمز پیش‌فرض: شماره موبایل شما" : "Default password: your phone number"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRTL ? "ورود" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-primary-700">
                {isRTL ? "وکیل جدید هستید؟ " : "New lawyer? "}
                <Link href={`/${locale}/auth/register-lawyer`} className="font-semibold underline hover:text-primary-900">
                  {isRTL ? "ثبت‌نام کنید" : "Register here"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
