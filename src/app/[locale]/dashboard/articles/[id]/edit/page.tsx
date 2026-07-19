import { redirect } from "next/navigation";

export default async function EditArticleRedirect({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  redirect(`/${locale}/dashboard/articles/new/manual?edit=${id}`);
}
