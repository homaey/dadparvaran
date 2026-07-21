import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Phone, Award, ArrowLeft, ArrowRight, Scale, MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { toWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { consultationHref, consultationLinkProps, isBaleConsultation } from "@/lib/consultation-cta";

type Lawyer = {
  id: number;
  nameFA: string;
  nameEN: string;
  roleFA: string;
  roleEN: string;
  photoUrl: string | null;
  phone: string | null;
  experience: number;
};

type Props = {
  variant?: "section" | "compact";
  lawyers?: Lawyer[];
};

async function getLawyers() {
  return db.teamMember.findMany({
    where: { isActive: true, status: "APPROVED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      nameFA: true,
      nameEN: true,
      roleFA: true,
      roleEN: true,
      photoUrl: true,
      phone: true,
      experience: true,
    },
  });
}

export default async function ContactLawyersCTA({
  variant = "section",
  lawyers: propLawyers,
}: Props) {
  const locale = await getLocale();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const lawyers = propLawyers ?? (await getLawyers());

  if (lawyers.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className="bg-primary-900 rounded-2xl p-6 text-white" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-gold-400" />
          <h3 className="font-bold text-sm">
            {isRTL ? "مشاوره با وکیل" : "Consult a Lawyer"}
          </h3>
        </div>
        <p className="text-xs text-gray-300 mb-5 leading-relaxed">
          {isRTL
            ? "تیم وکلای متخصص ما آماده پاسخگویی و ارائه مشاوره حقوقی هستند."
            : "Our team of expert lawyers is ready to answer your questions."}
        </p>
        <div className="space-y-3">
          {lawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="flex items-center gap-3 bg-white/10 rounded-xl p-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary-700 overflow-hidden shrink-0">
                {lawyer.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lawyer.photoUrl}
                    alt={isRTL ? lawyer.nameFA : lawyer.nameEN}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                    {(isRTL ? lawyer.nameFA : lawyer.nameEN).charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {isRTL ? lawyer.nameFA : lawyer.nameEN}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {isRTL ? lawyer.roleFA : lawyer.roleEN}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {toWhatsAppLink(lawyer.phone) && (
                  <a
                    href={toWhatsAppLink(lawyer.phone)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-[#25D366] hover:bg-[#1da851] rounded-lg flex items-center justify-center transition-colors"
                    aria-label={`${isRTL ? "واتساپ" : "WhatsApp"} ${isRTL ? lawyer.nameFA : lawyer.nameEN}`}
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                  </a>
                )}
                {lawyer.phone && (
                  <a
                    href={`tel:${lawyer.phone}`}
                    className="w-9 h-9 bg-primary-700 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                    aria-label={`${isRTL ? "تماس با" : "Call"} ${isRTL ? lawyer.nameFA : lawyer.nameEN}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <a
          href={consultationHref(locale)}
          {...consultationLinkProps()}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {isBaleConsultation() ? (isRTL ? "درخواست در بله" : "Bale") : (isRTL ? "ارسال پیام" : "Send Message")}
        </a>
      </div>
    );
  }

  return (
    <section
      className="py-20 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={isRTL ? "تماس با وکلا" : "Contact Lawyers"}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-20 w-72 h-72 rounded-full bg-gold-500 blur-3xl" />
        <div className="absolute bottom-10 right-20 w-56 h-56 rounded-full bg-primary-400 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
            <Scale className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 text-xs font-semibold">
              {isRTL ? "مشاوره حقوقی رایگان" : "Free Legal Consultation"}
            </span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-bold text-white mb-4 ${isRTL ? "font-fa" : "font-serif"}`}
          >
            {isRTL
              ? "نیاز به مشاوره حقوقی دارید؟"
              : "Need Legal Consultation?"}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {isRTL
              ? "تیم وکلای پایه یک دادگستری مؤسسه دادپروران مهر ایران، آماده ارائه مشاوره تخصصی و دفاع از حقوق شما هستند."
              : "Our team of licensed attorneys at Dadparvaran Mehr Iran is ready to provide expert consultation and defend your rights."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {lawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-primary-700 overflow-hidden mx-auto mb-3 ring-2 ring-gold-500/30 group-hover:ring-gold-500/60 transition-all">
                {lawyer.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lawyer.photoUrl}
                    alt={isRTL ? lawyer.nameFA : lawyer.nameEN}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                    {(isRTL ? lawyer.nameFA : lawyer.nameEN).charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-white font-bold text-sm mb-1">
                {isRTL ? lawyer.nameFA : lawyer.nameEN}
              </h3>
              <p className="text-gray-400 text-xs mb-2">
                {isRTL ? lawyer.roleFA : lawyer.roleEN}
              </p>
              <div className="flex items-center justify-center gap-1 text-gold-400 text-xs mb-4">
                <Award className="w-3 h-3" />
                <span>
                  {lawyer.experience}+ {isRTL ? "سال تجربه" : "years"}
                </span>
              </div>
              {lawyer.phone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lawyer.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-600 text-white text-xs px-3 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
                    aria-label={`${isRTL ? "تماس با" : "Call"} ${isRTL ? lawyer.nameFA : lawyer.nameEN}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {isRTL ? "تماس" : "Call"}
                  </a>
                  {toWhatsAppLink(lawyer.phone) && (
                    <a
                      href={toWhatsAppLink(lawyer.phone)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-xs px-3 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
                      aria-label={`${isRTL ? "واتساپ" : "WhatsApp"} ${isRTL ? lawyer.nameFA : lawyer.nameEN}`}
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      {isRTL ? "واتساپ" : "WhatsApp"}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={consultationHref(locale)}
            {...consultationLinkProps()}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            {isBaleConsultation() ? (isRTL ? "درخواست مشاوره در بله" : "Consult via Bale") : (isRTL ? "ارسال پیام مشاوره" : "Send Consultation Message")}
          </a>
          <Link
            href={`/${locale}/lawyers`}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 rounded-xl font-medium transition-colors cursor-pointer"
          >
            {isRTL ? "مشاهده همه وکلا" : "View All Lawyers"}
            <Arrow className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
