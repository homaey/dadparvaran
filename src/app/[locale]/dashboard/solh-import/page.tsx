"use client";

import { useState, useMemo } from "react";
import {
  Download, Loader2, CheckCircle, XCircle, FileText,
  BarChart3, Zap, Clock, ChevronRight, ChevronLeft,
  Square, CheckSquare, SquareCheck, Settings, Eye, EyeOff,
  Wifi, WifiOff, ChevronDown, ChevronUp, Save,
} from "lucide-react";

interface ArticleItem {
  sourceId: string;
  title: string;
  category: string;
  categorySlug: string;
  priority: number;
  length: number;
}

interface Stats {
  totalExtracted: number;
  eligible: number;
  alreadyImported: number;
  readyToImport: number;
  categories: Record<string, number>;
  articles: ArticleItem[];
}

interface ImportResult {
  imported: number;
  failed: number;
  results: { id: number; title: string; status: string; scheduledAt: string; aiUsed: boolean; error?: string }[];
}

const PER_PAGE = 57;

export default function SolhImportPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useAi, setUseAi] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // API settings state
  const [apiOpen, setApiOpen] = useState(false);
  const [apiProvider, setApiProvider] = useState("parspack");
  const [apiKey, setApiKey] = useState("");
  const [apiModel, setApiModel] = useState("openai/gpt-5.5");
  const [showKey, setShowKey] = useState(false);
  const [apiSaving, setApiSaving] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [apiHasKey, setApiHasKey] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);

  async function loadApiSettings() {
    try {
      const res = await fetch("/api/admin/ai-settings");
      if (res.ok) {
        const data = await res.json();
        setApiProvider(data.provider || "parspack");
        setApiModel(data.model || "openai/gpt-5.5");
        setApiHasKey(data.hasApiKey);
        setApiLoaded(true);
      }
    } catch {}
  }

  async function saveApiSettings() {
    setApiSaving(true);
    setApiStatus(null);
    try {
      const body: Record<string, string> = { provider: apiProvider, model: apiModel };
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      const res = await fetch("/api/admin/ai-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setApiStatus({ ok: true, message: "تنظیمات ذخیره شد" });
      setApiHasKey(true);
      setApiKey("");
    } catch (e) {
      setApiStatus({ ok: false, message: (e as Error).message });
    } finally {
      setApiSaving(false);
    }
  }

  async function testApiConnection() {
    setApiTesting(true);
    setApiStatus(null);
    try {
      const res = await fetch("/api/admin/ai-settings", { method: "POST" });
      const data = await res.json();
      setApiStatus(data);
    } catch (e) {
      setApiStatus({ ok: false, message: (e as Error).message });
    } finally {
      setApiTesting(false);
    }
  }

  function handleApiToggle() {
    if (!apiOpen && !apiLoaded) loadApiSettings();
    setApiOpen(v => !v);
  }

  const articles = stats?.articles ?? [];
  const totalPages = Math.max(1, Math.ceil(articles.length / PER_PAGE));
  const pageArticles = useMemo(
    () => articles.slice(page * PER_PAGE, (page + 1) * PER_PAGE),
    [articles, page],
  );

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/solh-import");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStats(data);
      setSelected(new Set());
      setPage(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function startImport() {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/solh-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceIds: [...selected], useAi }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
      setSelected(new Set());
      fetchStats();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function togglePage() {
    const pageIds = pageArticles.map(a => a.sourceId);
    const allSelected = pageIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }

  function selectAll() {
    if (selected.size === articles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(articles.map(a => a.sourceId)));
    }
  }

  const pageAllSelected = pageArticles.length > 0 && pageArticles.every(a => selected.has(a.sourceId));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">واردسازی مقالات solh.ir</h1>
          <p className="text-sm text-gray-500 mt-1">وارد کردن و بازنویسی مقالات از مجموعه قبلی</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          بارگذاری آمار
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* تنظیمات API */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <button
          onClick={handleApiToggle}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-800">تنظیمات API هوش مصنوعی</span>
            {apiHasKey && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> متصل
              </span>
            )}
          </div>
          {apiOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {apiOpen && (
          <div className="border-t px-5 py-4 space-y-4">
            {/* ارائه‌دهنده */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ارائه‌دهنده</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {([
                  { id: "parspack", name: "پارس‌پک", desc: "واسط AI Studio — دسترسی به مدل‌های OpenAI، Anthropic و غیره", hint: "Base URL: my.parspack.com/api/aistudio/api/v1" },
                  { id: "openai", name: "OpenAI (مستقیم)", desc: "اتصال مستقیم به ChatGPT / GPT-4o", hint: "Base URL: api.openai.com" },
                  { id: "claude", name: "Anthropic (مستقیم)", desc: "اتصال مستقیم به Claude", hint: "Base URL: api.anthropic.com" },
                ] as const).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setApiProvider(p.id);
                      if (p.id === "parspack") setApiModel("openai/gpt-5.5");
                      else if (p.id === "openai") setApiModel("gpt-4o-mini");
                      else setApiModel("claude-sonnet-4-20250514");
                    }}
                    className={`text-right p-3 rounded-lg border-2 transition-all ${
                      apiProvider === p.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono" dir="ltr">{p.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* مدل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">مدل</label>
                <input
                  type="text"
                  value={apiModel}
                  onChange={(e) => setApiModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono" dir="ltr"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {apiProvider === "parspack" && "مثال: openai/gpt-5.5 — openai/gpt-4o — anthropic/claude-sonnet-4"}
                  {apiProvider === "openai" && "مثال: gpt-4o-mini — gpt-4o — gpt-4.1"}
                  {apiProvider === "claude" && "مثال: claude-sonnet-4-20250514 — claude-haiku-4-5-20251001"}
                </p>
              </div>

              {/* کلید API */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  کلید API
                  {apiHasKey && <span className="text-green-600 mr-1 text-xs font-normal">(ثبت شده)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={apiHasKey ? "بدون تغییر — کلید قبلی فعال است" : "کلید API را وارد کنید"}
                    className="w-full px-3 py-2 border rounded-lg text-sm pl-10 font-mono" dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(v => !v)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {apiProvider === "parspack" && "کلید از پنل پارس‌پک → AI Studio → کلیدهای API"}
                  {apiProvider === "openai" && "کلید از platform.openai.com → API Keys"}
                  {apiProvider === "claude" && "کلید از console.anthropic.com → API Keys"}
                </p>
              </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={saveApiSettings}
                disabled={apiSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
              >
                {apiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                ذخیره تنظیمات
              </button>
              <button
                onClick={testApiConnection}
                disabled={apiTesting || !apiHasKey}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm transition-colors"
              >
                {apiTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                تست اتصال
              </button>
            </div>

            {/* نتیجه */}
            {apiStatus && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                apiStatus.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {apiStatus.ok ? <Wifi className="w-4 h-4 shrink-0" /> : <WifiOff className="w-4 h-4 shrink-0" />}
                {apiStatus.message}
              </div>
            )}
          </div>
        )}
      </div>

      {stats && (
        <>
          {/* آمار کلی */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<FileText className="w-5 h-5 text-gray-500" />} label="کل استخراج‌شده" value={stats.totalExtracted} />
            <StatCard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="واجد شرایط" value={stats.eligible} />
            <StatCard icon={<Download className="w-5 h-5 text-blue-500" />} label="قابل واردسازی" value={stats.readyToImport} />
            <StatCard icon={<Clock className="w-5 h-5 text-orange-500" />} label="قبلاً وارد شده" value={stats.alreadyImported} />
          </div>

          {/* دسته‌بندی‌ها */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">توزیع دسته‌بندی</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categories).map(([cat, count]) => (
                <span key={cat} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* نوار ابزار انتخاب + واردسازی */}
          <div className="bg-white rounded-lg border p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button onClick={selectAll} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                {selected.size === articles.length ? (
                  <SquareCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selected.size === articles.length ? "لغو انتخاب همه" : `انتخاب همه (${articles.length})`}
              </button>
              {selected.size > 0 && (
                <span className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {selected.size} مقاله انتخاب شده
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">بازنویسی AI</span>
              </label>
              <button
                onClick={startImport}
                disabled={importing || selected.size === 0}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {importing ? "در حال واردسازی..." : `واردسازی ${selected.size > 0 ? selected.size + " مقاله" : ""}`}
              </button>
            </div>
          </div>
          {useAi && (
            <p className="text-xs text-amber-600 -mt-4 px-1">
              بازنویسی AI کندتر است. در صورت خطای API، مقالات بدون بازنویسی وارد می‌شوند.
            </p>
          )}

          {/* جدول مقالات */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-3 text-right w-10">
                      <button onClick={togglePage} className="text-gray-500 hover:text-blue-600">
                        {pageAllSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right text-gray-600 font-medium">#</th>
                    <th className="py-3 px-3 text-right text-gray-600 font-medium">عنوان</th>
                    <th className="py-3 px-3 text-right text-gray-600 font-medium">دسته</th>
                    <th className="py-3 px-3 text-right text-gray-600 font-medium">اولویت</th>
                    <th className="py-3 px-3 text-right text-gray-600 font-medium">حجم</th>
                  </tr>
                </thead>
                <tbody>
                  {pageArticles.map((a, i) => {
                    const globalIdx = page * PER_PAGE + i + 1;
                    const isSelected = selected.has(a.sourceId);
                    return (
                      <tr
                        key={a.sourceId}
                        onClick={() => toggleOne(a.sourceId)}
                        className={`border-b last:border-0 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{globalIdx}</td>
                        <td className="py-2.5 px-3 text-gray-800">{a.title}</td>
                        <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{a.category}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            a.priority >= 80 ? "bg-red-100 text-red-700" :
                            a.priority >= 60 ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>{a.priority}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs whitespace-nowrap">
                          {(a.length / 1000).toFixed(1)}k
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* صفحه‌بندی */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                صفحه {(page + 1).toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
                {" — "}
                نمایش {(page * PER_PAGE + 1).toLocaleString("fa-IR")} تا {Math.min((page + 1) * PER_PAGE, articles.length).toLocaleString("fa-IR")} از {articles.length.toLocaleString("fa-IR")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === i ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {(i + 1).toLocaleString("fa-IR")}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* نتایج واردسازی */}
      {result && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-800">
              {result.imported} مقاله با موفقیت وارد شد
              {result.failed > 0 && ` — ${result.failed} خطا`}
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {result.results.map((r, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                r.status === "SCHEDULED" ? "bg-green-50" : "bg-red-50"
              }`}>
                <div className="flex items-center gap-2">
                  {r.status === "SCHEDULED" ? (
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="text-gray-800">{r.title}</span>
                  {r.aiUsed && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">AI</span>}
                </div>
                {r.scheduledAt && (
                  <span className="text-gray-500 text-xs whitespace-nowrap mr-2">
                    {new Date(r.scheduledAt).toLocaleDateString("fa-IR")} — {new Date(r.scheduledAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {r.error && <span className="text-red-600 text-xs">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-2xl font-bold text-gray-900">{value.toLocaleString("fa-IR")}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}
