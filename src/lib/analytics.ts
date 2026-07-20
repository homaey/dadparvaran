/**
 * ردیابی رویداد به‌صورت همزمان روی GA4 و Umami.
 *
 * هر دو ردیاب مستقل کار می‌کنند: اگر کاربر ایرانی GA4 برایش لود نشده باشد،
 * فراخوانی `gtag` بی‌صدا رد می‌شود و Umami رویداد را ثبت می‌کند. اگر Umami
 * هم لود نشده (بلوکر مرورگر یا خطای شبکه)، فراخوانی همچنان throw نمی‌کند.
 *
 * این تابع در این جلسه در جایی صدا زده نمی‌شود؛ فاز D به کلیک تلفن/واتساپ/
 * ارسال فرم/استفاده از ماشین‌حساب وصلش می‌کند.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: EventParams) => void;
    umami?: {
      track: (name: string, params?: EventParams) => void;
    };
  }
}

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;

  try {
    window.gtag?.("event", name, params);
  } catch {
    // GA4 بلاک‌شده — بی‌صدا رد شو
  }

  try {
    window.umami?.track(name, params);
  } catch {
    // Umami در دسترس نیست — بی‌صدا رد شو
  }
}
