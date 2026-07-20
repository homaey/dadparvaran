import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Phone, MapPin } from "lucide-react";
import { primaryOffice } from "@/lib/offices";

export default function Footer() {
  const t = useTranslations("footer");
  const tContact = useTranslations("contact");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const office = primaryOffice();
  const lang = isRTL ? "fa" : "en";

  return (
    <footer
      className="bg-primary-950 text-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt={isRTL ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran"} className="w-14 h-14 object-contain" />
              <div className="flex flex-col">
                <span className={`font-bold text-lg leading-tight ${isRTL ? "font-fa" : "font-en"}`}>
                  {isRTL ? "دادپروران" : "Dadparvaraan"}
                </span>
                <span className="text-[11px] text-gray-400 leading-tight">
                  {isRTL ? "مهر ایران" : "Mehr Iran"}
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("description")}
            </p>
            {/* آیکون‌های سوشال حذف شدند — پیش‌تر href="#" داشتند و کاربر را
                به همان صفحه برمی‌گرداندند. وقتی آدرس واقعی پیج‌ها آماده شود،
                این‌جا هم‌زمان با sameAs در schema.ts اضافه می‌شود. */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-5">{t("links")}</h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}`, label: isRTL ? "صفحه اصلی" : "Home" },
                ...(isRTL ? [
                  { href: `/${locale}/laws`, label: "قوانین" },
                  { href: `/${locale}/articles`, label: "مقالات" },
                ] : []),
                { href: `/${locale}/lawyers`, label: isRTL ? "تیم ما" : "Our Team" },
                { href: `/${locale}/services`, label: isRTL ? "خدمات" : "Services" },
                // «دفاتر ما» فقط FA — صفحات شهری فقط فارسی هستند و middleware
                // /en/offices را به /fa/offices ریدایرکت می‌کند.
                ...(isRTL ? [{ href: `/${locale}/offices`, label: "دفاتر ما" }] : []),
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-white mb-5">{isRTL ? "ابزارها" : "Tools"}</h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/calculators`, label: isRTL ? "ماشین‌حساب‌ها" : "Calculators" },
                ...(isRTL ? [
                  { href: `/${locale}/forms`, label: "اوراق قضایی" },
                ] : []),
                { href: `/${locale}/about`, label: isRTL ? "درباره ما" : "About Us" },
                { href: `/${locale}/contact`, label: isRTL ? "تماس با ما" : "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-5">{tContact("title")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">
                  {isRTL ? `دفتر ${office.city.fa}: ` : `${office.city.en}: `}
                  {office.street[lang]}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href={`tel:${office.phone}`} className="text-gray-400 hover:text-gold-400 text-sm transition-colors" dir="ltr">
                  {office.phoneDisplay[lang]}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {isRTL ? "مؤسسه حقوقی دادپروران مهر ایران" : "Dadparvaraan Mehr Iran Legal Institute"}. {t("rights")}.
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/privacy`} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              {t("privacy")}
            </Link>
            <Link href={`/${locale}/terms`} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
