import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { getBreadcrumbSchema } from "@/lib/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFA = locale === "fa";
  return {
    title: isFA ? "سیاست حفظ حریم خصوصی" : "Privacy Policy",
    description: isFA
      ? "سیاست حفظ حریم خصوصی مؤسسه حقوقی دادپروران مهر ایران — نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شما"
      : "Privacy Policy of Dadparvaran Mehr Iran Legal Institute — how we collect, use, and protect your information",
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/privacy`,
      languages: {
        fa: "https://www.dadparvaran.com/fa/privacy",
        en: "https://www.dadparvaran.com/en/privacy",
        "x-default": "https://www.dadparvaran.com/fa/privacy",
      },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "حریم خصوصی" : "Privacy", url: `https://www.dadparvaran.com/${locale}/privacy` },
  ]);

  const sections = isRTL
    ? [
        {
          title: "۱. جمع‌آوری اطلاعات",
          content:
            "ما اطلاعاتی را که شما به‌صورت داوطلبانه از طریق فرم‌های تماس، ثبت‌نام وکلا یا درخواست مشاوره ارائه می‌دهید، جمع‌آوری می‌کنیم. این اطلاعات شامل نام، شماره تماس، آدرس ایمیل و جزئیات مربوط به موضوع حقوقی شما می‌شود. همچنین اطلاعات فنی مانند آدرس IP، نوع مرورگر و صفحات بازدیدشده به‌صورت خودکار ثبت می‌شود.",
        },
        {
          title: "۲. نحوه استفاده از اطلاعات",
          content:
            "اطلاعات شما صرفاً برای ارائه خدمات حقوقی، پاسخ‌گویی به درخواست‌ها، بهبود کیفیت خدمات و ارسال اطلاعیه‌های مرتبط استفاده می‌شود. ما هرگز اطلاعات شخصی شما را بدون رضایت صریح به اشخاص ثالث فروخته یا واگذار نمی‌کنیم.",
        },
        {
          title: "۳. حفاظت از اطلاعات",
          content:
            "ما از تدابیر امنیتی مناسب شامل رمزنگاری SSL، کنترل دسترسی و پشتیبان‌گیری منظم برای حفاظت از اطلاعات شما استفاده می‌کنیم. دسترسی به اطلاعات شخصی محدود به کارکنان مجاز است.",
        },
        {
          title: "۴. کوکی‌ها",
          content:
            "این وب‌سایت از کوکی‌ها برای بهبود تجربه کاربری و تحلیل ترافیک استفاده می‌کند. شما می‌توانید از طریق تنظیمات مرورگر خود، کوکی‌ها را غیرفعال کنید؛ اما ممکن است برخی قابلیت‌های سایت به‌درستی کار نکنند.",
        },
        {
          title: "۵. حقوق شما",
          content:
            "شما حق دسترسی، اصلاح و حذف اطلاعات شخصی خود را دارید. برای اعمال این حقوق، می‌توانید از طریق صفحه تماس با ما با ما ارتباط برقرار کنید.",
        },
        {
          title: "۶. تغییرات در سیاست حریم خصوصی",
          content:
            "ما حق تغییر این سیاست‌نامه را در هر زمان داریم. تغییرات در همین صفحه منتشر خواهد شد و استفاده مداوم شما از وب‌سایت به‌منزله پذیرش تغییرات است.",
        },
        {
          title: "۷. تماس با ما",
          content:
            "در صورت هرگونه سؤال درباره سیاست حفظ حریم خصوصی، لطفاً با شماره ۰۶۱-۹۱۰۱۰۲۸۵ تماس بگیرید.",
        },
      ]
    : [
        {
          title: "1. Information Collection",
          content:
            "We collect information that you voluntarily provide through contact forms, lawyer registration, or consultation requests. This includes your name, phone number, email address, and details related to your legal matter. Technical information such as IP address, browser type, and pages visited is also automatically recorded.",
        },
        {
          title: "2. Use of Information",
          content:
            "Your information is used solely for providing legal services, responding to inquiries, improving service quality, and sending relevant notifications. We never sell or share your personal information with third parties without your explicit consent.",
        },
        {
          title: "3. Data Protection",
          content:
            "We employ appropriate security measures including SSL encryption, access controls, and regular backups to protect your information. Access to personal data is restricted to authorized personnel only.",
        },
        {
          title: "4. Cookies",
          content:
            "This website uses cookies to improve user experience and analyze traffic. You can disable cookies through your browser settings, but some website features may not function properly.",
        },
        {
          title: "5. Your Rights",
          content:
            "You have the right to access, correct, and delete your personal information. To exercise these rights, please contact us through our contact page.",
        },
        {
          title: "6. Changes to Privacy Policy",
          content:
            "We reserve the right to modify this policy at any time. Changes will be published on this page, and your continued use of the website constitutes acceptance of those changes.",
        },
        {
          title: "7. Contact Us",
          content:
            "If you have any questions about this Privacy Policy, please contact us at +98 61 9101 0285.",
        },
      ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 pt-32 pb-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-3 ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {isRTL ? "سیاست حفظ حریم خصوصی" : "Privacy Policy"}
            </h1>
            <p className="text-gray-300 text-sm">
              {isRTL ? "آخرین بروزرسانی: تیر ۱۴۰۵" : "Last updated: July 2026"}
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-gray max-w-none">
              {sections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h2 className={`text-lg font-bold text-primary-900 mb-3 ${isRTL ? "font-fa-display" : "font-serif"}`}>
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium text-sm transition-colors"
              >
                {isRTL ? "تماس با ما" : "Contact Us"}
                <Arrow className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
