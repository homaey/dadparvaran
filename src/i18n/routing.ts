import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "fa",
  // زبان مرورگر (Accept-Language) و کوکی نادیده گرفته می‌شود تا ورود به «/» همیشه
  // به نسخه‌ی فارسی برود، نه اینکه برای کاربر انگلیسی‌زبان به /en منتقل شود.
  localeDetection: false,
  // هدر خودکار Link با hreflang تولید نشود: این هدر روی همه‌ی صفحات یکسان است و
  // برای صفحاتی که نسخه‌ی انگلیسی ندارند هم /en را تبلیغ می‌کند (که ریدایرکت می‌شود)،
  // ضمن اینکه x-default آن به ریشه‌ی ریدایرکت‌شونده اشاره دارد.
  // hreflang به‌صورت شرطی و درست در متادیتای هر صفحه تولید می‌شود.
  alternateLinks: false,
});
