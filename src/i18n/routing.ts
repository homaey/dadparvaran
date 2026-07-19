import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "fa",
  // زبان مرورگر (Accept-Language) و کوکی نادیده گرفته می‌شود تا ورود به «/» همیشه
  // به نسخه‌ی فارسی برود، نه اینکه برای کاربر انگلیسی‌زبان به /en منتقل شود.
  localeDetection: false,
});
