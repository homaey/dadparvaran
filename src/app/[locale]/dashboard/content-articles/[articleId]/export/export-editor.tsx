"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Download } from "lucide-react";
import type { ArticleExport } from "@/modules/article-export/contract";
import { Card, btnPrimary, inputClass, fieldLabelClass, noticeClass } from "@/components/ui";

type Profile = { slug: string; service: string; keywords: string[]; metaTitle: string; metaDescription: string; imageDescription: string; imagePrompt: string; altText: string };

export default function ExportEditor({ articleId, editable, initial, preview, error }: { articleId: number; editable: boolean; initial: Profile; preview: ArticleExport | null; error: string }) {
  const router = useRouter();
  const [message, setMessage] = useState(error);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      slug: f.get("slug"), service: f.get("service"),
      keywords: String(f.get("keywords")).split(",").map(v => v.trim()).filter(Boolean),
      metaTitle: f.get("metaTitle"), metaDescription: f.get("metaDescription"),
      imageDescription: f.get("imageDescription"), imagePrompt: f.get("imagePrompt"), altText: f.get("altText"),
    };
    const res = await fetch(`/api/articles/${articleId}/export-profile`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setMessage(res.ok ? "تنظیمات ذخیره شد" : data.error);
    if (res.ok) router.refresh();
  }

  return (
    <>
      <Card>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={save}>
          <label className={fieldLabelClass}>Slug<input className={inputClass} name="slug" defaultValue={initial.slug} disabled={!editable} /></label>
          <label className={fieldLabelClass}>خدمت حقوقی<input className={inputClass} name="service" defaultValue={initial.service} disabled={!editable} /></label>
          <label className={`${fieldLabelClass} md:col-span-2`}>کلیدواژه‌ها با ویرگول<input className={inputClass} name="keywords" defaultValue={initial.keywords.join(", ")} disabled={!editable} /></label>
          <label className={fieldLabelClass}>Meta title<input className={inputClass} name="metaTitle" defaultValue={initial.metaTitle} disabled={!editable} /></label>
          <label className={fieldLabelClass}>Meta description<input className={inputClass} name="metaDescription" defaultValue={initial.metaDescription} disabled={!editable} /></label>
          <label className={`${fieldLabelClass} md:col-span-2`}>توضیح تصویر<textarea className={inputClass} name="imageDescription" defaultValue={initial.imageDescription} disabled={!editable} /></label>
          <label className={`${fieldLabelClass} md:col-span-2`}>پرامپت تصویر<textarea className={inputClass} name="imagePrompt" defaultValue={initial.imagePrompt} disabled={!editable} /></label>
          <label className={`${fieldLabelClass} md:col-span-2`}>Alt text<input className={inputClass} name="altText" defaultValue={initial.altText} disabled={!editable} /></label>
          {editable && <div className="md:col-span-2"><button className={btnPrimary}>ذخیره تنظیمات خروجی</button></div>}
        </form>
      </Card>
      {message && <p className={`${noticeClass} mt-4`}>{message}</p>}
      {preview && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-fa-display text-lg font-bold text-navy-900">JSON Preview</h2>
            <a className={btnPrimary} href={`/api/articles/${articleId}/export?download=1`}><Download className="h-4 w-4" /> دانلود JSON</a>
          </div>
          <pre className="max-h-[680px] overflow-auto rounded-2xl bg-navy-950 p-6 text-left leading-relaxed text-gray-100" dir="ltr">{JSON.stringify(preview, null, 2)}</pre>
        </section>
      )}
    </>
  );
}
