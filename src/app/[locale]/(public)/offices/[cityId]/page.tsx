import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, MapPin, Phone, Clock, ChevronLeft, BookOpen, CheckCircle2,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";
import { db } from "@/lib/db";
import {
  offices,
  officeToLawyerIds,
  lawyerCoverage,
  findOffice,
  type OfficeId,
} from "@/lib/offices";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { servicesData } from "@/lib/services-data";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { consultationHref, consultationLinkProps } from "@/lib/consultation-cta";

// نگاشت hardcoded شهر → slug خدمات پرتقاضا. جای اینکه از داده‌ی صفحات
// خدمات mine کنیم، شش خدمت اصلی را برای هر شهر یکسان می‌گذاریم — چون در
// حال حاضر واقعا خدمات به تفکیک شعبه نداریم و ادعای متفاوت‌بودن گمراه‌کننده
// خواهد بود. اگر بعداً شعبه‌ی خاصی خدمت تخصصی داشت، این نگاشت شخصی می‌شود.
const POPULAR_SERVICE_SLUGS = ["family", "civil", "criminal", "property", "commercial", "debt-collection"] as const;

/**
 * متن معرفی هر شعبه. نگاه‌داشتن این‌جا (نه در messages/) عمدی است: صفحات
 * شهری فقط FA هستند و نیاز به پرش سریع بین متن‌ها هست، پس در یک constant
 * می‌ماند تا با کمترین شخم زدن قابل ویرایش باشد.
 */
const CITY_INTRO: Record<OfficeId, string> = {
  tehran:
    "دفتر تهران مؤسسه حقوقی دادپروران مهر ایران در محدوده‌ی خیابان مطهری واقع است. مسئولیت پذیرش و پیگیری پرونده‌های این دفتر بر عهده‌ی آقای عارف حسین شهاوندی، وکیل پایه یک دادگستری است. تمرکز خدمات این شعبه بر دعاوی حقوقی و مدنی، حقوق خانواده، اختلافات ملکی و پرونده‌های کیفری در تهران، کرج و دیگر شهرهای استان تهران است. مشاوره‌ی اول رایگان است و برای پرونده‌های ارجاعی از خوزستان نیز پشتیبانی می‌شود.",
  ahvaz:
    "دفتر اهواز مؤسسه حقوقی دادپروران مهر ایران در محدوده‌ی کیانپارس، برج کیانپارس واقع است. تیمی از چهار وکیل پایه یک دادگستری در این شعبه فعال‌اند و طیف گسترده‌ای از دعاوی حقوقی، خانواده، ملکی، قراردادی و مطالبات مالی را پیگیری می‌کنند. پوشش خدمات دفتر شامل اهواز، شوشتر، دزفول، شوش، سوسنگرد، حمیدیه، کارون، رامهرمز، بندر امام خمینی و ماهشهر است؛ تمرکز تجربی تیم روی پرونده‌های خانواده و ملکی خوزستان از نقاط قوت این شعبه است.",
  andimeshk:
    "دفتر اندیمشک مؤسسه حقوقی دادپروران مهر ایران در خیابان پناهی، طبقه دوم پاساژ آبادی مستقر است. آقایان محسن عاقل میررضایی و عرفان شهاوندی، وکلای پایه یک دادگستری، در این شعبه فعالیت می‌کنند. خدمات دفتر برای شهرهای اندیمشک، دزفول، شوش، اهواز و شوشتر ارائه می‌شود و تخصص اصلی آن، پیگیری دعاوی حقوقی، خانواده، ملکی و کیفری در شمال خوزستان است.",
};

function buildFaqs(city: string): { q: string; a: string }[] {
  return [
    {
      q: `هزینه‌ی وکیل در ${city} چقدر است؟`,
      a: `حق‌الوکاله برای هر پرونده به‌صورت مستقل محاسبه می‌شود و به عواملی مانند خواسته، پیچیدگی حقوقی، طول رسیدگی و میزان کار حرفه‌ای مورد نیاز بستگی دارد. مبنای محاسبه معمولاً آیین‌نامه‌ی تعرفه‌ی حق‌الوکاله‌ی کانون وکلا است و در پرونده‌های خاص به‌صورت توافقی تعیین می‌شود. در جلسه‌ی مشاوره‌ی اول — که در دفتر ${city} رایگان است — پس از بررسی مدارک، مبلغ دقیق و مراحل کار به‌صورت شفاف اعلام می‌شود.`,
    },
    {
      q: "آیا مشاوره‌ی اولیه رایگان است؟",
      a: "بله. جلسه‌ی نخست مشاوره در هر سه دفتر مؤسسه به‌صورت رایگان انجام می‌شود. در این جلسه وکیل با شنیدن شرح موضوع، مدارک را بررسی می‌کند و راهکار حقوقی، شانس موفقیت، مدت زمان تقریبی و هزینه‌ی احتمالی را ارائه می‌دهد. برای رزرو، از طریق شماره‌ی دفتر یا فرم صفحه‌ی تماس هماهنگ کنید.",
    },
    {
      q: `آیا پرونده‌های شهرهای اطراف ${city} پذیرفته می‌شود؟`,
      a: "بله. وکلای این دفتر در چند شهر همجوار نیز پرونده می‌پذیرند. برای برخی امور اداری و حضور در جلسات دادگاه، ممکن است هماهنگی رفت‌وآمد لازم شود و هزینه‌ی آن به‌صورت شفاف در قرارداد وکالت اعلام می‌گردد. فهرست کامل شهرهایی که هر وکیل پوشش می‌دهد، روی کارت پروفایل او در همین صفحه آمده است.",
    },
    {
      q: "چگونه با وکیل تماس بگیرم؟",
      a: "سه راه در دسترس است: (۱) تماس تلفنی مستقیم با دفتر که شماره‌اش در بخش «اطلاعات تماس» همین صفحه آمده، (۲) ارسال پیام از طریق فرم صفحه‌ی تماس، و (۳) پیام واتساپ به شماره‌ی دفتر یا شماره‌ی اختصاصی هر وکیل. پاسخ در ساعات کاری معمولاً ظرف چند ساعت داده می‌شود.",
    },
  ];
}

export async function generateStaticParams() {
  return offices.map((o) => ({ cityId: o.id }));
}

// این صفحه فقط برای locale=fa رندر می‌شود — middleware مسیر /en/offices را
// به /fa/offices ریدایرکت می‌کند. اما generateMetadata همچنان با locale=en
// می‌تواند صدا زده شود (پیش از ریدایرکت). برای همین canonical فارسی می‌دهیم
// و کاری با locale نداریم.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cityId: string }>;
}): Promise<Metadata> {
  const { cityId } = await params;
  const office = findOffice(cityId as OfficeId);
  if (!office) return {};
  return {
    title: `وکیل در ${office.city.fa} | دفتر ${office.city.fa} — دادپروران مهر ایران`,
    description: `دفتر ${office.city.fa} مؤسسه حقوقی دادپروران مهر ایران — ارائه‌ی خدمات وکالت و مشاوره حقوقی توسط وکلای پایه یک دادگستری. مشاوره اول رایگان.`,
    alternates: {
      canonical: `https://www.dadparvaran.com/fa/offices/${office.id}`,
    },
    openGraph: {
      title: `وکیل در ${office.city.fa} — دادپروران مهر ایران`,
      description: `دفتر ${office.city.fa} در ${office.street.fa}. وکلای پایه یک دادگستری، مشاوره اول رایگان.`,
      url: `https://www.dadparvaran.com/fa/offices/${office.id}`,
      type: "website",
    },
  };
}

export default async function OfficeCityPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  const office = findOffice(cityId as OfficeId);
  if (!office) notFound();

  const cityFA = office.city.fa;
  const intro = CITY_INTRO[office.id];
  const lawyerIds = officeToLawyerIds[office.id];

  const lawyers = await db.teamMember.findMany({
    where: { id: { in: lawyerIds }, isActive: true, status: "APPROVED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      nameFA: true,
      roleFA: true,
      photoUrl: true,
      phone: true,
      experience: true,
    },
  });

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, slug: true, title: true, readTimeMin: true },
  });

  const popularServices = POPULAR_SERVICE_SLUGS
    .map((slug) => servicesData.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const waHref = toWhatsAppLink(office.whatsapp);
  const faqs = buildFaqs(cityFA);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "خانه", url: "https://www.dadparvaran.com/fa" },
    { name: "دفاتر ما", url: "https://www.dadparvaran.com/fa/offices" },
    { name: cityFA, url: `https://www.dadparvaran.com/fa/offices/${office.id}` },
  ]);
  const faqSchema = getFAQSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `https://www.dadparvaran.com/fa/offices/${office.id}`,
    name: `دفتر ${cityFA} — دادپروران مهر ایران`,
    url: `https://www.dadparvaran.com/fa/offices/${office.id}`,
    telephone: office.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: office.street.fa,
      addressLocality: cityFA,
      addressRegion: office.region.fa,
      addressCountry: "IR",
    },
    openingHours: ["Sa-We 08:00-17:00", "Th 08:00-13:00"],
    priceRange: "$$",
    parentOrganization: {
      "@type": "Organization",
      name: "مؤسسه حقوقی دادپروران مهر ایران",
    },
  };

  return (
    <div dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-24 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-300 mb-4">
            <Link href="/fa" className="hover:text-white transition-colors">خانه</Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <Link href="/fa/offices" className="hover:text-white transition-colors">دفاتر ما</Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-gray-400">{cityFA}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-fa mb-4">
            وکیل در {cityFA}
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed max-w-3xl">{intro}</p>
          {/* CTAهای Hero — دقیقاً همان الگوی صفحات خدمات: دکمه‌ی طلایی بزرگ +
              واتساپ رنگ برند + دکمه‌ی ثانویه‌ی شیشه‌ای. شماره‌ی مستقیم دفتر
              چند سطر پایین‌تر در کارت NAP قابل تماس است. */}
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
              href="/fa/offices"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm"
            >
              سایر دفاتر
            </Link>
          </div>
        </div>
      </section>

      {/* NAP */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-6 grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">آدرس</p>
                <p className="text-sm text-gray-800 leading-relaxed">{office.street.fa}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">تلفن</p>
                <a href={`tel:${office.phone}`} className="text-sm text-gray-800 hover:text-primary-700 transition-colors font-medium" dir="ltr">
                  {office.phoneDisplay.fa}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">ساعات کاری</p>
                <p className="text-sm text-gray-800 leading-relaxed">{office.hours.fa}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-900 font-fa mb-2">خدمات حقوقی در {cityFA}</h2>
          <p className="text-gray-600 mb-8">پرتقاضاترین حوزه‌های پذیرش پرونده در این دفتر</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularServices.map((s) => (
              <Link
                key={s.slug}
                href={`/fa/services/${s.slug}`}
                className="group bg-white rounded-xl border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-md p-5 transition-all"
              >
                <h3 className="font-bold text-primary-900 font-fa group-hover:text-primary-700 transition-colors mb-2">
                  {s.titleFA}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                  {s.metaDescFA}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lawyers */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-900 font-fa mb-2">وکلای دفتر {cityFA}</h2>
          <p className="text-gray-600 mb-8">تیم وکلای پایه یک دادگستری در این شعبه</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((l) => {
              const coverage = lawyerCoverage[l.id] ?? [];
              return (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {l.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.photoUrl} alt={l.nameFA} className="w-full h-full object-cover" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-primary-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/fa/lawyers/${l.id}`} className="font-bold text-primary-900 hover:text-primary-700 transition-colors block">
                        {l.nameFA}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{l.roleFA}</p>
                      {l.experience > 0 && (
                        <p className="text-xs text-gold-700 mt-0.5">{l.experience}+ سال تجربه</p>
                      )}
                    </div>
                  </div>
                  {coverage.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">مناطق تحت پوشش:</p>
                      <div className="flex flex-wrap gap-1">
                        {coverage.map((c) => (
                          <span key={c} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {l.phone && (
                    <a
                      href={`tel:${l.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                      dir="ltr"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {l.phone}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent articles */}
      {articles.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary-900 font-fa mb-8">مقالات حقوقی اخیر</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/fa/articles/${a.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-md p-5 transition-all"
                >
                  <BookOpen className="w-5 h-5 text-primary-500 mb-3" />
                  <h3 className="font-bold text-primary-900 font-fa group-hover:text-primary-700 transition-colors line-clamp-2 mb-2">
                    {a.title}
                  </h3>
                  <p className="text-xs text-gray-500">{a.readTimeMin} دقیقه مطالعه</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-900 font-fa mb-8 text-center">
            سؤالات متداول
          </h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-gray-50 border border-gray-100 rounded-xl p-5">
                <summary className="cursor-pointer font-bold text-primary-900 font-fa list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ContactLawyersCTA />
    </div>
  );
}
