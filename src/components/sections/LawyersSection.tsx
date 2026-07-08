import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Award, Phone, ArrowLeft, ArrowRight } from "lucide-react";

type LawyerData = {
  id: number;
  nameFA: string;
  nameEN: string;
  roleFA: string;
  roleEN: string;
  photoUrl: string | null;
  phone: string | null;
  experience: number | null;
};

export default function LawyersSection({ members }: { members?: LawyerData[] }) {
  const t = useTranslations("lawyers");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  if (!members || members.length === 0) return null;

  return (
    <section
      className="py-24 bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
      id="lawyers"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
            {isRTL ? "تیم ما" : "Our Team"}
          </span>
          <h2 className={`mt-3 text-3xl sm:text-4xl font-bold text-primary-900 ${isRTL ? "font-fa" : "font-serif"}`}>
            {t("title")}
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <div
              key={member.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link href={`/${locale}/lawyers/${member.id}`}>
                <div className="relative h-56 overflow-hidden bg-primary-100 flex items-center justify-center cursor-pointer">
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoUrl}
                      alt={isRTL ? member.nameFA : member.nameEN}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-6xl font-bold text-primary-300">
                      {(isRTL ? member.nameFA : member.nameEN).charAt(0)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              <div className="p-6">
                <Link href={`/${locale}/lawyers/${member.id}`} className="block cursor-pointer">
                  <h3 className={`font-bold text-primary-900 mb-1 ${isRTL ? "font-fa" : ""}`}>
                    {isRTL ? member.nameFA : member.nameEN}
                  </h3>
                  <p className="text-gold-600 text-xs font-medium">
                    {isRTL ? member.roleFA : member.roleEN}
                  </p>
                </Link>

                {member.experience != null && member.experience > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <Award className="w-3.5 h-3.5 text-primary-500" />
                    <span>{member.experience}+ {isRTL ? "سال تجربه" : "years exp"}</span>
                  </div>
                )}

                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {isRTL ? "تماس با وکیل" : "Call Lawyer"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/lawyers`}
            className="inline-flex items-center gap-2 border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all"
          >
            {isRTL ? "مشاهده همه وکلا" : "View All Lawyers"}
            <Arrow className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
