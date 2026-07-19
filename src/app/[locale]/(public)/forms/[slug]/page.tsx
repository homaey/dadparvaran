import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, Phone, Shield, AlertCircle,
  BookOpen, ArrowRight, ArrowLeft, User,
} from "lucide-react";
import FormDocumentViewer from "@/components/forms/FormDocumentViewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isRTL = locale === "fa";
  const template = await db.legalFormTemplate.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!template) return {};

  const title = isRTL ? template.titleFA : (template.titleEN || template.titleFA);
  const description = isRTL ? template.descFA : (template.descEN || template.descFA);
  const catName = template.category
    ? (isRTL ? template.category.nameFA : (template.category.nameEN || template.category.nameFA))
    : "";

  return {
    title: `${title} — ${isRTL ? "دادپروران مهر ایران" : "Dadparvaran Mehr Iran"}`,
    description: description || title,
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/forms/${slug}`,
    },
    openGraph: {
      title,
      description: description || title,
      type: "article",
      tags: catName ? [catName] : [],
    },
    ...(locale === "en" && { robots: { index: false, follow: true } }),
  };
}

const TIPS_BY_TEMPLATE: Record<string, { fa: string[]; en: string[] }> = {
  "dadkhast-motalebe-vajh": {
    fa: [
      "دادخواست مطالبه وجه باید مبلغ دقیق خواسته و منشأ بدهی (چک، سفته، قرارداد) را مشخص کند.",
      "گواهینامه عدم پرداخت بانک برای چک‌های برگشتی ضروری است و باید ضمیمه شود.",
      "خسارت تأخیر تأدیه از تاریخ سررسید محاسبه می‌شود؛ حتماً تاریخ دقیق را قید کنید.",
      "اگر طلب بالای ۲۰ میلیون تومان باشد، رسیدگی در صلاحیت دادگاه عمومی حقوقی است.",
    ],
    en: [
      "The petition must specify the exact amount and the source of debt (check, promissory note, contract).",
      "A bank non-payment certificate is essential for bounced checks and must be attached.",
      "Late payment damages are calculated from the due date — always state the exact date.",
      "Claims over 200 million Rials fall under the jurisdiction of the General Civil Court.",
    ],
  },
  "dadkhast-takhliye-molk": {
    fa: [
      "تخلیه ملک تجاری مشمول قانون ۱۳۵۶ است و نیاز به پرداخت حق کسب و پیشه دارد.",
      "برای ملک مسکونی مشمول قانون ۱۳۷۶، انقضای مدت اجاره کافی است.",
      "اظهارنامه تخلیه باید حداقل یک ماه قبل از انقضای مدت اجاره ارسال شود.",
      "ارائه اصل قرارداد اجاره و اظهارنامه ابلاغ‌شده در دادگاه الزامی است.",
    ],
    en: [
      "Commercial property eviction is subject to the 1977 Act and requires payment of goodwill rights.",
      "For residential property under the 1997 Act, lease expiration is sufficient grounds.",
      "An eviction notice must be sent at least one month before the lease expires.",
      "The original lease agreement and served notice must be presented in court.",
    ],
  },
  "shekvaiye-kelahbardari": {
    fa: [
      "عناصر سه‌گانه کلاهبرداری (توسل به وسایل متقلبانه، بردن مال غیر، علم و عمد) باید اثبات شود.",
      "مستندات انتقال وجه (فیش بانکی، رسید، پیامک بانکی) مهم‌ترین دلیل شماست.",
      "اسکرین‌شات مکالمات و تبلیغات فریبنده را قبل از حذف ذخیره کنید.",
      "مهلت شکایت کلاهبرداری به عنوان جرم غیرقابل گذشت، محدودیت زمانی ندارد.",
    ],
    en: [
      "The three elements of fraud (deceptive means, taking another's property, intent) must be proven.",
      "Money transfer documents (bank receipts, SMS confirmations) are your most important evidence.",
      "Save screenshots of conversations and deceptive advertisements before they are deleted.",
      "Fraud is a non-pardonable offense — there is no statute of limitations for filing a complaint.",
    ],
  },
  "shekvaiye-khiyanat-dar-amanat": {
    fa: [
      "باید ثابت شود مال به صورت امانت سپرده شده، نه هبه یا قرض.",
      "سند تحویل مال (رسید، قرارداد، شاهد) رکن اصلی اثبات جرم است.",
      "خیانت در امانت جرم قابل گذشت است؛ مهلت شکایت یک سال از تاریخ اطلاع است.",
      "صرف عدم استرداد مال، خیانت در امانت نیست؛ باید سوءنیت در تصاحب اثبات شود.",
    ],
    en: [
      "It must be proven that the property was entrusted, not gifted or loaned.",
      "A delivery document (receipt, contract, witness) is the main element proving the crime.",
      "Breach of trust is a pardonable offense — the complaint deadline is one year from awareness.",
      "Mere failure to return property is not breach of trust — intent to appropriate must be proven.",
    ],
  },
  "ezharname-esterdad-vadie": {
    fa: [
      "اظهارنامه باید مشخصات دقیق ملک، شماره قرارداد و مبلغ ودیعه را شامل شود.",
      "ارسال اظهارنامه از طریق دفتر خدمات قضایی، وجاهت قانونی بیشتری دارد.",
      "پس از ابلاغ اظهارنامه، موجر ۱۰ روز مهلت استرداد ودیعه دارد.",
      "در صورت عدم پاسخ، اظهارنامه ابلاغ‌شده مدرک محکمی برای طرح دعوا خواهد بود.",
    ],
    en: [
      "The declaration must include exact property details, contract number, and deposit amount.",
      "Sending via the judicial services office carries more legal weight.",
      "After notification, the landlord has 10 days to return the deposit.",
      "If unanswered, the served declaration becomes strong evidence for filing a lawsuit.",
    ],
  },
  "ezharname-faskh-gharardad": {
    fa: [
      "حق فسخ باید در قرارداد شرط شده یا مبتنی بر خیارات قانونی باشد.",
      "اظهارنامه فسخ باید فوری پس از اطلاع از علت فسخ ارسال شود (خیار تأخیر محدود است).",
      "ذکر دقیق بند قراردادی یا ماده قانونی مستند فسخ الزامی است.",
      "نسخه ابلاغ‌شده اظهارنامه فسخ، تاریخ فسخ را رسمی می‌کند.",
    ],
    en: [
      "The right to rescind must be stipulated in the contract or based on legal options.",
      "The rescission notice must be sent immediately upon learning of the cause (delay option is limited).",
      "Citing the exact contract clause or legal article supporting rescission is mandatory.",
      "The served copy of the rescission notice officially establishes the rescission date.",
    ],
  },
  "tajdidnazar-hokm-hoghooghi": {
    fa: [
      "مهلت تجدیدنظرخواهی ۲۰ روز از تاریخ ابلاغ رأی است — این مهلت تمدید نمی‌شود.",
      "جهات تجدیدنظرخواهی باید دقیقاً مشخص شود (خلاف قانون، خلاف شرع، نقص تحقیقات).",
      "ارائه دلایل و مستندات جدید که در مرحله بدوی ارائه نشده، در تجدیدنظر مجاز است.",
      "عدم حضور در جلسه تجدیدنظر ممکن است به ضرر شما تمام شود.",
    ],
    en: [
      "The appeal deadline is 20 days from the notification date — this deadline cannot be extended.",
      "The grounds for appeal must be precisely stated (contrary to law, Sharia, or incomplete investigation).",
      "New evidence not presented at the initial stage can be submitted at the appeal stage.",
      "Absence from the appeal hearing may work against you.",
    ],
  },
};

const DEFAULT_TIPS = {
  fa: [
    "قبل از تنظیم هر سند قضایی، مدارک و مستندات خود را کامل جمع‌آوری کنید.",
    "مهلت‌های قانونی را دقیقاً رعایت کنید؛ فوت مهلت حق شما را از بین می‌برد.",
    "تنظیم حرفه‌ای اوراق قضایی تأثیر مستقیم بر نتیجه پرونده دارد.",
    "مشاوره با وکیل متخصص قبل از اقدام، از اشتباهات پرهزینه جلوگیری می‌کند.",
  ],
  en: [
    "Gather all your documents and evidence before preparing any legal document.",
    "Strictly observe legal deadlines — missing them eliminates your rights.",
    "Professional preparation of legal documents directly impacts case outcomes.",
    "Consulting a specialist lawyer before acting prevents costly mistakes.",
  ],
};

export default async function FormTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isRTL = locale === "fa";

  const [template, lawyers] = await Promise.all([
    db.legalFormTemplate.findUnique({
      where: { slug },
      include: { category: true },
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

  if (!template || !template.isPublished) notFound();

  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const tips = TIPS_BY_TEMPLATE[template.slug] || DEFAULT_TIPS;
  const tipsList = isRTL ? tips.fa : tips.en;

  return (
    <main className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header band */}
      <div className="bg-gradient-to-b from-primary-950 to-primary-900 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {isRTL ? "خانه" : "Home"}
            </Link>
            <Chevron className="w-3.5 h-3.5" />
            <Link href={`/${locale}/forms`} className="hover:text-white transition-colors">
              {isRTL ? "اوراق قضایی" : "Legal Forms"}
            </Link>
            {template.category && (
              <>
                <Chevron className="w-3.5 h-3.5" />
                <span className="text-gray-500">
                  {isRTL ? template.category.nameFA : (template.category.nameEN || template.category.nameFA)}
                </span>
              </>
            )}
          </nav>

          <h1 className={`text-2xl sm:text-3xl font-bold text-white ${isRTL ? "font-fa" : "font-serif"}`}>
            {isRTL ? template.titleFA : (template.titleEN || template.titleFA)}
          </h1>
          {(isRTL ? template.descFA : template.descEN) && (
            <p className="mt-3 text-gray-300 max-w-3xl leading-relaxed">
              {isRTL ? template.descFA : template.descEN}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Main: Document Viewer */}
          <div>
            <FormDocumentViewer
              content={template.content}
              titleFA={template.titleFA}
              isRTL={isRTL}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Lawyer Tips Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-l from-primary-50 to-white px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gold-100 flex items-center justify-center">
                    <BookOpen className="w-4.5 h-4.5 text-gold-700" />
                  </div>
                  <h2 className={`font-bold text-primary-900 ${isRTL ? "font-fa" : ""}`}>
                    {isRTL ? "توصیه‌های وکیل" : "Lawyer Tips"}
                  </h2>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {tipsList.map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-700">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-bold text-amber-900 text-sm mb-1.5 ${isRTL ? "font-fa" : ""}`}>
                    {isRTL ? "توجه مهم" : "Important Notice"}
                  </h3>
                  <p className="text-amber-800 text-xs leading-relaxed">
                    {isRTL
                      ? "این نمونه صرفاً جنبه آموزشی دارد. برای تنظیم نهایی اوراق قضایی حتماً با وکیل مشورت کنید."
                      : "This template is for educational purposes only. Always consult a lawyer for final preparation of legal documents."}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA — Contact Lawyers */}
            <div className="bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-950 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 end-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-gold-400" />
                  <span className="text-gold-300 text-sm font-medium">
                    {isRTL ? "مشاوره تخصصی" : "Expert Help"}
                  </span>
                </div>
                <h3 className={`text-lg font-bold mb-4 ${isRTL ? "font-fa" : ""}`}>
                  {isRTL ? "تماس مستقیم با وکلا" : "Contact Our Lawyers"}
                </h3>

                {lawyers.length > 0 ? (
                  <div className="space-y-3">
                    {lawyers.map((lawyer) => (
                      <div key={lawyer.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                            {lawyer.photoUrl ? (
                              <Image
                                src={lawyer.photoUrl}
                                alt={isRTL ? lawyer.nameFA : lawyer.nameEN}
                                width={44}
                                height={44}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white/60" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/${locale}/lawyers/${lawyer.id}`}
                              className="text-sm font-bold text-white hover:text-gold-300 transition-colors"
                            >
                              {isRTL ? lawyer.nameFA : lawyer.nameEN}
                            </Link>
                            <p className="text-xs text-gray-400 truncate">
                              {isRTL ? lawyer.roleFA : lawyer.roleEN}
                              {lawyer.experience > 0 && (
                                <span className="text-gray-500">
                                  {" — "}
                                  {isRTL ? `${lawyer.experience} سال سابقه` : `${lawyer.experience}y exp.`}
                                </span>
                              )}
                            </p>
                          </div>
                          {lawyer.phone && (
                            <a
                              href={`tel:${lawyer.phone.replace(/[^\d+]/g, "")}`}
                              className="w-9 h-9 rounded-lg bg-gold-500 hover:bg-gold-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                              title={isRTL ? "تماس" : "Call"}
                            >
                              <Phone className="w-4 h-4 text-primary-950" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {isRTL
                      ? "وکلای مجرب ما آماده تنظیم حرفه‌ای این سند و ارائه مشاوره حقوقی هستند."
                      : "Our experienced lawyers are ready to professionally prepare this document and provide legal consultation."}
                  </p>
                )}

                <Link
                  href={`/${locale}/contact`}
                  className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-600 text-primary-950 font-bold py-3 rounded-xl transition-colors cursor-pointer mt-4"
                >
                  <Phone className="w-4.5 h-4.5" />
                  {isRTL ? "درخواست مشاوره" : "Request Consultation"}
                </Link>
              </div>
            </div>

            {/* Back to forms */}
            <Link
              href={`/${locale}/forms`}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-700 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium transition-colors cursor-pointer"
            >
              <Arrow className="w-4 h-4 rotate-180" />
              {isRTL ? "مشاهده سایر نمونه‌ها" : "View All Templates"}
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
