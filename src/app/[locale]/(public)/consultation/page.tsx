import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MessageCircle, Phone, ShieldCheck, UserCheck, ChevronLeft } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { WebConsultationForm } from "@/components/consultation/WebConsultationForm";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { primaryOffice } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";

/**
 * صفحه‌ی مرکزی درخواست مشاوره.
 *
 * همه‌ی دکمه‌های «مشاوره رایگان» سایت به این‌جا می‌آیند. صفحه دو مسیر موازی
 * ارائه می‌کند، چون دو نوع کاربر داریم:
 *
 *   ۱. کاربری که بله دارد → مینی‌اپ بازو. پس از پذیرش درخواست توسط وکیل،
 *      لینک گفت‌وگوی مستقیم با همان وکیل برایش ارسال می‌شود.
 *   ۲. کاربری که بله ندارد → فرم همین صفحه. محتوای فرم به همان گروه وکلا
 *      می‌رود؛ وکیلِ پذیرنده مشخصات و شماره را می‌گیرد و تلفنی تماس می‌گیرد.
 *
 * هر دو مسیر به یک ConsultationRequest و یک کارت در گروه بله ختم می‌شوند —
 * تفاوت فقط در نحوه‌ی برگشت پاسخ به متقاضی است.
 */

const BASE = "https://www.dadparvaran.com";

export const metadata: Metadata = {
  title: "درخواست مشاوره حقوقی رایگان | مؤسسه حقوقی دادپروران مهر ایران",
  description:
    "درخواست مشاوره‌ی حقوقی رایگان از وکلای پایه یک دادگستری مؤسسه دادپروران مهر ایران. فرم را پر کنید تا در ساعات کاری با شما تماس گرفته شود، یا درخواست خود را در بله ثبت کنید.",
  alternates: { canonical: `${BASE}/fa/consultation` },
  openGraph: {
    title: "درخواست مشاوره حقوقی رایگان — دادپروران مهر ایران",
    description: "پرونده‌تان را شرح دهید؛ وکیل متخصص همان حوزه با شما تماس می‌گیرد.",
    url: `${BASE}/fa/consultation`,
    type: "website",
  },
};

const STEPS = [
  {
    icon: UserCheck,
    title: "شرح موضوع",
    body: "فرم را در سه گام کوتاه پر می‌کنید: مشخصات تماس، حوزه و شهر پرونده، و شرح ماجرا.",
  },
  {
    icon: MessageCircle,
    title: "ارسال به وکلا",
    body: "درخواست شما بلافاصله برای وکلای مؤسسه ارسال می‌شود. نام و شماره‌تان در این مرحله نمایش داده نمی‌شود.",
  },
  {
    icon: Phone,
    title: "تماس وکیل",
    body: "اولین وکیلی که پرونده را بپذیرد، در ساعات کاری با شما تماس می‌گیرد. اگر بله دارید، می‌توانید پس از ثبت فرم با یک ضربه نتیجه را همان‌جا دنبال کنید و مستقیم با وکیل گفت‌وگو کنید. جلسه‌ی اول رایگان است.",
  },
];

const FAQ_ITEMS = [
  {
    question: "آیا مشاوره‌ی اول واقعاً رایگان است؟",
    answer:
      "بله. جلسه‌ی اول مشاوره برای بررسی موضوع، اعلام راهکار حقوقی و برآورد شانس موفقیت رایگان است. اگر پس از آن تصمیم به سپردن وکالت گرفتید، حق‌الوکاله پیش از شروع کار به‌صورت شفاف اعلام و در قرارداد کتبی درج می‌شود.",
  },
  {
    question: "چقدر طول می‌کشد تا با من تماس بگیرند؟",
    answer:
      "درخواست بلافاصله برای وکلا ارسال می‌شود. در ساعات کاری معمولاً همان روز و در غیر ساعات کاری، اولین روز کاری بعد پاسخ داده می‌شود. اگر موضوع فوری است، گزینه‌ی «فوری» یا «بسیار فوری» را انتخاب کنید یا مستقیم تلفنی تماس بگیرید.",
  },
  {
    question: "اطلاعاتی که می‌نویسم کجا می‌رود؟",
    answer:
      "شرح موضوع، حوزه، شهر و مرحله‌ی پرونده برای وکلای مؤسسه ارسال می‌شود. نام و شماره‌ی تماس شما تا زمانی که یک وکیل درخواست را نپذیرد نمایش داده نمی‌شود و پس از پذیرش هم فقط برای همان وکیل ارسال می‌گردد.",
  },
  {
    question: "اگر پرونده‌ام خارج از شهرهای دفاتر شما باشد چه؟",
    answer:
      "وکلای مؤسسه در تهران، اهواز، اندیمشک و شهرهای اطراف آن‌ها پرونده می‌پذیرند. اگر پرونده در شهر دیگری مطرح است، در فرم بنویسید تا امکان پذیرش یا معرفی همکار بررسی شود.",
  },
  {
    question: "ارسال فرم یعنی وکیل پرونده‌ام را قبول کرده است؟",
    answer:
      "خیر. ارسال فرم صرفاً درخواست بررسی اولیه است و به معنی پذیرش پرونده یا تشکیل رابطه‌ی وکیل و موکل نیست. تصمیم درباره‌ی پذیرش پس از بررسی مدارک و در جلسه‌ی مشاوره گرفته می‌شود.",
  },
];

export default function ConsultationPage() {
  const office = primaryOffice();
  const waLink = office.whatsapp ? toWhatsAppLink(office.whatsapp) : null;

  const breadcrumb = getBreadcrumbSchema([
    { name: "خانه", url: `${BASE}/fa` },
    { name: "درخواست مشاوره", url: `${BASE}/fa/consultation` },
  ]);
  const faqSchema = getFAQSchema(FAQ_ITEMS);

  return (
    <div dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            مشاوره‌ی اول رایگان
          </span>
          <h1 className="font-fa mb-4 mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            درخواست مشاوره‌ی حقوقی
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
            موضوع پرونده‌تان را شرح دهید تا به وکیل متخصص همان حوزه برسد. وکیلی که درخواست را
            بپذیرد، در ساعات کاری با شما تماس می‌گیرد.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${office.phone}`}
              data-cta="consultation-hero-tel"
              dir="ltr"
              className="flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 font-semibold text-white shadow-xl shadow-gold-500/25 transition-all hover:bg-gold-400"
            >
              <Phone className="h-4 w-4" />
              {office.phoneDisplay.fa}
            </a>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="consultation-hero-whatsapp"
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 font-semibold text-white shadow-xl shadow-[#25D366]/25 transition-all hover:bg-[#1da851]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                واتساپ
              </a>
            )}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            {office.hours.fa}
          </p>
        </div>
      </section>

      {/* سه گام */}
      <section className="border-b border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-fa mb-10 text-center text-2xl font-bold text-primary-900">
            درخواست شما چه مسیری طی می‌کند؟
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <step.icon className="h-5 w-5 text-primary-700" />
                  </div>
                  <span className="font-fa text-sm font-bold text-gold-600">گام {index + 1}</span>
                </div>
                <h3 className="font-fa mb-2 text-lg font-bold text-primary-900">{step.title}</h3>
                <p className="text-sm leading-7 text-gray-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* فرم + مسیر بله */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="font-fa mb-2 text-2xl font-bold text-primary-900">فرم درخواست مشاوره</h2>
              <p className="mb-6 text-sm leading-7 text-gray-600">
                هرچه شرح موضوع دقیق‌تر باشد، ارزیابی اولیه‌ی وکیل پیش از تماس کامل‌تر خواهد بود.
              </p>
              <WebConsultationForm
                officePhone={office.phone}
                officePhoneDisplay={office.phoneDisplay.fa}
              />
            </div>

            {/* ستون کناری — تماس مستقیم.
                کارت «حساب بله دارید؟» عمداً این‌جا نیست: پیشنهاد بله به صفحه‌ی
                موفقیتِ فرم منتقل شد. آن‌جا یک ضربه است و کاربر پیش از ثبت
                درخواست مجبور به انتخاب میان دو مسیر نمی‌شود. */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="font-fa mb-4 text-base font-bold text-primary-900">تماس مستقیم</h3>
                <div className="space-y-3 text-sm">
                  <a
                    href={`tel:${office.phone}`}
                    data-cta="consultation-aside-tel"
                    className="flex items-center gap-2.5 text-gray-700 transition-colors hover:text-primary-700"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-primary-600" />
                    <span dir="ltr" className="font-medium">{office.phoneDisplay.fa}</span>
                  </a>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cta="consultation-aside-whatsapp"
                      className="flex items-center gap-2.5 text-gray-700 transition-colors hover:text-green-700"
                    >
                      <WhatsAppIcon className="h-4 w-4 shrink-0 text-green-600" />
                      <span className="font-medium">گفت‌وگو در واتساپ</span>
                    </a>
                  )}
                  <div className="flex items-start gap-2.5 pt-1 text-gray-600">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                    <span className="text-xs leading-6">{office.hours.fa}</span>
                  </div>
                </div>
                <Link
                  href="/fa/offices"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary-700 underline underline-offset-4 transition-colors hover:text-primary-800"
                >
                  آدرس و تلفن هر سه دفتر
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-gold-600" />
                  <h3 className="font-fa text-base font-bold text-primary-900">محرمانگی</h3>
                </div>
                <p className="text-sm leading-7 text-gray-600">
                  اطلاعات پرونده‌ی شما نزد وکیل امانت است. نام و شماره‌ی تماستان فقط برای وکیلی
                  که درخواست را می‌پذیرد ارسال می‌شود و در هیچ فهرست عمومی قرار نمی‌گیرد.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* پرسش‌های متداول */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-fa mb-8 text-center text-2xl font-bold text-primary-900">
            پرسش‌های متداول درباره‌ی مشاوره
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-gray-100 bg-white p-5 [&_summary]:cursor-pointer"
              >
                <summary className="font-fa flex items-center justify-between gap-4 font-bold text-primary-900 marker:content-none">
                  {item.question}
                  <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:-rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-8 text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            پاسخ سایر پرسش‌ها در{" "}
            <Link href="/fa/faq" className="font-medium text-primary-700 underline underline-offset-4">
              صفحه‌ی پرسش‌های متداول
            </Link>{" "}
            و توضیح هزینه‌ها در{" "}
            <Link href="/fa/fees" className="font-medium text-primary-700 underline underline-offset-4">
              صفحه‌ی حق‌الوکاله
            </Link>{" "}
            آمده است.
          </p>
        </div>
      </section>
    </div>
  );
}
