import { permanentRedirect, notFound } from "next/navigation";
import { getTeamMemberBySlug } from "@/lib/team";

// This route is a legacy alias. The canonical lawyer profile lives at
// /[locale]/lawyers/[id]. Permanently redirect (308) so search engines
// consolidate ranking signals onto the single canonical URL.
export default async function TeamMemberRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const member = await getTeamMemberBySlug(decodeURIComponent(slug));
  if (!member) notFound();
  permanentRedirect(`/${locale}/lawyers/${member.id}`);
}
