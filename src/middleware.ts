import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  if (hostname === "dadparvaran.com" && pathname === "/") {
    return NextResponse.redirect("https://www.dadparvaran.com/fa", 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
