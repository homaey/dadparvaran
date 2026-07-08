import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Briefcase, Star, Award, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getBreadcrumbSchema } from "@/lib/schema";
import { getTagsForTeamMember } from "@/lib/team";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.lawyers" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/lawyers`,
      languages: { fa: "https://www.dadparvaran.com/fa/lawyers", en: "https://www.dadparvaran.com/en/lawyers" },
    },
  };
}

export default async function LawyersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const members = await db.teamMember.findMany({
    where: { status: "APPROVED", isActive: true },
    orderBy: { order: "asc" },
    include: { user: { select: { phone: true } } },
  });

  const membersWithTags = await Promise.all(
    members.map(async (m) => ({
      ...m,
      tags: await getTagsForTeamMember(m.id),
    }))
  );

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "وکلا" : "Lawyers", url: `https://www.dadparvaran.com/${locale}/lawyers` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-32 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              {isRTL ? "تیم ما" : "Our Team"}
            </span>
            <h1 className={`mt-3 text-4xl sm:text-5xl font-bold mb-4 ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL ? "تیم حقوقی ما" : "Our Legal Team"}
            </h1>
            <p className="text-gray-300 text-lg">
              {isRTL
                ? "آشنایی با وکلا و مشاوران حقوقی مؤسسه دادپروران مهر ایران"
                : "Meet the lawyers and legal consultants of Dadparvaraan Mehr Iran"}
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {membersWithTags.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">{isRTL ? "در حال حاضر وکیلی تأیید نشده است" : "No approved lawyers at this time"}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {membersWithTags.map((member) => {
                  const tagNames = member.tags.map((t) => isRTL ? t.nameFA : t.nameEN);

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row gap-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-bold shrink-0 mx-auto sm:mx-0 overflow-hidden">
                        {member.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.photoUrl} alt={isRTL ? member.nameFA : member.nameEN} className="w-full h-full object-cover" />
                        ) : (
                          member.nameFA.charAt(0)
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-start">
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <h2 className="text-xl font-bold text-primary-900">
                            {isRTL ? member.nameFA : member.nameEN}
                          </h2>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
                          {tagNames.slice(0, 3).map((s) => (
                            <span key={s} className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
                              {s}
                            </span>
                          ))}
                          {tagNames.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                              +{tagNames.length - 3}
                            </span>
                          )}
                        </div>

                        {(isRTL ? member.bioFA : member.bioEN) && (
                          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                            {isRTL ? member.bioFA : member.bioEN}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 justify-center sm:justify-start flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-primary-500" />
                            {isRTL ? member.roleFA : member.roleEN}
                          </div>
                          {member.experience != null && member.experience > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-primary-500" />
                              {member.experience}+ {isRTL ? "سال تجربه" : "yrs exp"}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {isRTL ? "تماس تلفنی" : "Call Now"}
                            </a>
                          )}
                          <Link
                            href={`/${locale}/lawyers/${member.id}`}
                            className="inline-flex items-center gap-1.5 bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            {isRTL ? "مشاهده پروفایل" : "View Profile"}
                            <Arrow className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
