"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Card, btnPrimary, btnSecondary, inputClass, noticeClass } from "@/components/ui";
import {
  FAQ_BLOCK_KEYS,
  hasEditorialPlaceholder,
  isCompleteFaqContent,
  parseFaqContent,
  serializeFaqItems,
  type FaqItem,
} from "@/modules/article-engine/faq";

type Definition = { key: string; label: string; instruction: string; humanOnly?: boolean };
type Block = { id: number; key: string; label: string; content: string; version: number };
type ImageGuidance = { description: string; characteristics: string[]; altText: string };
type Article = { id: number; blocks: Block[]; coverImage: string | null; imageGuidance: string | null };

function parseGuidance(raw: string | null): ImageGuidance | null {
  if (!raw) return null;
  try {
    const guidance = JSON.parse(raw);
    if (guidance && typeof guidance.description === "string" && Array.isArray(guidance.characteristics))
      return guidance;
  } catch {
    // راهنمای خراب نباید مانع ویرایش مقاله شود.
  }
  return null;
}

function rowsFor(content: string, minimum = 4) {
  return Math.min(18, Math.max(minimum, Math.ceil(content.length / 115)));
}

function composeDocument(blocks: Block[]) {
  return blocks
    .filter((block) => !FAQ_BLOCK_KEYS.has(block.key))
    .map((block) => `## ${block.label}\n${block.content.trim()}`)
    .join("\n\n");
}

function faqState(blocks: Block[]) {
  return Object.fromEntries(
    blocks.filter((block) => FAQ_BLOCK_KEYS.has(block.key)).map((block) => [block.id, parseFaqContent(block.content)]),
  ) as Record<number, FaqItem[]>;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function materializeDocument(blocks: Block[], documentText: string, faqs: Record<number, FaqItem[]>) {
  const documentBlocks = blocks.filter((block) => !FAQ_BLOCK_KEYS.has(block.key));
  const labels = documentBlocks.map((block) => block.label);
  const headingPattern = labels.length
    ? new RegExp(`^##\\s+(${labels.map(escapeRegExp).join("|")})\\s*$`, "gm")
    : null;
  const matches = headingPattern ? [...documentText.matchAll(headingPattern)] : [];
  const contentByLabel = new Map<string, string>();
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? documentText.length : documentText.length;
    contentByLabel.set(match[1], documentText.slice(start, end).trim());
  });
  const missingHeadings = labels.filter((label) => !contentByLabel.has(label));
  return {
    missingHeadings,
    blocks: blocks.map((block) =>
      FAQ_BLOCK_KEYS.has(block.key)
        ? { ...block, content: serializeFaqItems(faqs[block.id] ?? []) }
        : { ...block, content: contentByLabel.get(block.label) ?? "" },
    ),
  };
}

export default function ArticleEditor({
  taskId,
  taskStatus,
  feedback,
  editable,
  isAssignee,
  isAdmin,
  definitions,
  article,
}: {
  taskId: number;
  taskStatus: string;
  feedback: string;
  editable: boolean;
  isAssignee: boolean;
  isAdmin: boolean;
  definitions: Definition[];
  article: Article | null;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(article?.blocks ?? []);
  const [documentText, setDocumentText] = useState(composeDocument(article?.blocks ?? []));
  const [faqItems, setFaqItems] = useState<Record<number, FaqItem[]>>(faqState(article?.blocks ?? []));
  const [savedContent, setSavedContent] = useState<Record<number, string>>(
    Object.fromEntries((article?.blocks ?? []).map((block) => [block.id, block.content])),
  );
  const [busy, setBusy] = useState<"" | "generate" | "save" | "submit">("");
  const [message, setMessage] = useState("");
  const [guidance, setGuidance] = useState<ImageGuidance | null>(parseGuidance(article?.imageGuidance ?? null));
  const [coverImage, setCoverImage] = useState<string | null>(article?.coverImage ?? null);
  const [showImageGuide, setShowImageGuide] = useState(false);
  const [uploading, setUploading] = useState(false);

  const manualKeys = useMemo(
    () => new Set(definitions.filter((definition) => definition.humanOnly).map((definition) => definition.key)),
    [definitions],
  );
  const serverSignature = (article?.blocks ?? []).map((block) => `${block.id}:${block.version}`).join(",");

  useEffect(() => {
    const incoming = article?.blocks ?? [];
    setBlocks(incoming);
    setDocumentText(composeDocument(incoming));
    setFaqItems(faqState(incoming));
    setSavedContent(Object.fromEntries(incoming.map((block) => [block.id, block.content])));
    setGuidance(parseGuidance(article?.imageGuidance ?? null));
    setCoverImage(article?.coverImage ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSignature]);

  const materialized = materializeDocument(blocks, documentText, faqItems);
  const editedBlocks = materialized.blocks;
  const changedBlocks = editedBlocks.filter((block) => savedContent[block.id] !== block.content);
  const emptyBlocks = editedBlocks.filter((block) =>
    FAQ_BLOCK_KEYS.has(block.key)
      ? !isCompleteFaqContent(block.content)
      : !block.content.trim() || hasEditorialPlaceholder(block.content),
  );
  const emptyAutomaticBlocks = emptyBlocks.filter((block) => !manualKeys.has(block.key) && !FAQ_BLOCK_KEYS.has(block.key));

  async function generate() {
    setBusy("generate");
    setMessage("در حال ساخت متن کامل مقاله و آماده‌سازی پیش‌نویس…");
    const response = await fetch(`/api/tasks/${taskId}/article/generate`, { method: "POST" });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error ?? "ساخت مقاله ناموفق بود");
      return;
    }
    setMessage("پیش‌نویس آماده شد. اکنون می‌توانید متن را بازبینی و ویرایش کنید.");
    const nextGuidance = parseGuidance(data.imageGuidance ?? null);
    if (nextGuidance) setGuidance(nextGuidance);
    router.refresh();
  }

  async function saveChanges() {
    if (materialized.missingHeadings.length) {
      setMessage(`این عنوان‌ها را به متن برگردانید تا ساختار مقاله حفظ شود: ${materialized.missingHeadings.join("، ")}`);
      return false;
    }
    if (!changedBlocks.length) {
      setMessage("همه تغییرات ذخیره شده‌اند.");
      return true;
    }
    setBusy("save");
    setMessage("");
    const response = await fetch(`/api/tasks/${taskId}/article/blocks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: changedBlocks.map((block) => ({ id: block.id, content: block.content })),
      }),
    });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error ?? "ذخیره تغییرات ناموفق بود");
      return false;
    }
    setBlocks(editedBlocks);
    setSavedContent(Object.fromEntries(editedBlocks.map((block) => [block.id, block.content])));
    setMessage("همه تغییرات ذخیره شد.");
    return true;
  }

  async function submitForApproval() {
    if (emptyBlocks.length) {
      setMessage(`ابتدا این بخش‌ها را تکمیل کنید: ${emptyBlocks.map((block) => block.label).join("، ")}`);
      return;
    }
    if (!coverImage) {
      setMessage("پیش از ارسال، تصویر شاخص مقاله را مطابق راهنمای تصویر اضافه کنید.");
      return;
    }
    const saved = await saveChanges();
    if (!saved) return;

    setBusy("submit");
    const response = await fetch(`/api/tasks/${taskId}/workflow`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REVIEW" }),
    });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error ?? "ارسال مقاله ناموفق بود");
      return;
    }
    router.push("/dashboard/articles/new/calendar");
    router.refresh();
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "photo");
      const upload = await fetch("/api/upload", { method: "POST", body: form });
      const uploadData = await upload.json();
      if (!upload.ok) {
        setMessage(uploadData.error ?? "بارگذاری تصویر ناموفق بود");
        return;
      }
      const save = await fetch(`/api/tasks/${taskId}/article/cover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: uploadData.url }),
      });
      if (!save.ok) {
        const saveData = await save.json();
        setMessage(saveData.error ?? "ذخیره تصویر ناموفق بود");
        return;
      }
      setCoverImage(uploadData.url);
      setMessage("تصویر مقاله ذخیره شد.");
    } finally {
      setUploading(false);
    }
  }

  const imageGuide = showImageGuide && guidance && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowImageGuide(false)}>
      <div dir="rtl" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-fa-display text-lg font-bold text-navy-900">
            <ImageIcon className="h-5 w-5" /> راهنمای انتخاب تصویر
          </h3>
          <button type="button" aria-label="بستن" onClick={() => setShowImageGuide(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm leading-7 text-gray-700">{guidance.description}</p>
        {guidance.characteristics.length > 0 && (
          <ul className="mb-4 list-inside list-disc space-y-1.5 text-sm text-gray-600">
            {guidance.characteristics.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        )}
        <div className="mb-4 rounded-xl bg-gray-50 p-3 text-xs leading-6 text-gray-600">
          <b className="text-gray-800">متن جایگزین پیشنهادی:</b> {guidance.altText}
        </div>
        {coverImage ? (
          <div className="space-y-3">
            <img src={coverImage} alt={guidance.altText} className="max-h-56 w-full rounded-xl object-cover" />
            <p className="flex items-center gap-1.5 text-sm text-green-700"><CheckCircle className="h-4 w-4" /> تصویر مقاله ثبت شده است.</p>
            {editable && (
              <label className={`${btnSecondary} cursor-pointer`}>
                <Upload className="h-4 w-4" /> تعویض تصویر
                <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && uploadCover(event.target.files[0])} />
              </label>
            )}
          </div>
        ) : editable ? (
          <label className={`${btnPrimary} cursor-pointer`}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "در حال بارگذاری…" : "افزودن تصویر مقاله"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadCover(event.target.files[0])} />
          </label>
        ) : null}
      </div>
    </div>
  );

  if (!article) {
    return (
      <Card className="mx-auto max-w-3xl !p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
          <Sparkles className="h-7 w-7" />
        </span>
        <h2 className="font-fa-display text-xl font-bold text-navy-900">ساخت پیش‌نویس مقاله</h2>
        <p className="mx-auto mt-3 max-w-xl leading-8 text-gray-600">
          موضوع و دستورهای تولید از قبل تنظیم شده‌اند. با یک کلیک، متن کامل ساخته و برای ویرایش آماده می‌شود.
        </p>
        {editable && (
          <button type="button" className={`${btnPrimary} mt-6 min-w-52`} onClick={generate} disabled={!!busy}>
            {busy === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy === "generate" ? "در حال ساخت مقاله…" : "ساخت مقاله"}
          </button>
        )}
        {!isAssignee && (
          <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            ساخت این مقاله فقط برای مسئولی فعال است که تسک به او ارجاع شده است.
          </p>
        )}
        {message && <p className={`${noticeClass} mt-5`}>{message}</p>}
      </Card>
    );
  }

  const waitingForManager = taskStatus === "REVIEW";
  const approved = taskStatus === "APPROVED";

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      {imageGuide}

      {feedback && taskStatus === "REVISION" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          <b>اصلاح درخواستی مدیر:</b> {feedback}
        </div>
      )}
      {waitingForManager && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900">
          <span><CheckCircle className="ml-2 inline h-4 w-4" />مقاله برای تأیید مدیر ارسال شده است.</span>
          {isAdmin && <button type="button" className={btnPrimary} onClick={() => router.push(`/dashboard/content-workflow/${taskId}/article/quality`)}>بررسی نهایی</button>}
        </div>
      )}
      {approved && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-900">
          <span><CheckCircle className="ml-2 inline h-4 w-4" />مقاله تأیید شده و آماده انتشار است.</span>
          {isAdmin && <button type="button" className={btnPrimary} onClick={() => router.push(`/dashboard/content-workflow/${taskId}/article/quality`)}>ادامه برای انتشار</button>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-fa-display text-xl font-bold text-navy-900">پیش‌نویس مقاله</h2>
          <p className="mt-1 text-sm text-gray-500">متن را مانند یک سند معمولی بازبینی و اصلاح کنید.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {guidance && (
            <button type="button" className={btnSecondary} onClick={() => setShowImageGuide(true)}>
              <ImageIcon className="h-4 w-4" /> {coverImage ? "تصویر مقاله" : "راهنمای تصویر"}
            </button>
          )}
        </div>
      </div>

      {message && <p className={noticeClass}>{message}</p>}

      {editable && (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <span className="text-sm text-gray-500">
            {emptyBlocks.length
              ? `برای ارسال، ${emptyBlocks.length} بخش خالی را تکمیل کنید.`
              : !coverImage
                ? "برای ارسال، تصویر شاخص مقاله را اضافه کنید."
                : materialized.missingHeadings.length
                  ? "ساختار تیترهای مقاله را کامل کنید."
              : changedBlocks.length
                ? `${changedBlocks.length} بخش تغییر کرده است.`
                : "همه تغییرات ذخیره شده‌اند."}
          </span>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} onClick={saveChanges} disabled={!!busy || changedBlocks.length === 0}>
              <Save className="h-4 w-4" /> ذخیره تغییرات
            </button>
            <button type="button" className={btnPrimary} onClick={submitForApproval} disabled={!!busy || emptyBlocks.length > 0 || !coverImage || materialized.missingHeadings.length > 0}>
              {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {busy === "submit" ? "در حال ارسال…" : "ارسال برای تأیید مدیر"}
            </button>
          </div>
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs leading-6 text-gray-600">
          مقاله را به‌صورت یک سند پیوسته ویرایش کنید. تیترهای دارای ## ساختار داخلی انتشار را حفظ می‌کنند.
        </div>
        <textarea
          aria-label="متن کامل مقاله"
          className="min-h-[980px] w-full resize-y border-0 bg-white px-6 py-7 font-fa text-[15px] leading-9 text-gray-800 outline-none sm:px-9"
          value={documentText}
          readOnly={!editable}
          onChange={(event) => setDocumentText(event.target.value)}
        />
      </Card>

      {blocks.filter((block) => FAQ_BLOCK_KEYS.has(block.key)).map((block) => {
        const items = faqItems[block.id] ?? [];
        return (
          <Card key={block.id} className="space-y-4">
            <div>
              <h3 className="font-fa-display text-lg font-bold text-navy-900">{block.label}</h3>
              <p className="mt-1 text-sm text-gray-500">برای هر سؤال، پاسخ متناظر را در همان ردیف تکمیل کنید.</p>
            </div>
            {items.map((item, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-navy-700">سؤال {index + 1}</span>
                  {editable && (
                    <button
                      type="button"
                      aria-label={`حذف سؤال ${index + 1}`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setFaqItems((current) => ({
                        ...current,
                        [block.id]: items.filter((_, itemIndex) => itemIndex !== index),
                      }))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input
                  className={`${inputClass} mb-3 bg-white`}
                  value={item.q}
                  readOnly={!editable}
                  placeholder="متن سؤال"
                  onChange={(event) => setFaqItems((current) => ({
                    ...current,
                    [block.id]: items.map((faq, itemIndex) => itemIndex === index ? { ...faq, q: event.target.value } : faq),
                  }))}
                />
                <textarea
                  className={`${inputClass} resize-y bg-white leading-8`}
                  rows={rowsFor(item.a, 3)}
                  value={item.a}
                  readOnly={!editable}
                  placeholder="پاسخ متناظر این سؤال"
                  onChange={(event) => setFaqItems((current) => ({
                    ...current,
                    [block.id]: items.map((faq, itemIndex) => itemIndex === index ? { ...faq, a: event.target.value } : faq),
                  }))}
                />
              </div>
            ))}
            {editable && items.length < 12 && (
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setFaqItems((current) => ({
                  ...current,
                  [block.id]: [...items, { q: "", a: "" }],
                }))}
              >
                <Plus className="h-4 w-4" /> افزودن سؤال و پاسخ
              </button>
            )}
          </Card>
        );
      })}

      {emptyAutomaticBlocks.length > 0 && editable && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700">
          <span><AlertCircle className="ml-2 inline h-4 w-4" />بخشی از متن ساخته نشده است.</span>
          <button type="button" className={btnSecondary} onClick={generate} disabled={!!busy}>
            {busy === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            تلاش دوباره برای تکمیل متن
          </button>
        </div>
      )}

    </section>
  );
}
