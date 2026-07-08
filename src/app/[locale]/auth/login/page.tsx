"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      identifier: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(isRTL ? "ایمیل یا رمز عبور اشتباه است" : "Invalid email or password");
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={isRTL ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran"} className="w-20 h-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">
            {isRTL ? "ورود مدیریت" : "Admin Login"}
          </h1>
          <p className="text-gold-400 font-semibold text-base mt-1">
            {isRTL ? "دادپروران" : "Dadparvaraan"}
          </p>
          <p className="text-gray-400 text-xs">
            {isRTL ? "مهر ایران" : "Mehr Iran"}
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
                {isRTL ? "ایمیل" : "Email"}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder={isRTL ? "example@email.com" : "example@email.com"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pe-12 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded" />
                {isRTL ? "مرا به خاطر بسپار" : "Remember me"}
              </label>
              <Link href={`/${locale}/auth/forgot-password`} className="text-primary-600 hover:text-primary-800">
                {isRTL ? "فراموشی رمز" : "Forgot password?"}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRTL ? "ورود" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-gold-700">
                {isRTL ? "وکیل هستید؟ " : "Are you a lawyer? "}
                <Link href={`/${locale}/auth/login-lawyer`} className="font-semibold underline hover:text-gold-900">
                  {isRTL ? "ورود وکلا" : "Lawyer Login"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
