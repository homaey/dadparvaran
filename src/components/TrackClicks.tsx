"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

/**
 * ردیاب سراسری کلیک روی لینک‌های tel: و wa.me.
 *
 * الگوی event delegation: یک listener روی document.body که با bubbling
 * همه‌ی کلیک‌ها را می‌شنود. مزیت: هیچ صفحه‌ای نیاز به import trackEvent
 * یا تغییر onClick ندارد — فقط لینک را با href صحیح بسازد و ردیابی
 * خودکار می‌آید.
 *
 * data-cta روی لینک اختیاری است — اگر تعریف شده باشد به‌عنوان محل کلیک
 * (hero، floating، navbar، ...) ثبت می‌شود.
 */
export default function TrackClicks() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const cta = anchor.dataset.cta;

      if (href.startsWith("tel:")) {
        trackEvent("tel_click", { path: pathname, cta });
      } else if (href.startsWith("https://wa.me/") || href.startsWith("http://wa.me/")) {
        trackEvent("whatsapp_click", { path: pathname, cta });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
