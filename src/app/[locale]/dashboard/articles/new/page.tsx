import ArticleCreationOptions from "@/components/dashboard/ArticleCreationOptions";

export default async function NewArticleChooser({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRTL = locale === "fa";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "ساخت مقاله" : "Create Article"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isRTL ? "یکی از سه روش زیر را انتخاب کنید." : "Choose one of the three creation methods."}
        </p>
      </header>
      <ArticleCreationOptions locale={locale} />
    </div>
  );
}
