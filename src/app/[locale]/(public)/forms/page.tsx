import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  FileText, Scale, AlertTriangle, MessageSquare,
  ChevronLeft, ChevronRight, Phone, Shield, Download,
  CheckCircle2, BookOpen, User,
} from "lucide-react";
import { db } from "@/lib/db";

const ICON_MAP: Record<string, typeof FileText> = {
  FileText, Scale, AlertTriangle, MessageSquare,
};

const COLOR_MAP: Record<string, { color: string; bgColor: string; border: string }> = {
  dadkhast: { color: "text-blue-700", bgColor: "bg-blue-50", border: "border-blue-100" },
  shekvaiye: { color: "text-red-700", bgColor: "bg-red-50", border: "border-red-100" },
  ezharname: { color: "text-green-700", bgColor: "bg-green-50", border: "border-green-100" },
  tajdidnazar: { color: "text-amber-700", bgColor: "bg-amber-50", border: "border-amber-100" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRTL = locale === "fa";
  return {
    title: isRTL ? "نمونه اوراق قضایی — دادپروران مهر ایران" : "Legal Form Templates — Dadparvaran Mehr Iran",
    description: isRTL
      ? "دانلود و مشاهده نمونه اوراق قضایی رایگان: دادخواست، شکواییه، اظهارنامه و تجدیدنظرخواهی"
      : "View and download free legal form templates: petitions, complaints, declarations and appeals",
    alternates: { canonical: `https://www.dadparvaran.com/${locale}/forms` },
    ...(locale === "en" && { robots: { index: false, follow: true } }),
  };
}

export default async function FormsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const [categories, lawyers] = await Promise.all([
    db.legalFormCategory.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: {
        templates: {
          where: { isPublished: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        },
        children: {
          orderBy: { order: "asc" },
          include: {
            templates: {
              where: { isPublished: true },
              orderBy: [{ order: "asc" }, { createdAt: "desc" }],
            },
          },
        },
      },
    }),
    db.teamMember.findMany({
      where: { isActive: true, status: "APPROVED" },
      orderBy: { order: "asc" },
      select: {
        id: true, nameFA: true, nameEN: true, roleFA: true, roleEN: true,
        photoUrl: true, phone: true, slug: true, experience: true,
      },
    }),
  ]);

  const totalCount = categories.reduce(
    (sum, cat) => sum + cat.templates.length + cat.children.reduce((s, c) => s + c.templates.length, 0),
    0
  );

  const lawyerTips = isRTL ? [
    { title: "قبل از تنظیم دادخواست", text: "حتماً مدارک و مستندات خود را کامل جمع‌آوری کنید. دادخواست ناقص ممکن است قرار رد صادر شود." },
    { title: "مهلت‌های قانونی را رعایت کنید", text: "تجدیدنظرخواهی ۲۰ روز و فرجام‌خواهی ۲۰ روز مهلت دارد. فوت مهلت، حق اعتراض شما را از بین می‌برد." },
    { title: "از وکیل متخصص کمک بگیرید", text: "تنظیم حرفه‌ای اوراق قضایی تأثیر مستقیم بر نتیجه پرونده دارد. مشاوره با وکیل قبل از اقدام توصیه می‌شود." },
  ] : [
    { title: "Before Filing a Petition", text: "Make sure to gather all your documents and evidence. An incomplete petition may be rejected." },
    { title: "Respect Legal Deadlines", text: "Appeals must be filed within 20 days. Missing the deadline eliminates your right to appeal." },
    { title: "Consult a Specialist Lawyer", text: "Professional preparation of legal documents directly impacts case outcomes. Legal consultation is recommended." },
  ];

  return (
    <main className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 text-white pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 start-10 w-72 h-72 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 end-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
              <FileText className="w-4 h-4 text-gold-400" />
              <span className="text-gold-300">{isRTL ? "ابزار حقوقی رایگان" : "Free Legal Tools"}</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL ? "نمونه اوراق قضایی" : "Legal Form Templates"}
            </h1>
            <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {isRTL
                ? "نمونه‌های آماده و حرفه‌ای اوراق قضایی مطابق فرمت رسمی قوه قضاییه. مشاهده، چاپ و دانلود رایگان."
                : "Professional legal form templates matching official judiciary format. View, print and download for free."}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">{totalCount}</div>
                <div className="text-sm text-gray-400 mt-1">{isRTL ? "نمونه فرم" : "Templates"}</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">{categories.length}</div>
                <div className="text-sm text-gray-400 mt-1">{isRTL ? "دسته‌بندی" : "Categories"}</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Download className="w-5 h-5 text-gold-400" />
                </div>
                <div className="text-sm text-gray-400 mt-1">{isRTL ? "رایگان" : "Free"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{isRTL ? "هنوز نمونه‌ای ثبت نشده است" : "No templates available yet"}</p>
          </div>
        ) : (
          <div className="space-y-14">
            {categories.map((cat) => {
              const colors = COLOR_MAP[cat.slug] || { color: "text-primary-700", bgColor: "bg-primary-50", border: "border-primary-100" };
              const Icon = ICON_MAP[cat.icon || "FileText"] || FileText;
              const allTemplates = [...cat.templates, ...cat.children.flatMap(c => c.templates)];
              if (allTemplates.length === 0) return null;

              return (
                <section key={cat.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-11 h-11 rounded-xl ${colors.bgColor} ${colors.border} border flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.color}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold text-primary-900 ${isRTL ? "font-fa" : ""}`}>
                        {isRTL ? cat.nameFA : (cat.nameEN || cat.nameFA)}
                      </h2>
                      {cat.descFA && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {isRTL ? cat.descFA : (cat.descEN || cat.descFA)}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-400 ms-auto font-medium">
                      {allTemplates.length} {isRTL ? "نمونه" : "forms"}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allTemplates.map((template) => (
                      <Link
                        key={template.id}
                        href={`/${locale}/forms/${template.slug}`}
                        className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-lg p-6 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${colors.bgColor} ${colors.border} border flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${colors.color}`} />
                          </div>
                          <Chevron className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors mt-1" />
                        </div>
                        <h3 className={`font-bold text-primary-900 mb-2 group-hover:text-primary-700 transition-colors ${isRTL ? "font-fa" : ""}`}>
                          {isRTL ? template.titleFA : (template.titleEN || template.titleFA)}
                        </h3>
                        {(isRTL ? template.descFA : template.descEN) && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                            {isRTL ? template.descFA : template.descEN}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Lawyer Tips Section */}
        <section className="mt-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-primary-50 to-white px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gold-700" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold text-primary-900 ${isRTL ? "font-fa" : ""}`}>
                    {isRTL ? "توصیه‌های وکیل" : "Lawyer Tips"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isRTL ? "نکاتی که قبل از تنظیم اوراق قضایی باید بدانید" : "What you should know before preparing legal documents"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100">
              {lawyerTips.map((tip, i) => (
                <div key={i} className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <h3 className={`font-bold text-primary-900 text-sm ${isRTL ? "font-fa" : ""}`}>{tip.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section — Contact Lawyers */}
        <section className="mt-16">
          <div className="bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 end-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm mb-4">
                  <Shield className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-300">{isRTL ? "مشاوره تخصصی" : "Expert Consultation"}</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${isRTL ? "font-fa" : "font-serif"}`}>
                  {isRTL ? "نیاز به کمک حرفه‌ای دارید؟" : "Need Professional Help?"}
                </h2>
                <p className="text-gray-300 leading-relaxed max-w-xl mx-auto">
                  {isRTL
                    ? "تنظیم صحیح اوراق قضایی تأثیر مستقیم بر نتیجه پرونده شما دارد. با هر یک از وکلای مجرب ما مستقیماً تماس بگیرید."
                    : "Proper preparation of legal documents directly impacts your case outcome. Contact any of our experienced lawyers directly."}
                </p>
              </div>

              {lawyers.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {lawyers.map((lawyer) => (
                    <div key={lawyer.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden mx-auto mb-3 flex items-center justify-center">
                        {lawyer.photoUrl ? (
                          <Image
                            src={lawyer.photoUrl}
                            alt={isRTL ? lawyer.nameFA : lawyer.nameEN}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-7 h-7 text-white/60" />
                        )}
                      </div>
                      <Link
                        href={`/${locale}/lawyers/${lawyer.id}`}
                        className="font-bold text-white hover:text-gold-300 transition-colors text-sm"
                      >
                        {isRTL ? lawyer.nameFA : lawyer.nameEN}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1">
                        {isRTL ? lawyer.roleFA : lawyer.roleEN}
                      </p>
                      {lawyer.experience > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isRTL ? `${lawyer.experience} سال سابقه` : `${lawyer.experience} years exp.`}
                        </p>
                      )}
                      {lawyer.phone && (
                        <a
                          href={`tel:${lawyer.phone.replace(/[^\d+]/g, "")}`}
                          className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-primary-950 font-bold text-xs px-4 py-2 rounded-lg mt-3 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {isRTL ? "تماس" : "Call"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center">
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-primary-950 font-bold px-8 py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  {isRTL ? "درخواست مشاوره" : "Request Consultation"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
