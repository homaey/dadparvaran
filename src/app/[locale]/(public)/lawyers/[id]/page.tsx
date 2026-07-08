import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Award, Briefcase, Phone, CheckCircle2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { getBreadcrumbSchema, getPersonSchema } from "@/lib/schema";
import { getTagsForTeamMember } from "@/lib/team";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const memberId = parseInt(id);
  if (isNaN(memberId)) return { title: "Not Found" };
  const member = await db.teamMember.findUnique({ where: { id: memberId } });
  if (!member) return { title: "Not Found" };
  const name = locale === "fa" ? member.nameFA : member.nameEN;
  const role = locale === "fa" ? member.roleFA : member.roleEN;
  return {
    title: `${name} — ${role}`,
    description: (locale === "fa" ? member.bioFA : member.bioEN)?.slice(0, 160),
    openGraph: {
      title: name,
      description: (locale === "fa" ? member.bioFA : member.bioEN)?.slice(0, 160) ?? undefined,
      images: member.photoUrl ? [member.photoUrl] : ["/og-image.jpg"],
      type: "profile",
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/lawyers/${id}`,
      languages: {
        fa: `https://www.dadparvaran.com/fa/lawyers/${id}`,
        en: `https://www.dadparvaran.com/en/lawyers/${id}`,
      },
    },
  };
}

export default async function LawyerProfilePage({ params }: Props) {
  const { locale, id } = await params;
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronRight : ChevronLeft;
  const memberId = parseInt(id);

  if (isNaN(memberId)) notFound();

  const member = await db.teamMember.findUnique({
    where: { id: memberId, status: "APPROVED", isActive: true },
    include: {
      user: { select: { phone: true } },
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, title: true, slug: true, readTimeMin: true, publishedAt: true },
      },
    },
  });

  if (!member) notFound();

  const tags = await getTagsForTeamMember(member.id);
  const tagNames = tags.map((t) => (isRTL ? t.nameFA : t.nameEN));

  const breadcrumb = getBreadcrumbSchema([
    { name: isRTL ? "خانه" : "Home", url: `https://www.dadparvaran.com/${locale}` },
    { name: isRTL ? "وکلا" : "Lawyers", url: `https://www.dadparvaran.com/${locale}/lawyers` },
    { name: isRTL ? member.nameFA : member.nameEN, url: `https://www.dadparvaran.com/${locale}/lawyers/${id}` },
  ]);

  const personSchema = getPersonSchema({
    name: isRTL ? member.nameFA : member.nameEN,
    role: isRTL ? member.roleFA : member.roleEN,
    description: (isRTL ? member.bioFA : member.bioEN) ?? undefined,
    image: member.photoUrl ?? undefined,
    url: `https://www.dadparvaran.com/${locale}/lawyers/${id}`,
    barNumber: member.barNumber ?? undefined,
    experience: member.experience ?? undefined,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <section className="bg-gradient-to-br from-primary-950 to-primary-800 pt-32 pb-20 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/${locale}/lawyers`} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
              <Arrow className="w-4 h-4" />
              {isRTL ? "بازگشت به لیست وکلا" : "Back to Lawyers"}
            </Link>

            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-28 h-28 rounded-2xl bg-primary-700/60 flex items-center justify-center text-5xl font-bold text-white shrink-0 overflow-hidden">
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={isRTL ? member.nameFA : member.nameEN} className="w-full h-full object-cover" />
                ) : (
                  (isRTL ? member.nameFA : member.nameEN).charAt(0)
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  {isRTL ? member.nameFA : member.nameEN}
                </h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tagNames.map((s) => (
                    <span key={s} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gold-400" />
                    {member.experience}+ {isRTL ? "سال تجربه" : "years exp"}
                  </div>
                </div>
              </div>

              <div className="sm:text-end">
                <div className="flex flex-col gap-2">
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {member.phone}
                    </a>
                  )}
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isRTL ? "تماس با ما" : "Contact Us"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {(isRTL ? member.bioFA : member.bioEN) && (
                <div>
                  <h2 className="text-xl font-bold text-primary-900 mb-4">{isRTL ? "درباره من" : "About"}</h2>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {isRTL ? member.bioFA : member.bioEN}
                  </p>
                </div>
              )}

              {member.articles.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                    {isRTL ? "مقالات اخیر" : "Recent Articles"}
                  </h2>
                  <div className="space-y-4">
                    {member.articles.map((a) => (
                      <Link
                        key={a.id}
                        href={`/${locale}/articles/${a.slug}`}
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors group"
                      >
                        <BookOpen className="w-5 h-5 text-primary-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-primary-700 line-clamp-1">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.readTimeMin} {isRTL ? "دقیقه مطالعه" : "min read"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-gray-900">{isRTL ? "اطلاعات تکمیلی" : "Details"}</h3>
                {[
                  { label: isRTL ? "شماره پروانه" : "Bar Number", value: member.barNumber },
                  { label: isRTL ? "سابقه" : "Experience", value: `${member.experience}+ ${isRTL ? "سال" : "years"}` },
                  ...(member.education ? [{ label: isRTL ? "تحصیلات" : "Education", value: member.education }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-800 font-medium text-end">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {isRTL ? "وکیل تأیید شده" : "Verified Lawyer"}
              </div>

              {member.phone ? (
                <a
                  href={`tel:${member.phone}`}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {isRTL ? "تماس تلفنی" : "Call Now"}
                  <span className="text-green-200 text-sm font-normal">{member.phone}</span>
                </a>
              ) : (
                <Link
                  href={`/${locale}/contact`}
                  className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {isRTL ? "تماس با ما" : "Contact Us"}
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
