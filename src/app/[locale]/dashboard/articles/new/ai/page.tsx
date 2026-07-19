"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { ArticleType, type ArticleType as ArticleTypeValue } from "@/lib/content-enums";
import { articleTypeDescriptions, articleTypeLabels, legalCategoryLabels } from "@/modules/content-strategy/constants";
import { classifyArticleType } from "@/modules/content-strategy/article-type-classifier";

export default function AiArticlePage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const [articleType, setArticleType] = useState<ArticleTypeValue>(ArticleType.LEGAL_GUIDE);
  const [typeChosenManually, setTypeChosenManually] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    const response = await fetch("/api/articles/ai-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: form.get("topic"),
        articleType: form.get("articleType"),
        legalCategory: form.get("legalCategory"),
        audience: form.get("audience"),
      }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "ساخت مقاله ناموفق بود");
      return;
    }
    sessionStorage.setItem("dadparvaran-ai-article-draft", JSON.stringify(data));
    router.push(`/${locale}/dashboard/articles/new/manual?source=ai`);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? "ساخت مقاله با هوش مصنوعی" : "Create Article with AI"}</h1>
        <p className="mt-1 text-sm text-gray-500">{isRTL ? "موضوع را وارد کنید؛ AI متن کامل را تولید و ساختاربندی می‌کند." : "Enter a topic; AI generates and structures the complete draft."}</p>
      </header>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <label className="grid gap-2 text-sm font-medium text-gray-700">
          {isRTL ? "موضوع مقاله" : "Article topic"}
          <textarea
            name="topic"
            required
            minLength={5}
            rows={3}
            value={topic}
            onChange={event => setTopic(event.target.value)}
            onBlur={() => { if (!typeChosenManually && topic.trim()) setArticleType(classifyArticleType(topic)); }}
            className="rounded-xl border border-gray-200 px-4 py-3"
            placeholder={isRTL ? "مثلاً شرایط فسخ قرارداد اجاره تجاری" : "e.g. Terminating a commercial lease"}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            {isRTL ? "نوع محتوا (قالب و پرامپت)" : "Content type"}
            <select
              name="articleType"
              value={articleType}
              onChange={event => { setArticleType(event.target.value as ArticleTypeValue); setTypeChosenManually(true); }}
              className="rounded-xl border border-gray-200 px-4 py-3"
            >
              {Object.values(ArticleType).map((type) => <option key={type} value={type}>{articleTypeLabels[type] ?? type}</option>)}
            </select>
            <small className="font-normal leading-5 text-gray-500">{articleTypeDescriptions[articleType]}</small>
            <button
              type="button"
              onClick={() => { if (topic.trim()) setArticleType(classifyArticleType(topic)); setTypeChosenManually(false); }}
              className="justify-self-start text-xs font-normal text-primary-700"
            >
              تشخیص خودکار از روی عنوان
            </button>
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            {isRTL ? "حوزه حقوقی" : "Legal category"}
            <select name="legalCategory" defaultValue="CONTRACT_LAW" className="rounded-xl border border-gray-200 px-4 py-3">
              {Object.entries(legalCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-gray-700">
          {isRTL ? "مخاطب" : "Audience"}
          <input name="audience" defaultValue={isRTL ? "کاربران فارسی‌زبان سایت" : "Website readers"} className="rounded-xl border border-gray-200 px-4 py-3" />
        </label>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? (isRTL ? "در حال ساخت و ساختاربندی مقاله…" : "Generating…") : (isRTL ? "ساخت پیش‌نویس با AI" : "Generate AI Draft")}
        </button>
      </form>
    </div>
  );
}
