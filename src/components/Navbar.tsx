"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { hasCompleteEnglish } from "@/lib/i18n-pages";
import { primaryOffice } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { consultationHref, consultationLinkProps, isBaleConsultation } from "@/lib/consultation-cta";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = locale === "fa";

  const darkHeroPages = [
    `/${locale}`,
    `/${locale}/articles`,
    `/${locale}/lawyers`,
    `/${locale}/services`,
    `/${locale}/contact`,
    `/${locale}/about`,
  ];
  const hasDarkHero = darkHeroPages.includes(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !hasDarkHero || scrolled;

  const allNavLinks = [
    { href: `/${locale}`, label: t("home"), enOnly: false },
    { href: `/${locale}/laws`, label: t("laws"), enOnly: false, faOnly: true },
    { href: `/${locale}/services`, label: isRTL ? "خدمات" : "Services", enOnly: false },
    { href: `/${locale}/articles`, label: t("articles"), enOnly: false, faOnly: true },
    { href: `/${locale}/lawyers`, label: t("team"), enOnly: false },
    { href: `/${locale}/calculators`, label: t("calculators"), enOnly: false },
    { href: `/${locale}/forms`, label: isRTL ? "اوراق قضایی" : "Legal Forms", enOnly: false, faOnly: true },
    { href: `/${locale}/about`, label: isRTL ? "درباره ما" : "About", enOnly: false },
    { href: `/${locale}/contact`, label: t("contact"), enOnly: false },
  ];
  const navLinks = allNavLinks.filter((l) => !(l.faOnly && locale === "en"));

  // تلفن و واتساپ برای هدر — از منبع واحد دفاتر می‌خواند تا NAP هماهنگ بماند.
  const office = primaryOffice();
  const phoneNumber = office.phoneDisplay[isRTL ? "fa" : "en"];
  const waLink = office.whatsapp ? toWhatsAppLink(office.whatsapp) : null;

  const otherLocale = locale === "fa" ? "en" : "fa";
  const pathWithoutLocale = pathname.replace(/^\/(fa|en)/, "") || "";
  const targetHasContent =
    otherLocale === "fa" || hasCompleteEnglish(pathWithoutLocale);
  const switchPath = targetHasContent
    ? pathname.replace(`/${locale}`, `/${otherLocale}`)
    : `/${otherLocale}`;

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        solid
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={isRTL ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran"} className="w-14 h-14 object-contain" />
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-bold text-base leading-tight",
                  solid ? "text-primary-900" : "text-white",
                  isRTL ? "font-fa" : "font-en"
                )}
              >
                {isRTL ? "دادپروران" : "Dadparvaraan"}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  solid ? "text-gray-500" : "text-white/70",
                  isRTL ? "font-fa" : "font-en"
                )}
              >
                {isRTL ? "مهر ایران" : "Mehr Iran"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  solid
                    ? "text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                    : "text-white/90 hover:text-white hover:bg-white/10",
                  pathname === link.href && (solid ? "text-primary-700 bg-primary-50" : "text-white bg-white/20")
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* شماره تماس کلیک‌شو — طبق فاز B اضافه شد تا در دسترس‌ترین CTA همیشه در هدر باشد. */}
            <a
              href={`tel:${office.phone}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                solid
                  ? "text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
              dir="ltr"
            >
              <Phone className="w-4 h-4" />
              <span className={isRTL ? "font-fa" : ""}>{phoneNumber}</span>
            </a>
            {/* Locale switcher */}
            {targetHasContent ? (
              <Link
                href={switchPath}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  solid
                    ? "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Globe className="w-4 h-4" />
                {locale === "fa" ? "EN" : "FA"}
              </Link>
            ) : (
              <span
                title={locale === "fa" ? "English version not available" : "نسخه فارسی در دسترس نیست"}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed",
                  solid ? "text-gray-400" : "text-white/40"
                )}
              >
                <Globe className="w-4 h-4" />
                {locale === "fa" ? "EN" : "FA"}
              </span>
            )}
            {/* CTA — routes to Bale bot when configured, contact page otherwise */}
            <a
              href={consultationHref(locale)}
              {...consultationLinkProps()}
              className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md"
            >
              {isBaleConsultation() ? (isRTL ? "درخواست در بله" : "Consult via Bale") : t("consultation")}
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              "lg:hidden p-2 rounded-lg",
              solid ? "text-gray-700" : "text-white"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {/* تماس مستقیم در بالای منوی موبایل — کاربر بدون اسکرول به CTA اصلی می‌رسد. */}
            <div className="flex gap-2 pb-3 mb-2 border-b border-gray-100">
              <a
                href={`tel:${office.phone}`}
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-700 py-3 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors"
                dir="ltr"
              >
                <Phone className="w-4 h-4" />
                {phoneNumber}
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              {targetHasContent ? (
                <Link
                  href={switchPath}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600"
                >
                  <Globe className="w-4 h-4" />
                  {locale === "fa" ? "English" : "فارسی"}
                </Link>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                  <Globe className="w-4 h-4" />
                  {locale === "fa" ? "English" : "فارسی"}
                </span>
              )}
              <a
                href={consultationHref(locale)}
                {...consultationLinkProps()}
                onClick={() => setMobileOpen(false)}
                className="bg-gold-500 text-white px-5 py-2 rounded-lg text-sm font-semibold"
              >
                {isBaleConsultation() ? (isRTL ? "درخواست در بله" : "Bale") : t("consultation")}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
