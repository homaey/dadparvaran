"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  Scale, LayoutDashboard, FileText, Users,
  Settings, LogOut, Menu, X, Bell,
  BookOpen, ShieldCheck, Tag, Landmark, Calculator,
  TrendingUp, Clock, CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  role: "LAWYER" | "ADMIN";
  userName: string;
}

export default function DashboardLayout({ children, role, userName }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isRTL = locale === "fa";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const base = `/${locale}/dashboard`;

  const navItems = {
    LAWYER: [
      { href: base, icon: LayoutDashboard, label: isRTL ? "داشبورد" : "Dashboard" },
      { href: `${base}/articles`, icon: BookOpen, label: isRTL ? "مقالات" : "Articles" },
      { href: `${base}/profile`, icon: Settings, label: isRTL ? "پروفایل" : "Profile" },
    ],
    ADMIN: [
      { href: base, icon: LayoutDashboard, label: isRTL ? "داشبورد" : "Dashboard" },
      { href: `${base}/lawyers`, icon: ShieldCheck, label: isRTL ? "تأیید وکلا" : "Lawyer Approval" },
      { href: `${base}/articles`, icon: BookOpen, label: isRTL ? "مقالات" : "Articles" },
      { href: `${base}/laws`, icon: Landmark, label: isRTL ? "مدیریت قوانین" : "Laws" },
      { href: `${base}/price-index`, icon: TrendingUp, label: isRTL ? "شاخص بها" : "Price Index" },
      { href: `${base}/diye-rate`, icon: Scale, label: isRTL ? "نرخ دیه" : "Diye Rates" },
      { href: `${base}/deadlines`, icon: Clock, label: isRTL ? "مهلت‌های قضایی" : "Deadlines" },
      { href: `${base}/holidays`, icon: CalendarDays, label: isRTL ? "تعطیلات رسمی" : "Holidays" },
      { href: `${base}/forms`, icon: FileText, label: isRTL ? "اوراق قضایی" : "Legal Forms" },
      { href: `${base}/users`, icon: Users, label: isRTL ? "مدیریت کاربران" : "Users" },
      { href: `${base}/profile`, icon: Settings, label: isRTL ? "پروفایل" : "Profile" },
      { href: `${base}/settings`, icon: Settings, label: isRTL ? "تنظیمات" : "Settings" },
    ],
  };

  const items = navItems[role];

  const roleBadge = {
    LAWYER: { label: isRTL ? "وکیل" : "Lawyer", color: "bg-gold-100 text-gold-700" },
    ADMIN: { label: isRTL ? "ادمین" : "Admin", color: "bg-red-100 text-red-700" },
  }[role];

  const Sidebar = () => (
    <aside className={cn(
      "flex flex-col h-full bg-primary-950 text-white w-64 shrink-0",
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt={isRTL ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran"} className="w-12 h-12 object-contain" />
        <div>
          <div className="font-bold text-sm leading-tight">{isRTL ? "دادپروران" : "Dadparvaraan"}</div>
          <div className="text-[10px] text-gray-400 leading-tight">{isRTL ? "مهر ایران" : "Mehr Iran"}</div>
          <div className={cn("text-xs px-1.5 py-0.5 rounded-md font-medium mt-0.5 inline-block", roleBadge.color)}>
            {roleBadge.label}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-gold-500/20 text-gold-300 border border-gold-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{userName}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm px-2 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {isRTL ? "خروج" : "Sign Out"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 ms-auto">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link
              href={`/${locale}`}
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
            >
              {isRTL ? "بازگشت به سایت" : "Back to Site"}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
