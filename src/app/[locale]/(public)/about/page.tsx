import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Scale, Award, Users, MapPin, Phone, Briefcase, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { getBreadcrumbSchema } from "@/lib/schema";
import ContactLawyersCTA from "@/components/sections/ContactLawyersCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFA = locale === "fa";
  return {
    title: isFA ? "درباره ما — مؤسسه حقوقی دادپروران مهر ایران" : "About Us — Dadparvaran Mehr Iran Legal Institute",
    description: isFA
      ? "آشنایی با مؤسسه حقوقی دادپروران مهر ایران، تیم وکلای پایه یک دادگستری، شعب تهران، اهواز و اندیمشک"
      : "Learn about Dadparvaran Mehr Iran Legal Institute, our team of licensed attorneys, and offices in Tehran, Ahvaz, and Andimeshk",
    openGraph: {
      title: isFA ? "درباره مؤسسه دادپروران مهر ایران" : "About Dadparvaran Mehr Iran",
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/about`,
      languages: { fa: "https://www.dadparvaran.com/fa/about", en: "https://www.dadparvaran.com/en/about", "x-default": "https://www.dadparvaran.com/fa/about" },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const teamMembers = await db.teamMember.findMany({
    where: { isActive: true, status: "APPROVED" },
    orderBy: { order: "asc" },
  });

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "درباره ما" : "About", url: `https://www.dadparvaran.com/${locale}/about` },
  ]);

  const branches = isRTL
    ? [
        { city: "تهران", address: "خیابان مطهری، سلیمان‌خاطر، کوچه مسجد، پلاک ۱۹، واحد ۸" },
        { city: "اهواز", address: "کیانپارس، خیابان ۱۴ غربی، فاز ۱، مجتمع برج کیانپارس، طبقه ۸، واحد ۱" },
        { city: "اندیمشک", address: "خیابان پناهی، طبقه دوم، پاساژ آبادی" },
      ]
    : [
        { city: "Tehran", address: "Motahhari St., Soleimankhater, Masjed Alley, No. 19, Unit 8" },
        { city: "Ahvaz", address: "Kianpars, 14th West St., Phase 1, Kianpars Tower, Floor 8, Unit 1" },
        { city: "Andimeshk", address: "Panahi St., 2nd Floor, Abadi Passage" },
      ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 pt-32 pb-20 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {isRTL ? "درباره مؤسسه دادپروران مهر ایران" : "About Dadparvaran Mehr Iran"}
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {isRTL
                ? "ارائه خدمات حقوقی تخصصی با تکیه بر دانش، تجربه و تعهد حرفه‌ای توسط تیم وکلای پایه یک دادگستری"
                : "Providing specialized legal services backed by knowledge, experience, and professional commitment from a team of licensed attorneys"}
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className={`text-2xl font-bold text-primary-900 mb-4 ${isRTL ? "font-fa-display" : "font-serif"}`}>
                  {isRTL ? "مأموریت ما" : "Our Mission"}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {isRTL
                    ? "مؤسسه حقوقی دادپروران مهر ایران با هدف ارائه خدمات حقوقی جامع، شفاف و قابل اعتماد تأسیس شده است. ما معتقدیم که دسترسی به مشاوره حقوقی کیفی حق هر فرد و سازمان است و تلاش می‌کنیم با ترکیب دانش حقوقی عمیق و فناوری‌های نوین، این دسترسی را برای همه فراهم سازیم."
                    : "Dadparvaran Mehr Iran Legal Institute was established with the goal of providing comprehensive, transparent, and trustworthy legal services. We believe that access to quality legal consultation is the right of every individual and organization, and we strive to make this accessible through deep legal expertise combined with modern technology."}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {isRTL
                    ? "با حضور در سه شعبه تهران، اهواز و اندیمشک، خدمات ما در سراسر کشور قابل دسترسی است. تیم ما متشکل از وکلای پایه یک دادگستری با تجربه گسترده در حوزه‌های مختلف حقوقی است."
                    : "With offices in Tehran, Ahvaz, and Andimeshk, our services are accessible nationwide. Our team consists of licensed first-class attorneys with extensive experience across various legal fields."}
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Award,
                    title: isRTL ? "تخصص و تجربه" : "Expertise & Experience",
                    desc: isRTL ? "وکلای پایه یک با بیش از ۲۰ سال تجربه حرفه‌ای" : "Licensed attorneys with 20+ years of professional experience",
                  },
                  {
                    icon: CheckCircle2,
                    title: isRTL ? "شفافیت و اعتماد" : "Transparency & Trust",
                    desc: isRTL ? "اطلاع‌رسانی کامل از روند پرونده و هزینه‌ها" : "Full disclosure of case progress and costs",
                  },
                  {
                    icon: Users,
                    title: isRTL ? "تیم متعهد" : "Committed Team",
                    desc: isRTL ? "همراهی و پیگیری مداوم تا حصول نتیجه" : "Continuous support and follow-up until results are achieved",
                  },
                  {
                    icon: Briefcase,
                    title: isRTL ? "خدمات جامع" : "Comprehensive Services",
                    desc: isRTL ? "پوشش کامل حوزه‌های حقوقی، کیفری، خانواده و تجاری" : "Full coverage of civil, criminal, family, and commercial law",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-900 text-sm mb-1">{title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Preview */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-2xl font-bold text-primary-900 mb-8 text-center ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {isRTL ? "تیم وکلای ما" : "Our Legal Team"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/${locale}/lawyers/${member.id}`}
                  className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-700 overflow-hidden">
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photoUrl} alt={isRTL ? member.nameFA : member.nameEN} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      (isRTL ? member.nameFA : member.nameEN).charAt(0)
                    )}
                  </div>
                  <h3 className="font-bold text-primary-900 mb-1">
                    {isRTL ? member.nameFA : member.nameEN}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {isRTL ? member.roleFA : member.roleEN}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gold-600 font-medium">
                    <Award className="w-3 h-3" />
                    {member.experience}+ {isRTL ? "سال تجربه" : "years"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Branches */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-2xl font-bold text-primary-900 mb-8 text-center ${isRTL ? "font-fa-display" : "font-serif"}`}>
              {isRTL ? "شعب ما" : "Our Offices"}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div key={branch.city} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-700" />
                    </div>
                    <h3 className="font-bold text-primary-900">{isRTL ? `دفتر ${branch.city}` : `${branch.city} Office`}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{branch.address}</p>
                  <div className="flex items-center gap-2 text-sm text-primary-700">
                    <Phone className="w-4 h-4" />
                    <a href="tel:+986191010285" className="hover:text-primary-900 transition-colors">
                      {isRTL ? "۰۶۱-۹۱۰۱۰۲۸۵" : "+98 61 9101 0285"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactLawyersCTA />
      </div>
    </>
  );
}
