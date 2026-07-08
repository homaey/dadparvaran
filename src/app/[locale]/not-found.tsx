import Link from "next/link";
import { Scale, Home, ArrowRight, ArrowLeft } from "lucide-react";

export default function NotFound() {
  // Can't use hooks in not-found, so we render both languages
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-lg">
        {/* Logo */}
        <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Scale className="w-8 h-8 text-white" />
        </div>

        {/* 404 */}
        <div className="text-8xl font-bold text-white/10 mb-2 select-none">۴۰۴</div>

        <h1 className="text-2xl font-bold mb-3">
          صفحه مورد نظر یافت نشد
        </h1>
        <p className="text-xl font-bold mb-2 text-gray-300">Page Not Found</p>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
          <br />
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/fa"
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            صفحه اصلی
          </Link>
          <Link
            href="/en"
            className="flex items-center gap-2 border border-white/20 hover:border-white/50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <Link href="/fa/lawyers" className="hover:text-gray-300 transition-colors">وکلای ما</Link>
          <Link href="/fa/articles" className="hover:text-gray-300 transition-colors">مقالات</Link>
          <Link href="/fa/calculators" className="hover:text-gray-300 transition-colors">ماشین‌حساب‌ها</Link>
          <Link href="/fa/laws" className="hover:text-gray-300 transition-colors">قوانین</Link>
          <Link href="/fa/contact" className="hover:text-gray-300 transition-colors">تماس</Link>
        </div>
      </div>
    </div>
  );
}
