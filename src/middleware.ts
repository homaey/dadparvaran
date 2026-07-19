import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { shouldNoindexEnglish } from "./lib/i18n-pages";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ریشه‌ی سایت → نسخه فارسی (302 تا در آینده بتوان منطق ترجیح کاربر اضافه کرد)
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/fa";
    return NextResponse.redirect(url, 302);
  }

  const response = intlMiddleware(request);

  // صفحات انگلیسی بدون محتوای کامل → noindex
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
