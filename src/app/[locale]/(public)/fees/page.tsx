import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone, MessageSquare, Scale, CalendarCheck, CreditCard, ChevronLeft, CheckCircle2,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { primaryOffice } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "هزینه‌ها و حق‌الوکاله | مؤسسه حقوقی دادپروران مهر ایران",
  description:
    "توضیح شفاف نحوه‌ی محاسبه‌ی حق‌الوکاله در مؤسسه حقوقی دادپروران مهر ایران: تعرفه‌ی کانون، توافقی و درصدی. مشاوره‌ی اول رایگان و اعلام دقیق هزینه در همان جلسه.",
  alternates: {
    canonical: "https://www.dadparvaran.com/fa/fees",
  },
  openGraph: {
    title: "هزینه‌ها و حق‌الوکاله — دادپروران مهر ایران",
    description: "شفافیت کامل نحوه‌ی محاسبه‌ی حق‌الوکاله و روش‌های پرداخت.",
    url: "https://www.dadparvaran.com/fa/fees",
    type: "website",
  },
};

const HOW_TO_CALCULATE = [
  {
    icon: Scale,
    title: "تعرفه‌ی کانون وکلا",
    body: "مبنای اصلی محاسبه در بیشتر پرونده‌ها آیین‌نامه‌ی تعرفه‌ی حق‌الوکاله‌ی مصوب کانون وکلای دادگستری است. تعرفه بر اساس نوع دعوا (مالی/غیرمالی)، خواسته و مرحله‌ی رسیدگی تعیین می‌شود.",
  },
  {
    icon: CalendarCheck,
    title: "قرارداد توافقی",
    body: "برای پرونده‌های خاص (پیچیده، طولانی یا نیازمند کار حرفه‌ای بیشتر) پس از بررسی مدارک، حق‌الوکاله به‌صورت توافقی و در قالب یک قرارداد کتبی مشخص می‌شود؛ مبلغ و مراحل پرداخت به‌صورت شفاف در قرارداد قید می‌گردد.",
  },
  {
    icon: CreditCard,
    title: "حق‌الوکاله‌ی درصدی",
    body: "در برخی دعاوی مالی — به‌ویژه مطالبات و وصول طلب — حق‌الوکاله می‌تواند به‌صورت درصدی از مبلغ مورد مطالبه محاسبه شود. این روش وقتی به کار می‌آید که کارفرما ترجیح دهد بخشی از هزینه پس از وصول پرداخت شود.",
  },
];

const PAYMENT_STEPS = [
  {
    n: 1,
    title: "مشاوره‌ی اول — رایگان",
    body: "پیش از هر پرداخت، در جلسه‌ی مشاوره‌ی رایگان مدارک شما بررسی می‌شود و راهکار حقوقی، شانس موفقیت، مدت زمان تقریبی و مبلغ دقیق حق‌الوکاله اعلام می‌گردد.",
  },
  {
    n: 2,
    title: "قرارداد وکالت کتبی",
    body: "پس از توافق طرفین، قرارداد وکالت با ذکر خواسته، مبلغ حق‌الوکاله، مراحل پرداخت و تعهدات دو طرف امضا می‌شود. یک نسخه در اختیار موکل قرار می‌گیرد.",
  },
  {
    n: 3,
    title: "پرداخت مرحله‌ای",
    body: "معمولاً بخشی از حق‌الوکاله در ابتدای کار (پیش از تنظیم دادخواست/شکایت) و بخش دیگر در مراحل تعیین‌شده (پس از صدور رأی، پس از قطعیت، پس از وصول) پرداخت می‌شود.",
  },
  {
    n: 4,
    title: "هزینه‌های دادرسی جدا",
    body: "هزینه‌های دادرسی (تمبر دادخواست، هزینه‌ی کارشناسی، ابلاغ، اجرای احکام و…) که قانوناً از شاکی/خواهان دریافت می‌شود، جدا از حق‌الوکاله‌ی وکیل است و در قرارداد به‌صورت شفاف بیان می‌گردد.",
  },
];

const FAQS = [
  {
    q: "چرا مشاوره‌ی اول رایگان است؟",
    a: "چون تا زمانی که وکیل مدارک شما را بررسی نکرده و راهکار حقوقی مشخص نشده باشد، تعیین دقیق حق‌الوکاله ممکن نیست. جلسه‌ی رایگان اول این امکان را می‌دهد که پیش از هر تعهد مالی، بدانید پرونده‌ی شما پیگیری‌شدنی است، چه شانسی دارد و چه مبلغی هزینه خواهد داشت.",
  },
  {
    q: "آیا حق‌الوکاله در قرارداد قابل مذاکره است؟",
    a: "بله. در چارچوب آیین‌نامه‌ی تعرفه‌ی کانون و متناسب با پیچیدگی پرونده، مبلغ و مراحل پرداخت قابل مذاکره است. هدف قرارداد کتبی، ایجاد شفافیت کامل پیش از شروع کار است.",
  },
  {
    q: "اگر پرونده به نتیجه نرسد، حق‌الوکاله‌ی پرداخت‌شده باز می‌گردد؟",
    a: "حق‌الوکاله در ازای انجام کار حرفه‌ای وکیل پرداخت می‌شود، نه در ازای تضمین نتیجه — قانون هم ممنوعیت دارد که وکیل نتیجه‌ی پرونده را تضمین کند. اما مبلغ قسط‌های آینده (مثلاً قسط پس از صدور رأی) در صورت انصراف یا شکست موضوع پرونده، حسب شرایط قرارداد قابل بحث است.",
  },
  {
    q: "روش‌های پرداخت چیست؟",
    a: "پرداخت به‌صورت واریز به حساب شخصی وکیل (نه حساب مؤسسه) و در ازای رسید کتبی انجام می‌شود. پرداخت نقدی حضوری هم امکان‌پذیر است. هرگونه پرداخت باید در قرارداد یا رسید مستند شود.",
  },
];

export default function FeesPage() {
  const office = primaryOffice();
  const waHref = toWhatsAppLink(office.whatsapp);

  const breadcrumb = getBreadcrumbSchema([
    { name: "خانه", url: "https://www.dadparvaran.com/fa" },
    { name: "هزینه‌ها و حق‌الوکاله", url: "https://www.dadparvaran.com/fa/fees" },
  ]);
  const faqSchema = getFAQSchema(FAQS.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <div dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-300 mb-4">
            <Link href="/fa" className="hover:text-white transition-colors">خانه</Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-gray-400">هزینه‌ها و حق‌الوکاله</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-fa mb-4">
            هزینه‌ها و حق‌الوکاله
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed max-w-3xl">
            پیش از هر تعهد مالی می‌خواهیم بدانید حق‌الوکاله چطور محاسبه می‌شود، چه مواردی جدا از آن پرداخت می‌گردد و کدام مرحله را با چه هزینه‌ای طی می‌کنید.
            جلسه‌ی مشاوره‌ی اول در هر سه دفتر مؤسسه به‌صورت رایگان انجام می‌شود و مبلغ دقیق پرونده‌ی شما در همان جلسه اعلام می‌گردد.
          </p>
          {/* CTA — الگوی مشترک صفحات: طلایی + واتساپ برند + شیشه‌ای ثانویه */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/fa/contact"
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-gold-500/25"
            >
              <Phone className="w-5 h-5" />
              مشاوره رایگان
            </Link>
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-[#25D366]/25"
              >
                <WhatsAppIcon className="w-5 h-5" />
                مشاوره واتساپ
              </a>
            )}
            <Link
              href="/fa/faq"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm"
            >
              پرسش‌های متداول
            </Link>
          </div>
        </div>
      </section>

      {/* How calculation works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-900 font-fa mb-2">حق‌الوکاله چگونه محاسبه می‌شود؟</h2>
          <p className="text-gray-600 mb-8">سه مبنای معمول محاسبه در پرونده‌های حقوقی</p>
          <div className="grid md:grid-cols-3 gap-5">
            {HOW_TO_CALCULATE.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-700" />
                </div>
                <h3 className="font-bold text-primary-900 font-fa mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment steps */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-900 font-fa mb-2">مسیر از مشاوره تا پرداخت</h2>
          <p className="text-gray-600 mb-8">چهار گام شفاف، پیش از هر تعهد مالی</p>
          <div className="space-y-4">
            {PAYMENT_STEPS.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-5">
                <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-800 font-bold flex items-center justify-center shrink-0">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-primary-900 font-fa mb-1.5">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust points */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              "هیچ پرداختی پیش از قرارداد کتبی",
              "قرارداد وکالت با ذکر مبلغ و مراحل پرداخت",
              "رسید کتبی برای هر پرداخت",
              "شفافیت کامل هزینه‌های دادرسی جدا از حق‌الوکاله",
              "بدون هزینه‌ی مخفی یا الحاقی",
              "امکان مذاکره‌ی مراحل پرداخت متناسب با پرونده",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-900 font-fa mb-8 text-center">
            پرسش‌های متداول درباره‌ی هزینه‌ها
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="group bg-white border border-gray-100 rounded-xl p-5">
                <summary className="cursor-pointer font-bold text-primary-900 font-fa list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-open:-rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed text-sm">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/fa/faq"
              className="inline-flex items-center gap-1.5 text-primary-700 hover:text-primary-800 font-medium text-sm"
            >
              مشاهده‌ی همه‌ی پرسش‌ها
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA — الگوی هماهنگ با سایر صفحات */}
      <section className="py-16 bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-fa mb-4">
            هنوز درباره‌ی هزینه‌ی پرونده‌ی خود سؤالی دارید؟
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            جلسه‌ی اول مشاوره رایگان است. با تیم ما تماس بگیرید یا پیام بگذارید تا با شنیدن شرح موضوع، هزینه‌ی دقیق و مسیر پیش‌رو را برایتان روشن کنیم.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fa/contact"
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-gold-500/25"
            >
              <Phone className="w-5 h-5" />
              مشاوره رایگان
            </Link>
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-[#25D366]/25"
              >
                <MessageSquare className="w-5 h-5" />
                مشاوره واتساپ
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
