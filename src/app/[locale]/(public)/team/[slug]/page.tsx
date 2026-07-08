import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Award, Tag as TagIcon } from "lucide-react";
import { getTeamMemberBySlug, getTagsForTeamMember } from "@/lib/team";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const member = await getTeamMemberBySlug(decodeURIComponent(slug));
  if (!member) return { title: "Not Found" };
  return { title: locale === "fa" ? member.nameFA : member.nameEN };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isRTL = locale === "fa";
  const t = await getTranslations({ locale, namespace: "team" });

  const member = await getTeamMemberBySlug(decodeURIComponent(slug));
  if (!member) notFound();

  const tags = await getTagsForTeamMember(member.id);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="py-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href={`/${locale}/team`} className="hover:text-primary-600 transition-colors">
            {t("title")}
          </Link>
          <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
          <span className="text-primary-900 font-medium">
            {isRTL ? member.nameFA : member.nameEN}
          </span>
        </nav>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-b from-primary-50 to-white p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-primary-100 shrink-0">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={isRTL ? member.nameFA : member.nameEN}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-300">
                    {(isRTL ? member.nameFA : member.nameEN).charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className={isRTL ? "text-center sm:text-right" : "text-center sm:text-left"}>
              <h1 className={`text-2xl font-bold text-primary-900 ${isRTL ? "font-fa-display" : "font-serif"}`}>
                {isRTL ? member.nameFA : member.nameEN}
              </h1>
              <p className="text-gold-600 font-medium mt-1">
                {isRTL ? member.roleFA : member.roleEN}
              </p>
              {member.barNumber && (
                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {t("barNumber")}: {member.barNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 leading-[1.9]" style={{ maxWidth: "65ch" }}>
              <p className="whitespace-pre-wrap">{isRTL ? member.bioFA : member.bioEN}</p>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-8 pb-8">
              <div className="flex items-center gap-2 mb-3">
                <TagIcon className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-medium text-gray-700">{t("specialties")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/${locale}/tags/${tag.slug}`}
                    className="text-sm bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {isRTL ? tag.nameFA : tag.nameEN}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
