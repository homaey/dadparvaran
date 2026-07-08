"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  Upload, FileJson, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronLeft, Loader2, RefreshCw, Scale,
  BookOpen, Landmark, FileText, Layers, Grid3X3, Hash, Info, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LawNode {
  type: string;
  title: string;
  slug?: string;
  articleNumber?: string;
  content?: string;
  orderIndex?: number;
  children?: LawNode[];
  lawKey?: string;
  adoptionDate?: string;
  adoptionAuthority?: string;
  sourceUrl?: string;
  schemaVersion?: number;
  tags?: string[];
}

type ImportState = "idle" | "preview" | "importing" | "success" | "error";

const TYPE_ICONS: Record<string, typeof Scale> = {
  LAW: Scale,
  BOOK: BookOpen,
  CHAPTER: Landmark,
  PART: Layers,
  SECTION: Grid3X3,
  SUBSECTION: Hash,
  ARTICLE: FileText,
};

const TYPE_LABELS: Record<string, string> = {
  LAW: "قانون",
  BOOK: "کتاب",
  PART: "بخش",
  CHAPTER: "باب",
  SECTION: "فصل",
  SUBSECTION: "مبحث",
  ARTICLE: "ماده",
};

function countNodes(node: LawNode): Record<string, number> {
  const counts: Record<string, number> = {};
  function walk(n: LawNode) {
    counts[n.type] = (counts[n.type] || 0) + 1;
    n.children?.forEach(walk);
  }
  walk(node);
  return counts;
}

function TreeNode({ node, depth = 0 }: { node: LawNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = TYPE_ICONS[node.type] || FileText;

  return (
    <div className={cn("select-none", depth > 0 && "border-s-2 border-gray-100 ms-3 ps-3")}>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 w-full text-start py-1.5 px-2 rounded-lg text-sm transition-colors",
          hasChildren ? "hover:bg-gray-50 cursor-pointer" : "cursor-default",
          node.type === "ARTICLE" ? "text-gray-600" : "text-gray-900 font-medium"
        )}
      >
        {hasChildren ? (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-gray-400 transition-transform shrink-0",
              !expanded && "-rotate-90"
            )}
          />
        ) : (
          <span className="w-3.5" />
        )}
        <Icon className="w-4 h-4 text-primary-600 shrink-0" />
        <span className="truncate">{node.title}</span>
        <span className="text-[11px] text-gray-400 ms-auto shrink-0">
          {TYPE_LABELS[node.type] || node.type}
        </span>
      </button>
      {expanded && hasChildren && (
        <div className="mt-0.5">
          {node.children!.map((child, i) => (
            <TreeNode key={`${child.slug || child.title}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LawImportPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";

  const [state, setState] = useState<ImportState>("idle");
  const [lawData, setLawData] = useState<LawNode | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [duplicate, setDuplicate] = useState<{ id: number; title: string } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setParseErrors([]);
    setDuplicate(null);
    setImportResult(null);

    if (!file.name.endsWith(".json")) {
      setParseErrors(["فقط فایل JSON قابل قبول است."]);
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const errors: string[] = [];
      if (data.schemaVersion !== 1) errors.push("schemaVersion باید ۱ باشد");
      if (data.type !== "LAW") errors.push("ریشه باید type: LAW باشد");
      if (!data.lawKey || !/^[a-zA-Z0-9-]+$/.test(data.lawKey))
        errors.push("lawKey الزامی است (فقط حروف لاتین، عدد، خط‌تیره)");
      if (!data.title) errors.push("عنوان (title) الزامی است");

      if (errors.length > 0) {
        setParseErrors(errors);
        return;
      }

      setLawData(data);
      setFileName(file.name);
      setState("preview");
    } catch {
      setParseErrors(["فایل JSON معتبر نیست. خروجی اسکریپت تبدیل را آپلود کنید."]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = useCallback(
    async (mode: "create" | "replace" = "create") => {
      if (!lawData) return;
      setState("importing");
      setDuplicate(null);

      try {
        const res = await fetch("/api/admin/laws/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-import-mode": mode,
          },
          body: JSON.stringify(lawData),
        });

        const result = await res.json();

        if (res.status === 409 && result.error === "duplicate") {
          setDuplicate({ id: result.existingId, title: result.message });
          setState("preview");
          return;
        }

        if (!res.ok) {
          setParseErrors(result.details || [result.error || "خطای ناشناخته"]);
          setState("error");
          return;
        }

        setImportResult(result);
        setState("success");
      } catch {
        setParseErrors(["خطا در ارتباط با سرور"]);
        setState("error");
      }
    },
    [lawData]
  );

  const reset = useCallback(() => {
    setState("idle");
    setLawData(null);
    setFileName("");
    setParseErrors([]);
    setImportResult(null);
    setDuplicate(null);
  }, []);

  const counts = lawData ? countNodes(lawData) : {};
  const totalNodes = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRTL ? "وارد کردن قانون" : "Import Law"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRTL
            ? "فایل JSON خروجی اسکریپت تبدیل را آپلود کنید"
            : "Upload the JSON output from the converter script"}
        </p>
      </div>

      {/* Upload zone */}
      {(state === "idle" || parseErrors.length > 0) && !lawData && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center transition-colors",
            "border-gray-200 hover:border-primary-300 hover:bg-primary-50/30"
          )}
        >
          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {isRTL ? "فایل JSON را اینجا رها کنید یا" : "Drop JSON file here or"}
          </p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-medium hover:bg-primary-800 cursor-pointer transition-colors">
            <FileJson className="w-4 h-4" />
            {isRTL ? "انتخاب فایل" : "Choose File"}
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>

          {parseErrors.length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-start">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                <XCircle className="w-4 h-4" />
                {isRTL ? "خطا در پردازش فایل" : "File processing error"}
              </div>
              <ul className="space-y-1">
                {parseErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Guide — shown in idle */}
      {state === "idle" && !lawData && (
        <div className="space-y-4">
          {/* Back to laws list */}
          <Link
            href={`/${locale}/dashboard/laws`}
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            {isRTL ? "بازگشت به لیست قوانین" : "Back to laws list"}
          </Link>

          {/* JSON Structure Guide */}
          <details className="bg-white border border-gray-100 rounded-2xl shadow-sm" open>
            <summary className="flex items-center gap-2 px-6 py-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
              <Info className="w-4 h-4 text-primary-600" />
              {isRTL ? "راهنمای ساختار فایل JSON" : "JSON File Structure Guide"}
            </summary>
            <div className="px-6 pb-6 space-y-4 text-sm">
              <p className="text-gray-600">
                {isRTL
                  ? "فایل JSON باید ساختار درختی زیر را داشته باشد. ریشه باید از نوع LAW باشد و فرزندان آن می‌توانند BOOK، PART، CHAPTER، SECTION، SUBSECTION و ARTICLE باشند."
                  : "The JSON file must follow this tree structure. The root must be type LAW, with children of type BOOK, PART, CHAPTER, SECTION, SUBSECTION, or ARTICLE."}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto" dir="ltr">
                <pre className="text-xs text-gray-700 leading-relaxed font-mono whitespace-pre">{`{
  "schemaVersion": 1,
  "type": "LAW",
  "title": "قانون مدنی",
  "lawKey": "civil-code",
  "slug": "قانون-مدنی",
  "adoptionDate": "۱۳۰۷",
  "adoptionAuthority": "مجلس شورای ملی",
  "sourceUrl": "https://example.com/law",
  "tags": ["حقوق-مدنی"],
  "children": [
    {
      "type": "BOOK",
      "title": "کتاب اول - در اموال",
      "children": [
        {
          "type": "CHAPTER",
          "title": "باب اول - در بیان اموال",
          "children": [
            {
              "type": "ARTICLE",
              "title": "ماده ۱",
              "articleNumber": "1",
              "content": "مال اعم است از ..."
            }
          ]
        }
      ]
    }
  ]
}`}</pre>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 text-xs">
                    {isRTL ? "فیلدهای الزامی ریشه (LAW)" : "Required root fields"}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-blue-700">
                    <li><code className="bg-blue-100 px-1 rounded">schemaVersion</code>: {isRTL ? "باید ۱ باشد" : "must be 1"}</li>
                    <li><code className="bg-blue-100 px-1 rounded">type</code>: {isRTL ? 'باید "LAW" باشد' : 'must be "LAW"'}</li>
                    <li><code className="bg-blue-100 px-1 rounded">title</code>: {isRTL ? "عنوان فارسی قانون" : "Persian title"}</li>
                    <li><code className="bg-blue-100 px-1 rounded">lawKey</code>: {isRTL ? "کلید لاتین یکتا (فقط a-z, 0-9, -)" : "unique latin key"}</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2 text-xs">
                    {isRTL ? "فیلدهای اختیاری" : "Optional fields"}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-700">
                    <li><code className="bg-emerald-100 px-1 rounded">slug</code>: {isRTL ? "اسلاگ URL (خودکار ساخته می‌شود)" : "URL slug (auto-generated)"}</li>
                    <li><code className="bg-emerald-100 px-1 rounded">adoptionDate</code>: {isRTL ? "تاریخ تصویب" : "adoption date"}</li>
                    <li><code className="bg-emerald-100 px-1 rounded">adoptionAuthority</code>: {isRTL ? "مرجع تصویب" : "authority"}</li>
                    <li><code className="bg-emerald-100 px-1 rounded">tags</code>: {isRTL ? "لیست اسلاگ تگ‌ها" : "tag slugs list"}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-semibold text-amber-800 mb-2 text-xs">
                  {isRTL ? "سلسله‌مراتب مجاز" : "Valid hierarchy"}
                </h4>
                <div className="text-xs text-amber-700 space-y-1">
                  <p>LAW → BOOK → PART → CHAPTER → SECTION → SUBSECTION → ARTICLE</p>
                  <p className="text-amber-600">
                    {isRTL
                      ? "نکته: هر نود ARTICLE باید articleNumber و content داشته باشد."
                      : "Note: Each ARTICLE node must have articleNumber and content."}
                  </p>
                </div>
              </div>
            </div>
          </details>

          {/* How to create JSON */}
          <details className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            <summary className="flex items-center gap-2 px-6 py-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
              <FileText className="w-4 h-4 text-primary-600" />
              {isRTL ? "چطور فایل JSON بسازم؟" : "How to create a JSON file?"}
            </summary>
            <div className="px-6 pb-6 space-y-4 text-sm text-gray-600">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">۱</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {isRTL ? "تهیه متن خام قانون" : "Get raw law text"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL
                        ? "متن کامل قانون را از منابع معتبر (مانند سایت مجلس، روزنامه رسمی، یا davoudabadi.ir) دانلود کنید."
                        : "Download the full law text from official sources."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">۲</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {isRTL ? "ساختاردهی به فرمت JSON" : "Structure as JSON"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL
                        ? "متن را به ساختار درختی JSON تبدیل کنید. بخش‌ها (کتاب، باب، فصل، مبحث) به عنوان نود والد و مواد به عنوان ARTICLE با محتوا ذخیره شوند."
                        : "Convert text to JSON tree. Sections become parent nodes, articles become ARTICLE nodes with content."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">۳</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {isRTL ? "اعتبارسنجی و آپلود" : "Validate & upload"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL
                        ? "فایل JSON را در این صفحه آپلود کنید. سیستم ساختار را بررسی و پیش‌نمایش درختی نمایش می‌دهد. اگر قانون تکراری باشد، می‌توانید نسخه قبلی را جایگزین کنید."
                        : "Upload the JSON here. The system validates structure and shows a tree preview. Duplicates can be replaced."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-2 text-xs">
                  {isRTL ? "اسکریپت تبدیل خودکار (برای davoudabadi.ir)" : "Auto-converter script (for davoudabadi.ir)"}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {isRTL
                    ? "اگر آرشیو آفلاین davoudabadi.ir را دارید، اسکریپت import-davoudabadi.ts مستقیماً قوانین را به دیتابیس وارد می‌کند:"
                    : "If you have a davoudabadi.ir offline mirror, use the import script:"}
                </p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono" dir="ltr">
                  <div>npx tsx scripts/import-davoudabadi.ts --all</div>
                  <div className="text-gray-500 mt-1"># or a specific law:</div>
                  <div>npx tsx scripts/import-davoudabadi.ts --law 6925314</div>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Preview */}
      {state === "preview" && lawData && (
        <>
          {/* Summary card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{lawData.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-lg font-mono text-xs">
                    {lawData.lawKey}
                  </span>
                  {lawData.adoptionDate && <span>{lawData.adoptionDate}</span>}
                  {lawData.adoptionAuthority && (
                    <span className="text-gray-400">— {lawData.adoptionAuthority}</span>
                  )}
                </div>
              </div>
              <button
                onClick={reset}
                className="text-gray-400 hover:text-gray-600 p-1"
                title={isRTL ? "حذف و شروع مجدد" : "Reset"}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(counts)
                .filter(([, c]) => c > 0)
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span className="text-gray-500">{TYPE_LABELS[type] || type}:</span>
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-lg text-sm">
                <span className="text-primary-600">
                  {isRTL ? "مجموع:" : "Total:"}
                </span>
                <span className="font-semibold text-primary-700">{totalNodes}</span>
              </div>
            </div>

            {lawData.tags && lawData.tags.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{isRTL ? "تگ‌ها:" : "Tags:"}</span>
                {lawData.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-gold-50 text-gold-700 px-2 py-0.5 rounded-lg text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Duplicate warning */}
          {duplicate && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                <AlertTriangle className="w-5 h-5" />
                {isRTL ? "قانون تکراری" : "Duplicate Law"}
              </div>
              <p className="text-sm text-amber-600 mb-4">{duplicate.title}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleImport("replace")}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  {isRTL ? "جایگزینی قانون قبلی" : "Replace existing"}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {isRTL ? "انصراف" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Tree preview */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              {isRTL ? "پیش‌نمایش ساختار درختی" : "Tree structure preview"}
            </h3>
            <div className="max-h-[500px] overflow-y-auto">
              <TreeNode node={lawData} />
            </div>
          </div>

          {/* Action */}
          {!duplicate && (
            <div className="flex gap-3">
              <button
                onClick={() => handleImport("create")}
                className="flex items-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isRTL ? "تأیید و وارد کردن" : "Confirm & Import"}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {isRTL ? "انصراف" : "Cancel"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Importing */}
      {state === "importing" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {isRTL ? "در حال وارد کردن قانون..." : "Importing law..."}
          </p>
        </div>
      )}

      {/* Success */}
      {state === "success" && importResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-emerald-800 mb-1">
            {importResult.message}
          </h3>
          <p className="text-sm text-emerald-600 mb-6">
            {importResult.law?.title} ({importResult.law?.lawKey})
          </p>
          <div className="flex justify-center gap-3">
            <a
              href={`/${locale}/laws/${importResult.law?.lawKey}`}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              {isRTL ? "مشاهده قانون" : "View Law"}
            </a>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {isRTL ? "وارد کردن قانون دیگر" : "Import Another"}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-red-700 font-medium mb-3">
            <XCircle className="w-5 h-5" />
            {isRTL ? "خطا در وارد کردن" : "Import Error"}
          </div>
          {parseErrors.length > 0 && (
            <ul className="space-y-1 mb-4">
              {parseErrors.map((err, i) => (
                <li key={i} className="text-sm text-red-600">
                  {err}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            {isRTL ? "تلاش مجدد" : "Try Again"}
          </button>
        </div>
      )}
    </div>
  );
}
