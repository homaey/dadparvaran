import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { getBreadcrumbSchema } from "@/lib/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFA = locale === "fa";
  return {
    title: isFA ? "شرایط استفاده از خدمات" : "Terms of Service",
    description: isFA
      ? "شرایط و ضوابط استفاده از وب‌سایت و خدمات مؤسسه حقوقی دادپروران مهر ایران"
      : "Terms and conditions for using the website and services of Dadparvaran Mehr Iran Legal Institute",
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/terms`,
      languages: {
        fa: "https://www.dadparvaran.com/fa/terms",
        en: "https://www.dadparvaran.com/en/terms",
      },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "شرایط استفاده" : "Terms", url: `https://www.dadparvaran.com/${locale}/terms` },
  ]);

  const sections = isRTL
    ? [
        {
          title: "۱. پذیرش شرایط",
          content:
            "با دسترسی و استفاده از وب‌سایت مؤسسه حقوقی دادپروران مهر ایران، شما موافقت خود را با رعایت این شرایط و ضوابط اعلام می‌کنید. در صورت عدم موافقت با هر یک از بندها، لطفاً از استفاده از وب‌سایت خودداری فرمایید.",
        },
        {
          title: "۲. خدمات وب‌سایت",
          content:
            "این وب‌سایت اطلاعات حقوقی عمومی، مقالات آموزشی، متن قوانین و ابزارهای محاسباتی حقوقی ارائه می‌دهد. محتوای موجود صرفاً جنبه اطلاع‌رسانی و آموزشی دارد و جایگزین مشاوره حقوقی حرفه‌ای نیست.",
        },
        {
          title: "۳. عدم ایجاد رابطه وکیل و موکل",
          content:
            "استفاده از این وب‌سایت، خواندن مقالات یا استفاده از ماشین‌حساب‌های حقوقی به هیچ وجه رابطه وکیل و موکل ایجاد نمی‌کند. برای دریافت مشاوره حقوقی شخصی، باید به‌صورت مستقیم با مؤسسه تماس بگیرید.",
        },
        {
          title: "۴. مالکیت معنوی",
          content:
            "تمامی محتوای این وب‌سایت شامل متون، تصاویر، لوگو، طراحی و نرم‌افزار متعلق به مؤسسه حقوقی دادپروران مهر ایران است و تحت حمایت قوانین مالکیت فکری قرار دارد. هرگونه کپی‌برداری، بازنشر یا استفاده تجاری بدون اجازه کتبی ممنوع است.",
        },
        {
          title: "۵. دقت اطلاعات",
          content:
            "ما تلاش می‌کنیم اطلاعات دقیق و به‌روز ارائه دهیم، اما مسئولیتی در قبال صحت کامل، جامعیت یا به‌روز بودن محتوا نمی‌پذیریم. قوانین و مقررات ممکن است تغییر کنند و نتایج ماشین‌حساب‌ها تقریبی است.",
        },
        {
          title: "۶. محدودیت مسئولیت",
          content:
            "مؤسسه حقوقی دادپروران مهر ایران در قبال هرگونه خسارت مستقیم یا غیرمستقیم ناشی از استفاده یا عدم امکان استفاده از وب‌سایت مسئولیتی ندارد. استفاده از ماشین‌حساب‌ها و ابزارهای آنلاین با مسئولیت خود کاربر است.",
        },
        {
          title: "۷. ثبت‌نام وکلا",
          content:
            "وکلایی که از طریق وب‌سایت ثبت‌نام می‌کنند، موظف به ارائه اطلاعات صحیح و به‌روز هستند. مؤسسه حق تأیید یا رد درخواست‌ها و حذف حساب‌های ناقض قوانین را دارد.",
        },
        {
          title: "۸. قانون حاکم",
          content:
            "این شرایط و ضوابط تابع قوانین جمهوری اسلامی ایران است و هرگونه اختلاف ناشی از آن در مراجع قضایی صالح ایران رسیدگی خواهد شد.",
        },
        {
          title: "۹. تغییرات",
          content:
            "مؤسسه حق تغییر این شرایط را در هر زمان برای خود محفوظ می‌دارد. ادامه استفاده از وب‌سایت پس از اعمال تغییرات به‌منزله پذیرش شرایط جدید است.",
        },
        {
          title: "۱۰. تماس",
          content:
            "در صورت هرگونه سؤال درباره شرایط استفاده، با شماره ۰۶۱-۹۱۰۱۰۲۸۵ تماس بگیرید.",
        },
      ]
    : [
        {
          title: "1. Acceptance of Terms",
          content:
            "By accessing and using the website of Dadparvaran Mehr Iran Legal Institute, you agree to comply with these terms and conditions. If you do not agree with any of these terms, please refrain from using the website.",
        },
        {
          title: "2. Website Services",
          content:
            "This website provides general legal information, educational articles, legal texts, and legal calculation tools. The content is for informational and educational purposes only and is not a substitute for professional legal advice.",
        },
        {
          title: "3. No Attorney-Client Relationship",
          content:
            "Using this website, reading articles, or using legal calculators does not in any way create an attorney-client relationship. For personal legal advice, you must contact the institute directly.",
        },
        {
          title: "4. Intellectual Property",
          content:
            "All content on this website including text, images, logos, design, and software belongs to Dadparvaran Mehr Iran Legal Institute and is protected under intellectual property laws. Any copying, republication, or commercial use without written permission is prohibited.",
        },
        {
          title: "5. Accuracy of Information",
          content:
            "We strive to provide accurate and up-to-date information, but we do not accept responsibility for the complete accuracy, comprehensiveness, or currency of the content. Laws and regulations may change, and calculator results are approximate.",
        },
        {
          title: "6. Limitation of Liability",
          content:
            "Dadparvaran Mehr Iran Legal Institute is not liable for any direct or indirect damages arising from the use or inability to use the website. Use of calculators and online tools is at the user's own risk.",
        },
        {
          title: "7. Lawyer Registration",
          content:
            "Lawyers who register through the website are required to provide accurate and up-to-date information. The institute reserves the right to approve or reject applications and to remove accounts that violate the rules.",
        },
        {
          title: "8. Governing Law",
          content:
            "These terms and conditions are governed by the laws of the Islamic Republic of Iran, and any disputes arising from them will be adjudicated by competent Iranian judicial authorities.",
        },
        {
          title: "9. Changes",
          content:
            "The institute reserves the right to modify these terms at any time. Continued use of the website after changes are made constitutes acceptance of the new terms.",
        },
        {
          title: "10. Contact",
          content:
            "If you have any questions about these Terms of Service, please contact us at +98 61 9101 0285.",
        },
      ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 pt-32 pb-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-3 ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {isRTL ? "شرایط استفاده از خدمات" : "Terms of Service"}
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
