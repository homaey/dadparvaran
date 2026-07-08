"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Save, Send, ArrowLeft, ArrowRight, Loader2,
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
  Type, Heading2, HelpCircle, AlertCircle, ListOrdered, ImageIcon, BookOpen,
} from "lucide-react";

type BlockType = "paragraph" | "heading" | "faq" | "callout" | "steps" | "figure" | "legal_ref";

interface Block {
  id: string;
  type: BlockType;
  content?: string;
  title?: string;
  variant?: string;
  items?: any[];
  src?: string;
  alt?: string;
  caption?: string;
  lawSlug?: string;
  articleSlug?: string;
  text?: string;
}

const BLOCK_TYPES: { type: BlockType; icon: any; labelFA: string; labelEN: string }[] = [
  { type: "paragraph", icon: Type, labelFA: "پاراگراف", labelEN: "Paragraph" },
  { type: "heading", icon: Heading2, labelFA: "عنوان", labelEN: "Heading" },
  { type: "faq", icon: HelpCircle, labelFA: "پرسش و پاسخ", labelEN: "FAQ" },
  { type: "callout", icon: AlertCircle, labelFA: "کادر توجه", labelEN: "Callout" },
  { type: "steps", icon: ListOrdered, labelFA: "مراحل", labelEN: "Steps" },
  { type: "figure", icon: ImageIcon, labelFA: "تصویر", labelEN: "Figure" },
  { type: "legal_ref", icon: BookOpen, labelFA: "ارجاع قانونی", labelEN: "Legal Ref" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function createBlock(type: BlockType): Block {
  const base = { id: uid(), type };
  switch (type) {
    case "paragraph": return { ...base, content: "" };
    case "heading": return { ...base, content: "" };
    case "faq": return { ...base, items: [{ q: "", a: "" }] };
    case "callout": return { ...base, variant: "info", title: "", content: "" };
    case "steps": return { ...base, items: [""] };
    case "figure": return { ...base, src: "", alt: "", caption: "" };
    case "legal_ref": return { ...base, lawSlug: "", articleSlug: "", text: "" };
    default: return { ...base, content: "" };
  }
}

function BlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, isRTL }: {
  block: Block;
  onChange: (b: Block) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isRTL: boolean;
}) {
  const meta = BLOCK_TYPES.find(t => t.type === block.type)!;
  const Icon = meta.icon;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-primary-200 transition-colors">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <GripVertical className="w-4 h-4 text-gray-300" />
        <Icon className="w-4 h-4 text-primary-500" />
        <span className="text-xs font-semibold text-gray-600">{isRTL ? meta.labelFA : meta.labelEN}</span>
        <div className="flex-1" />
        <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={onMoveDown} disabled={isLast} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {block.type === "paragraph" && (
          <textarea
            rows={3}
            value={block.content ?? ""}
            onChange={e => onChange({ ...block, content: e.target.value })}
            placeholder={isRTL ? "متن پاراگراف..." : "Paragraph text..."}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400 resize-none"
            dir="rtl"
          />
        )}

        {block.type === "heading" && (
          <input
            type="text"
            value={block.content ?? ""}
            onChange={e => onChange({ ...block, content: e.target.value })}
            placeholder={isRTL ? "متن عنوان..." : "Heading text..."}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary-400"
            dir="rtl"
          />
        )}

        {block.type === "faq" && (
          <div className="space-y-3">
            {(block.items ?? []).map((item: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 shrink-0">Q{i + 1}</span>
                  <input
                    type="text"
                    value={item.q}
                    onChange={e => {
                      const items = [...(block.items ?? [])];
                      items[i] = { ...items[i], q: e.target.value };
                      onChange({ ...block, items });
                    }}
                    placeholder={isRTL ? "سوال..." : "Question..."}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
                    dir="rtl"
                  />
                  <button
                    onClick={() => {
                      const items = (block.items ?? []).filter((_: any, j: number) => j !== i);
                      onChange({ ...block, items });
                    }}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.a}
                  onChange={e => {
                    const items = [...(block.items ?? [])];
                    items[i] = { ...items[i], a: e.target.value };
                    onChange({ ...block, items });
                  }}
                  placeholder={isRTL ? "پاسخ..." : "Answer..."}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400 resize-none"
                  dir="rtl"
                />
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, items: [...(block.items ?? []), { q: "", a: "" }] })}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {isRTL ? "افزودن سوال" : "Add question"}
            </button>
          </div>
        )}

        {block.type === "callout" && (
          <>
            <div className="flex gap-3">
              <select
                value={block.variant ?? "info"}
                onChange={e => onChange({ ...block, variant: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
              >
                <option value="info">{isRTL ? "اطلاعات" : "Info"}</option>
                <option value="warning">{isRTL ? "هشدار" : "Warning"}</option>
                <option value="tip">{isRTL ? "نکته" : "Tip"}</option>
                <option value="danger">{isRTL ? "خطر" : "Danger"}</option>
              </select>
              <input
                type="text"
                value={block.title ?? ""}
                onChange={e => onChange({ ...block, title: e.target.value })}
                placeholder={isRTL ? "عنوان کادر..." : "Callout title..."}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
                dir="rtl"
              />
            </div>
            <textarea
              rows={2}
              value={block.content ?? ""}
              onChange={e => onChange({ ...block, content: e.target.value })}
              placeholder={isRTL ? "متن کادر..." : "Callout content..."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400 resize-none"
              dir="rtl"
            />
          </>
        )}

        {block.type === "steps" && (
          <div className="space-y-2">
            {(block.items ?? []).map((step: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={e => {
                    const items = [...(block.items ?? [])];
                    items[i] = e.target.value;
                    onChange({ ...block, items });
                  }}
                  placeholder={isRTL ? `مرحله ${i + 1}...` : `Step ${i + 1}...`}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
                  dir="rtl"
                />
                <button
                  onClick={() => {
                    const items = (block.items ?? []).filter((_: any, j: number) => j !== i);
                    onChange({ ...block, items });
                  }}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, items: [...(block.items ?? []), ""] })}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {isRTL ? "افزودن مرحله" : "Add step"}
            </button>
          </div>
        )}

        {block.type === "figure" && (
          <div className="space-y-2">
            <input
              type="url"
              value={block.src ?? ""}
              onChange={e => onChange({ ...block, src: e.target.value })}
              placeholder={isRTL ? "آدرس تصویر (URL)..." : "Image URL..."}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
              dir="ltr"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={block.alt ?? ""}
                onChange={e => onChange({ ...block, alt: e.target.value })}
                placeholder={isRTL ? "متن جایگزین (alt)..." : "Alt text..."}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
                dir="rtl"
              />
              <input
                type="text"
                value={block.caption ?? ""}
                onChange={e => onChange({ ...block, caption: e.target.value })}
                placeholder={isRTL ? "کپشن..." : "Caption..."}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
                dir="rtl"
              />
            </div>
          </div>
        )}

        {block.type === "legal_ref" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={block.lawSlug ?? ""}
                onChange={e => onChange({ ...block, lawSlug: e.target.value })}
                placeholder={isRTL ? "slug قانون (مثلاً قانون-مدنی)" : "Law slug"}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
              />
              <input
                type="text"
                value={block.articleSlug ?? ""}
                onChange={e => onChange({ ...block, articleSlug: e.target.value })}
                placeholder={isRTL ? "slug ماده (مثلاً ماده-۱)" : "Article slug"}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <input
              type="text"
              value={block.text ?? ""}
              onChange={e => onChange({ ...block, text: e.target.value })}
              placeholder={isRTL ? "متن لینک..." : "Link text..."}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
              dir="rtl"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewArticlePage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    readTimeMin: 5,
    tags: "",
  });

  function toSlug(str: string) {
    return str.trim().replace(/\s+/g, "-").replace(/[^؀-ۿa-zA-Z0-9-]/g, "");
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = k === "readTimeMin" ? parseInt(e.target.value) || 5 : e.target.value;
    setForm(p => ({ ...p, [k]: val }));
    if (k === "title") setForm(p => ({ ...p, title: e.target.value, slug: toSlug(e.target.value) }));
  };

  const addBlock = useCallback((type: BlockType) => {
    setBlocks(prev => [...prev, createBlock(type)]);
    setShowAddMenu(false);
  }, []);

  const updateBlock = useCallback((id: string, updated: Block) => {
    setBlocks(prev => prev.map(b => b.id === id ? updated : b));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }, []);

  function serializeBlocks(): any[] {
    return blocks.map(({ id, ...rest }) => {
      const clean: any = { type: rest.type };
      if (rest.content) clean.content = rest.content;
      if (rest.title) clean.title = rest.title;
      if (rest.variant) clean.variant = rest.variant;
      if (rest.items && rest.items.length > 0) clean.items = rest.items;
      if (rest.src) clean.src = rest.src;
      if (rest.alt) clean.alt = rest.alt;
      if (rest.caption) clean.caption = rest.caption;
      if (rest.lawSlug) clean.lawSlug = rest.lawSlug;
      if (rest.articleSlug) clean.articleSlug = rest.articleSlug;
      if (rest.text) clean.text = rest.text;
      return clean;
    });
  }

  async function submit(status: "DRAFT" | "PUBLISHED") {
    setLoading(true);
    setError("");

    if (!form.title.trim()) {
      setError(isRTL ? "عنوان الزامی است" : "Title is required");
      setLoading(false);
      return;
    }

    if (blocks.length === 0) {
      setError(isRTL ? "حداقل یک بلوک محتوا اضافه کنید" : "Add at least one content block");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status,
        blocks: serializeBlocks(),
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }

    router.push(`/${locale}/dashboard/articles`);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <Arrow className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRTL ? "مقاله جدید" : "New Article"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Meta fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "عنوان" : "Title"}</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={f("title")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={f("slug")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "خلاصه" : "Excerpt"}</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={f("excerpt")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 resize-none"
                dir="rtl"
              />
            </div>
          </div>

          {/* Block editor */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              {isRTL ? "بلوک‌های محتوا" : "Content Blocks"}
              <span className="text-xs font-normal text-gray-400">({blocks.length})</span>
            </h2>

            {blocks.length === 0 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <Type className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-1">{isRTL ? "هنوز بلوکی اضافه نشده" : "No blocks yet"}</p>
                <p className="text-gray-300 text-xs">{isRTL ? "از دکمه زیر بلوک‌های محتوا اضافه کنید" : "Use the button below to add content blocks"}</p>
              </div>
            )}

            {blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                onChange={b => updateBlock(block.id, b)}
                onRemove={() => removeBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, -1)}
                onMoveDown={() => moveBlock(block.id, 1)}
                isFirst={idx === 0}
                isLast={idx === blocks.length - 1}
                isRTL={isRTL}
              />
            ))}

            {/* Add block button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-primary-400 text-gray-500 hover:text-primary-600 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isRTL ? "افزودن بلوک" : "Add Block"}
              </button>

              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
                  <div className="absolute bottom-full mb-2 start-0 end-0 z-20 bg-white rounded-xl border border-gray-200 shadow-xl p-2 grid grid-cols-2 gap-1">
                    {BLOCK_TYPES.map(bt => {
                      const BtIcon = bt.icon;
                      return (
                        <button
                          key={bt.type}
                          onClick={() => addBlock(bt.type)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-700 text-sm transition-colors text-start"
                        >
                          <BtIcon className="w-4 h-4 text-primary-400" />
                          {isRTL ? bt.labelFA : bt.labelEN}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">{isRTL ? "تنظیمات" : "Settings"}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "تصویر کاور (URL)" : "Cover Image (URL)"}</label>
              <input type="url" value={form.coverImage} onChange={f("coverImage")} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "زمان مطالعه (دقیقه)" : "Read Time (min)"}</label>
              <input type="number" min={1} max={60} value={form.readTimeMin} onChange={f("readTimeMin")} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "تگ‌ها (slug با کاما)" : "Tags (slugs, comma separated)"}</label>
              <input type="text" value={form.tags} onChange={f("tags")} placeholder={isRTL ? "حقوق-مدنی, اجاره-و-ملک" : "civil-law, rental"} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => submit("DRAFT")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-gray-300 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isRTL ? "ذخیره پیش‌نویس" : "Save Draft"}
            </button>
            <button
              onClick={() => submit("PUBLISHED")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isRTL ? "انتشار مقاله" : "Publish Article"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
