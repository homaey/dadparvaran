import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone, ChevronLeft, CreditCard, Users, Home, Scale, HandCoins, FileText,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { primaryOffice } from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { consultationHref, consultationLinkProps } from "@/lib/consultation-cta";

export const metadata: Metadata = {
  title: "پرسش‌های متداول — راهنمای کامل حقوقی | دادپروران مهر ایران",
  description:
    "پرسش‌های متداول درباره‌ی هزینه‌ها، خانواده، ملکی، کیفری، مطالبات مالی و روند همکاری با وکیل. پاسخ‌های کوتاه و دقیق تیم دادپروران مهر ایران.",
  alternates: {
    canonical: "https://www.dadparvaran.com/fa/faq",
  },
  openGraph: {
    title: "پرسش‌های متداول — دادپروران مهر ایران",
    description: "پاسخ‌های کوتاه و دقیق به پرسش‌های پرتکرار حقوقی.",
    url: "https://www.dadparvaran.com/fa/faq",
    type: "website",
  },
};

/**
 * پرسش‌ها به‌صورت دسته‌بندی موضوعی. هر دسته یک id دارد که در sidebar
 * anchor می‌شود. FAQPage schema همه پرسش‌ها را یکجا شامل می‌شود.
 */
const CATEGORIES = [
  {
    id: "fees",
    title: "هزینه‌ها و حق‌الوکاله",
    icon: CreditCard,
    faqs: [
      {
        q: "مشاوره‌ی اول رایگان است؟",
        a: "بله. جلسه‌ی نخست مشاوره در هر سه دفتر مؤسسه (تهران، اهواز، اندیمشک) به‌صورت رایگان انجام می‌شود. در این جلسه وکیل با شنیدن شرح موضوع، مدارک را بررسی می‌کند و راهکار حقوقی، شانس موفقیت، مدت زمان تقریبی و هزینه‌ی احتمالی را اعلام می‌کند.",
      },
      {
        q: "حق‌الوکاله چطور محاسبه می‌شود؟",
        a: "بر اساس آیین‌نامه‌ی تعرفه‌ی حق‌الوکاله‌ی کانون وکلای دادگستری و متناسب با نوع پرونده (مالی/غیرمالی)، خواسته، پیچیدگی و مرحله‌ی رسیدگی. در پرونده‌های خاص، مبلغ به‌صورت توافقی و در قرارداد کتبی مشخص می‌شود. جزئیات بیشتر در صفحه‌ی «هزینه‌ها» آمده است.",
      },
      {
        q: "آیا هزینه‌های دادرسی جزو حق‌الوکاله است؟",
        a: "خیر. هزینه‌های دادرسی — مانند تمبر دادخواست، هزینه‌ی کارشناسی، ابلاغ، اجرای احکام — قانوناً از خواهان/شاکی دریافت می‌شود و جدا از حق‌الوکاله‌ی وکیل است. این هزینه‌ها در قرارداد وکالت به‌صورت شفاف بیان می‌شود.",
      },
      {
        q: "پرداخت به چه صورت انجام می‌شود؟",
        a: "معمولاً بخشی در ابتدای کار (پیش از تنظیم دادخواست/شکایت) و بخش دیگر در مراحل تعیین‌شده در قرارداد (پس از صدور رأی، پس از قطعیت، پس از وصول). پرداخت‌ها با رسید کتبی مستند می‌شود.",
      },
    ],
  },
  {
    id: "family",
    title: "خانواده — طلاق، مهریه، حضانت",
    icon: Users,
    faqs: [
      {
        q: "برای طلاق توافقی چه مدارکی لازم است؟",
        a: "شناسنامه‌ی زوجین، عقدنامه (سند ازدواج) و توافق کتبی درباره‌ی مهریه، جهیزیه، نفقه، حضانت فرزندان و ملاقات آنان. جلسه‌ی مشاوره‌ی اول بهترین زمان برای بررسی دقیق شرایط پرونده‌ی شماست.",
      },
      {
        q: "مطالبه‌ی مهریه چقدر طول می‌کشد؟",
        a: "زمان دقیق به مسیر انتخاب‌شده بستگی دارد. مطالبه‌ی مهریه از طریق اجرای ثبت — که برای مهریه‌های سکه/وجه نقد در بسیاری موارد مسیر سریع‌تری است — چند هفته تا چند ماه ممکن است طول بکشد. مطالبه از طریق دادگاه معمولاً چند ماه است.",
      },
      {
        q: "حضانت فرزند به مادر می‌رسد یا پدر؟",
        a: "طبق ماده ۱۱۶۹ قانون مدنی، حضانت فرزند تا هفت سالگی با مادر است و پس از آن با پدر — اما در هر پرونده، دادگاه با ارزیابی مصلحت طفل و شرایط طرفین ممکن است تصمیم متفاوتی بگیرد. برای بررسی پرونده‌ی خاص خود با وکیل مشاوره کنید.",
      },
      {
        q: "نفقه‌ی زوجه چگونه مطالبه می‌شود؟",
        a: "زوجه می‌تواند از طریق دادخواست حقوقی الزام به پرداخت نفقه یا از طریق شکایت کیفری ترک انفاق اقدام کند. مسیر مناسب به شرایط پرونده — از جمله وضعیت زندگی مشترک — بستگی دارد.",
      },
    ],
  },
  {
    id: "property",
    title: "ملکی — تخلیه، سند، اختلافات",
    icon: Home,
    faqs: [
      {
        q: "برای تخلیه‌ی مستأجر چه کاری باید کرد؟",
        a: "قوانین اجاره‌ی مسکونی (مصوب ۱۳۷۶) و تجاری (مصوب ۱۳۵۶) متفاوت است. برای ملک مسکونی معمولاً انقضای مدت اجاره و اظهارنامه‌ی تخلیه کافی است، اما ملک تجاری مشمول قانون قدیم است و ممکن است حق کسب و پیشه ایجاد شده باشد.",
      },
      {
        q: "دعوای الزام به تنظیم سند رسمی چقدر طول می‌کشد؟",
        a: "معمولاً چند ماه تا حدود یک سال، بسته به تعداد جلسات، لزوم کارشناسی و اعتراضات احتمالی طرف مقابل. حضور قرارداد کتبی معتبر (مبایعه‌نامه) و مدارک پرداخت، مسیر رسیدگی را کوتاه‌تر می‌کند.",
      },
      {
        q: "خلع ید، تصرف عدوانی و تخلیه چه تفاوتی دارند؟",
        a: "خلع ید برای زمانی است که مالک ادعا می‌کند کسی بدون مجوز ملک را در تصرف دارد. تصرف عدوانی وقتی مطرح است که متصرف قبلی از تصرف محروم شده است. تخلیه مربوط به اجاره‌ی رسمی است. مسیر حقوقی هر کدام متفاوت است — با وکیل مشاوره کنید.",
      },
      {
        q: "کمیسیون ماده ۱۰۰ شهرداری قابل اعتراض است؟",
        a: "بله. رأی کمیسیون ماده ۱۰۰ قابل اعتراض در کمیسیون تجدیدنظر همان شهرداری و سپس در دیوان عدالت اداری است. مهلت اعتراض و روند کار در وکالت این نوع پرونده اهمیت زیادی دارد.",
      },
    ],
  },
  {
    id: "criminal",
    title: "کیفری — کلاهبرداری، چک، خیانت در امانت",
    icon: Scale,
    faqs: [
      {
        q: "برای شکایت کلاهبرداری چه مدارکی لازم است؟",
        a: "هر مدرکی که سه رکن کلاهبرداری — توسل به وسایل متقلبانه، بردن مال غیر، علم و عمد — را اثبات کند: فیش‌ها و رسیدهای بانکی، پیامک‌های تراکنش، اسکرین‌شات مکالمات و تبلیغات، شهادت شاهد. کلاهبرداری جرم غیرقابل گذشت است و مهلت زمانی برای شکایت ندارد.",
      },
      {
        q: "چک برگشتی چگونه پیگیری می‌شود؟",
        a: "برای چک برگشتی، دو مسیر همزمان قابل پیگیری است: (۱) مسیر کیفری با شکایت صدور چک بی‌محل (در صورت وجود شرایط) و (۲) مسیر حقوقی برای وصول وجه چک از طریق اجرای ثبت یا دادگاه. گواهی عدم پرداخت بانک، سنگ‌بنای هر دو مسیر است.",
      },
      {
        q: "خیانت در امانت چطور اثبات می‌شود؟",
        a: "باید ثابت شود که مال به‌صورت امانت (نه هبه یا قرض) سپرده شده و متصرف با سوءنیت آن را تصاحب کرده است. سند تحویل مال (رسید، قرارداد، شاهد) رکن اصلی است. خیانت در امانت جرم قابل گذشت است و مهلت شکایت یک سال از تاریخ اطلاع است.",
      },
    ],
  },
  {
    id: "claims",
    title: "مطالبات مالی و وصول",
    icon: HandCoins,
    faqs: [
      {
        q: "مطالبه‌ی خسارت تأخیر تأدیه چطور محاسبه می‌شود؟",
        a: "خسارت تأخیر تأدیه از تاریخ سررسید تا زمان پرداخت، بر مبنای شاخص بها اعلامی بانک مرکزی محاسبه می‌شود. سایت ما ماشین‌حساب رایگان این محاسبه را در بخش «ماشین‌حساب‌ها» ارائه می‌دهد.",
      },
      {
        q: "اظهارنامه چه کاربردی دارد؟",
        a: "اظهارنامه راهی برای اعلام رسمی خواسته و مستندسازی تاریخ آن است. در بسیاری از دعاوی (فسخ قرارداد، مطالبه‌ی طلب، تخلیه) ارسال اظهارنامه پیش از اقدام قضایی، هم گاهی موضوع را بدون دادگاه حل می‌کند و هم مدرک مهمی برای پرونده می‌سازد.",
      },
    ],
  },
  {
    id: "process",
    title: "روند همکاری و تماس",
    icon: FileText,
    faqs: [
      {
        q: "چطور با وکیل مشاوره بگیرم؟",
        a: "سه راه در دسترس است: (۱) تماس تلفنی مستقیم با دفتر، (۲) پر کردن فرم صفحه‌ی تماس، (۳) پیام واتساپ. جلسه‌ی مشاوره در روزهای کاری با هماهنگی قبلی برگزار می‌شود.",
      },
      {
        q: "پرونده‌ی خارج از شهر شما پذیرفته می‌شود؟",
        a: "بله. وکلای ما در چندین شهر خوزستان، تهران و کرج پرونده می‌پذیرند. فهرست کامل مناطق تحت پوشش هر وکیل روی کارت پروفایل او در صفحه‌ی شعبه‌ی مربوط آمده است.",
      },
      {
        q: "آیا وکالت‌نامه‌ی حضوری الزامی است؟",
        a: "برای شروع رسمی وکالت بله، وکالت‌نامه‌ی رسمی (در سامانه‌ی ثنا یا حضوری در دفترخانه) الزامی است. اما جلسه‌ی مشاوره پیش از آن انجام می‌شود و به وکالت‌نامه نیازی ندارد.",
      },
      {
        q: "چه مدت بعد از تماس، جواب می‌گیرم؟",
        a: "پیام‌های ارسال‌شده در ساعات کاری معمولاً ظرف چند ساعت پاسخ داده می‌شوند. تماس‌های تلفنی در ساعات کاری بلافاصله پاسخ داده می‌شود.",
      },
    ],
  },
] as const;

const ALL_FAQS = CATEGORIES.flatMap((c) => c.faqs.map((f) => ({ ...f, category: c.title })));

export default function FaqPage() {
  const office = primaryOffice();
  const waHref = toWhatsAppLink(office.whatsapp);

  const breadcrumb = getBreadcrumbSchema([
    { name: "خانه", url: "https://www.dadparvaran.com/fa" },
    { name: "پرسش‌های متداول", url: "https://www.dadparvaran.com/fa/faq" },
  ]);
  const faqSchema = getFAQSchema(ALL_FAQS.map((f) => ({ question: f.q, answer: f.a })));

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
            <span className="text-gray-400">پرسش‌های متداول</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-fa mb-4">
            پرسش‌های متداول
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed max-w-3xl">
            پاسخ‌های کوتاه و دقیق به پرسش‌های پرتکرار حقوقی — از هزینه‌ها و روند همکاری تا خانواده، ملکی، کیفری و مطالبات مالی. اگر پاسخ سؤال شما این‌جا نیست، جلسه‌ی مشاوره‌ی اول رایگان است.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href={consultationHref("fa")}
              {...consultationLinkProps()}
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-gold-500/25"
            >
              <Phone className="w-5 h-5" />
              مشاوره رایگان
            </a>
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
              href="/fa/fees"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm"
            >
              هزینه‌ها و حق‌الوکاله
            </Link>
          </div>
        </div>
      </section>

      {/* Category jump nav */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <c.icon className="w-3.5 h-3.5" />
                {c.title.split(" — ")[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ sections */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                  <cat.icon className="w-5 h-5 text-primary-700" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary-900 font-fa">
                  {cat.title}
                </h2>
              </div>
              <div className="space-y-3">
                {cat.faqs.map((f, i) => (
                  <details key={i} className="group bg-white border border-gray-100 rounded-xl p-5">
                    <summary className="cursor-pointer font-bold text-primary-900 font-fa list-none flex items-center justify-between gap-4">
                      <span>{f.q}</span>
                      <ChevronLeft className="w-4 h-4 text-gray-400 group-open:-rotate-90 transition-transform shrink-0" />
                    </summary>
                    <p className="mt-4 text-gray-700 leading-relaxed text-sm">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Final CTA — الگوی هماهنگ */}
      <section className="py-16 bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-fa mb-4">
            پاسخ سؤال شما این‌جا نبود؟
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            جلسه‌ی مشاوره‌ی اول رایگان است. تماس تلفنی یا پیام واتساپ، هر کدام راحت‌تر است، انتخاب کنید.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={consultationHref("fa")}
              {...consultationLinkProps()}
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-gold-500/25"
            >
              <Phone className="w-5 h-5" />
              مشاوره رایگان
            </a>
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
          </div>
        </div>
      </section>
    </div>
  );
}
