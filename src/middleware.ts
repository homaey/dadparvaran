import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { shouldNoindexEnglish } from "./lib/i18n-pages";

const intlMiddleware = createMiddleware(routing);

// مسیرهایی که محتوای اصلی‌شان فقط فارسی است — ریدایرکت به /fa
const FA_ONLY_PREFIXES = ["/en/articles", "/en/laws", "/en/forms", "/en/tags", "/en/offices", "/en/fees", "/en/faq", "/en/consultation"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/fa";
    return NextResponse.redirect(url, 302);
  }

  // صفحات انگلیسی بدون ترجمه → ریدایرکت 301 به معادل فارسی
  if (FA_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "/fa");
    return NextResponse.redirect(url, 301);
  }

  const response = intlMiddleware(request);

  // صفحات انگلیسی بدون محتوای کامل → noindex (برای مسیرهای باقی‌مانده)
  const localeMatch = pathname.match(/^\/(fa|en)(\/.*)?$/);
  if (localeMatch) {
    const locale = localeMatch[1];
    const rest = localeMatch[2] ?? "";
    if (shouldNoindexEnglish(locale, rest)) {
      response.headers.set("X-Robots-Tag", "noindex, follow");
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
