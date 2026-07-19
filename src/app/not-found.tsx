"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Home } from "lucide-react";

export default function NotFound() {
  // Locale-aware 404 so English URLs never emit Persian text in their HTML.
  // Falls back to Persian (site default) for locale-less paths.
  const pathname = usePathname();
  const isEN = pathname?.startsWith("/en");
  const isRTL = !isEN;
  const home = isEN ? "/en" : "/fa";

  const quickLinks = isEN
    ? [
        { href: "/en/lawyers", label: "Our Lawyers" },
        { href: "/en/services", label: "Services" },
        { href: "/en/contact", label: "Contact" },
      ]
    : [
        { href: "/fa/lawyers", label: "وکلای ما" },
        { href: "/fa/articles", label: "مقالات" },
        { href: "/fa/contact", label: "تماس" },
      ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4"
    >
      <div className="text-center text-white max-w-lg">
        <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Scale className="w-8 h-8 text-white" />
        </div>

        <div className="text-8xl font-bold text-white/10 mb-2 select-none">
          {isEN ? "404" : "۴۰۴"}
        </div>

        <h1 className="text-2xl font-bold mb-3">
          {isEN ? "Page Not Found" : "صفحه مورد نظر یافت نشد"}
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          {isEN
            ? "The page you are looking for doesn't exist or has been moved."
            : "صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است."}
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href={home}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            {isEN ? "Home" : "صفحه اصلی"}
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-gray-300 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
