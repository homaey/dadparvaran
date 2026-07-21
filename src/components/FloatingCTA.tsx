"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { primaryOffice } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";

/**
 * دکمه‌های شناور تماس + واتساپ روی موبایل.
 *
 * قواعد:
 * - فقط زیر lg (موبایل و تبلت کوچک) نمایش داده می‌شود؛ در دسکتاپ که Navbar
 *   شماره‌ی کلیک‌شو دارد، این دکمه‌ها بار بصری اضافی و بی‌فایده‌اند.
 * - در مسیرهای داشبورد و ورود پنهان می‌شود — CTAهای کاربر ثبت‌نام‌شده در
 *   همان صفحه هستند و دکمه‌ی شناور تنها تداخل بصری ایجاد می‌کند.
 * - trackEvent روی این دکمه‌ها لازم نیست به‌صورت مستقیم صدا زده شود:
 *   TrackClicks یک event listener سراسری روی tel: و wa.me دارد.
 */
export default function FloatingCTA() {
  const pathname = usePathname();

  // پنهان روی داشبورد و صفحات auth
  if (/^\/[a-z]{2}\/(dashboard|auth)(\/|$)/.test(pathname || "")) return null;

  const office = primaryOffice();
  const waHref = toWhatsAppLink(office.whatsapp);

  return (
    <div
      className="lg:hidden fixed bottom-4 inset-x-4 z-40 flex gap-2 pointer-events-none"
      dir="ltr"
      aria-label="floating quick contact"
    >
      <a
        href={`tel:${office.phone}`}
        className="pointer-events-auto flex-1 inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-semibold py-3 rounded-xl shadow-xl shadow-gold-500/25 transition-all"
        data-cta="floating-tel"
      >
        <Phone className="w-4 h-4" />
        <span className="font-fa">تماس</span>
      </a>
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 rounded-xl shadow-xl shadow-[#25D366]/25 transition-all"
          data-cta="floating-whatsapp"
        >
          <WhatsAppIcon className="w-5 h-5" />
          <span className="font-fa">واتساپ</span>
        </a>
      )}
    </div>
  );
}
