"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import {
  UserPlus, Trash2, Shield, ShieldCheck, Loader2,
  CheckCircle, AlertCircle, Eye, EyeOff, Users,
} from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  teamMember: { id: number; status: string } | null;
};

export default function UsersPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ADMIN" as "ADMIN" | "LAWYER" });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);

  async function initLawyerAccounts() {
    setInitLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/init-lawyer-accounts", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const count = data.created?.length ?? 0;
      setMsg({
        type: "ok",
        text: isRTL
          ? `${count} حساب کاربری برای وکلا ایجاد شد${data.skipped?.length ? ` (${data.skipped.length} مورد رد شد)` : ""}`
          : `${count} lawyer accounts created${data.skipped?.length ? ` (${data.skipped.length} skipped)` : ""}`,
      });
      loadUsers();
    } catch (err: any) {
      setMsg({ type: "err", text: err.message ?? (isRTL ? "خطای سرور" : "Server error") });
    } finally {
      setInitLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "ok", text: isRTL ? "کاربر با موفقیت ایجاد شد" : "User created successfully" });
      setForm({ name: "", email: "", password: "", role: "ADMIN" });
      setShowForm(false);
      loadUsers();
    } catch (err: any) {
      setMsg({ type: "err", text: err.message ?? (isRTL ? "خطای سرور" : "Server error") });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(userId: string, userName: string) {
    const confirmed = confirm(
      isRTL
        ? `آیا از حذف کاربر «${userName}» اطمینان دارید؟ این عمل قابل بازگشت نیست.`
        : `Are you sure you want to delete user "${userName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "ok", text: isRTL ? "کاربر حذف شد" : "User deleted" });
      loadUsers();
    } catch (err: any) {
      setMsg({ type: "err", text: err.message ?? (isRTL ? "خطای سرور" : "Server error") });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            {isRTL ? "مدیریت کاربران" : "User Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRTL ? "افزودن و مدیریت کاربران سایت" : "Add and manage site users"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={initLawyerAccounts}
            disabled={initLoading}
            className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            {initLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {isRTL ? "ایجاد حساب وکلا" : "Init Lawyer Accounts"}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setMsg(null); }}
            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {isRTL ? "کاربر جدید" : "New User"}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
          msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {msg.type === "ok" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Create User Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4 text-primary-600" />
            {isRTL ? "ایجاد کاربر جدید" : "Create New User"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
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
                {isRTL ? "ایمیل" : "Email"} *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="user@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isRTL ? "رمز عبور" : "Password"} *
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm pe-10"
                  placeholder={isRTL ? "حداقل ۸ کاراکتر" : "Min 8 characters"}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isRTL ? "نقش" : "Role"} *
              </label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as "ADMIN" | "LAWYER" }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
              >
                <option value="ADMIN">{isRTL ? "ادمین (مدیر سایت)" : "Admin (Site Manager)"}</option>
                <option value="LAWYER">{isRTL ? "وکیل" : "Lawyer"}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {creating ? (isRTL ? "در حال ایجاد..." : "Creating...") : (isRTL ? "ایجاد کاربر" : "Create User")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 cursor-pointer"
            >
              {isRTL ? "انصراف" : "Cancel"}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {isRTL ? "کاربری یافت نشد" : "No users found"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-start px-6 py-3.5 font-semibold text-gray-700">{isRTL ? "نام" : "Name"}</th>
                <th className="text-start px-6 py-3.5 font-semibold text-gray-700">{isRTL ? "ایمیل" : "Email"}</th>
                <th className="text-center px-6 py-3.5 font-semibold text-gray-700">{isRTL ? "نقش" : "Role"}</th>
                <th className="text-center px-6 py-3.5 font-semibold text-gray-700">{isRTL ? "تاریخ عضویت" : "Joined"}</th>
                <th className="text-center px-6 py-3.5 font-semibold text-gray-700">{isRTL ? "عملیات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500" dir="ltr">{u.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      u.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-gold-100 text-gold-700"
                    }`}>
                      {u.role === "ADMIN" ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {u.role === "ADMIN" ? (isRTL ? "ادمین" : "Admin") : (isRTL ? "وکیل" : "Lawyer")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString(isRTL ? "fa-IR" : "en-US")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deleting === u.id}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-50 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title={isRTL ? "حذف" : "Delete"}
                    >
                      {deleting === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
