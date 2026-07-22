"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Search, List, X } from "lucide-react";
import { cn } from "@/lib/utils";

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

interface Section {
  id: number;
  title: string;
  depth: number;
  articleCount: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  sectionId: number;
  articleNumber: string | null;
}

interface Props {
  sections: Section[];
  articles: Article[];
  lawSlug: string;
  locale: string;
}

const DEPTH_STYLES: Record<number, { heading: string; bg: string; border: string; indent: string }> = {
  0: { heading: "text-2xl font-bold text-primary-900", bg: "bg-primary-50", border: "border-primary-200", indent: "" },
  1: { heading: "text-xl font-bold text-primary-800", bg: "bg-primary-50/50", border: "border-primary-100", indent: "ps-2 sm:ps-4" },
  2: { heading: "text-lg font-semibold text-primary-700", bg: "bg-gray-50", border: "border-gray-200", indent: "ps-4 sm:ps-8" },
  3: { heading: "text-base font-semibold text-primary-600", bg: "bg-white", border: "border-gray-100", indent: "ps-6 sm:ps-12" },
  4: { heading: "text-sm font-semibold text-gray-700", bg: "bg-white", border: "border-gray-100", indent: "ps-8 sm:ps-16" },
  5: { heading: "text-sm font-medium text-gray-600", bg: "bg-white", border: "border-gray-50", indent: "ps-10 sm:ps-20" },
  6: { heading: "text-sm font-medium text-gray-500", bg: "bg-white", border: "border-gray-50", indent: "ps-12 sm:ps-24" },
};

function getStyle(depth: number) {
  return DEPTH_STYLES[Math.min(depth, 6)];
}

export default function LawTreeClient({ sections, articles, lawSlug, locale }: Props) {
  const isRTL = locale === "fa";
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showTOC, setShowTOC] = useState(false);
  const [jumpArticle, setJumpArticle] = useState("");

  const articlesBySection = useMemo(() => {
    const map = new Map<number, Article[]>();
    for (const a of articles) {
      const arr = map.get(a.sectionId) || [];
      arr.push(a);
      map.set(a.sectionId, arr);
    }
    return map;
  }, [articles]);

  function toggleSection(sectionId: number) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function collapseAll() {
    setCollapsed(new Set(sections.map(s => s.id)));
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function isSectionVisible(sectionIndex: number): boolean {
    for (let i = sectionIndex - 1; i >= 0; i--) {
      if (sections[i].depth < sections[sectionIndex].depth) {
        if (collapsed.has(sections[i].id)) return false;
        return isSectionVisible(i);
      }
    }
    return true;
  }

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim();
    return articles.filter(a =>
      a.title.includes(q) ||
      a.articleNumber?.includes(q) ||
      a.content?.includes(q)
    );
  }, [searchQuery, articles]);

  function scrollToArticle() {
    if (!jumpArticle) return;
    const el = document.getElementById(`article-${jumpArticle}`);
    if (el) {
      expandAll();
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-gold-400");
        setTimeout(() => el.classList.remove("ring-2", "ring-gold-400"), 3000);
      }, 100);
    }
    setJumpArticle("");
  }

  const tocSections = useMemo(() => {
    return sections.filter(s => s.depth <= 2);
  }, [sections]);

  // موادی که مستقیم زیر خود قانون‌اند (بدون SECTION والد) sectionId=0 دارند.
  // قوانین «تخت» (بدون فصل‌بندی) فقط همین‌ها را دارند و اگر این‌جا رندر نشوند،
  // با وجود حضور در دیتابیس هیچ ماده‌ای نمایش داده نمی‌شود.
  const rootArticles = useMemo(() => articlesBySection.get(0) || [], [articlesBySection]);

  return (
    <div dir="rtl" className="font-fa">
      {/* Toolbar */}
      <div className="bg-white border-x border-b border-gray-200 px-4 sm:px-8 py-4 flex flex-wrap gap-3 items-center sticky top-0 z-20 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "جستجو در مواد..." : "Search articles..."}
            className="w-full ps-9 pe-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute end-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Jump to article */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={jumpArticle}
            onChange={e => setJumpArticle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && scrollToArticle()}
            placeholder={isRTL ? "شماره ماده" : "Article #"}
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-primary-400"
          />
          <button
            onClick={scrollToArticle}
            className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
          >
            {isRTL ? "برو" : "Go"}
          </button>
        </div>

        {/* TOC + Collapse controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTOC(!showTOC)}
            className={cn(
              "p-2 rounded-lg text-sm transition-colors",
              showTOC ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:bg-gray-100"
            )}
            title={isRTL ? "فهرست مطالب" : "Table of Contents"}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isRTL ? "بستن همه" : "Collapse"}
          </button>
          <button
            onClick={expandAll}
            className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isRTL ? "باز کردن همه" : "Expand"}
          </button>
        </div>
      </div>

      {/* TOC Panel */}
      {showTOC && (
        <div className="bg-gray-50 border-x border-b border-gray-200 px-4 sm:px-8 py-4 max-h-[50vh] overflow-y-auto">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">{isRTL ? "فهرست مطالب" : "Table of Contents"}</h3>
          <div className="space-y-1">
            {tocSections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  expandAll();
                  setShowTOC(false);
                  setTimeout(() => {
                    const el = document.getElementById(`section-${s.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                className={cn(
                  "block w-full text-start text-sm hover:text-primary-600 transition-colors py-1 cursor-pointer",
                  s.depth === 0 && "font-bold text-gray-900",
                  s.depth === 1 && "font-semibold text-gray-700 ps-4",
                  s.depth === 2 && "text-gray-600 ps-8",
                )}
              >
                {toPersianDigits(s.title)}
                <span className="text-gray-400 text-xs ms-2">
                  ({toPersianDigits(String(s.articleCount))} ماده)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {filteredArticles && (
        <div className="bg-white border-x border-b border-gray-200 px-4 sm:px-8 py-4">
          <div className="text-sm text-gray-500 mb-3">
            {toPersianDigits(String(filteredArticles.length))} {isRTL ? "نتیجه" : "results"}
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredArticles.slice(0, 50).map(a => (
              <div key={a.id} className="border border-gray-100 rounded-lg p-3">
                <Link
                  href={`/${locale}/laws/${lawSlug}/${a.slug}`}
                  className="text-primary-600 hover:text-primary-800 font-semibold text-sm"
                >
                  {toPersianDigits(a.title)}
                </Link>
                {a.content && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {toPersianDigits(a.content)}
                  </p>
                )}
              </div>
            ))}
            {filteredArticles.length > 50 && (
              <p className="text-xs text-gray-400 text-center">
                {isRTL ? "... و بیشتر. جستجوی دقیق‌تر را امتحان کنید" : "... and more. Try a more specific search"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      {!filteredArticles && (
        <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl">
          {/* موادِ مستقیم زیر قانون (قوانین بدون فصل‌بندی) — پیش از بخش‌ها */}
          {rootArticles.map(article => (
            <div
              key={article.id}
              id={`article-${article.articleNumber || article.id}`}
              className="px-4 sm:px-8 py-5 border-b border-gray-100 transition-all"
            >
              <Link
                href={`/${locale}/laws/${lawSlug}/${article.slug}`}
                className="inline-block text-primary-600 hover:text-primary-800 font-semibold mb-2 text-sm"
              >
                {toPersianDigits(article.title)}
              </Link>
              {article.content && (
                <p className="whitespace-pre-wrap text-gray-900 text-base leading-[2.15] text-justify">
                  {toPersianDigits(article.content)}
                </p>
              )}
            </div>
          ))}

          {sections.map((section, idx) => {
            if (!isSectionVisible(idx)) return null;

            const style = getStyle(section.depth);
            const sectionArticles = articlesBySection.get(section.id) || [];
            const isCollapsed = collapsed.has(section.id);
            const hasChildren = sectionArticles.length > 0 ||
              (idx + 1 < sections.length && sections[idx + 1].depth > section.depth);

            return (
              <div key={section.id} id={`section-${section.id}`}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 sm:px-8 py-4 border-b text-start cursor-pointer transition-colors hover:bg-gray-50",
                    style.bg,
                    style.border,
                    style.indent
                  )}
                >
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                        isCollapsed && (isRTL ? "rotate-90" : "-rotate-90")
                      )}
                    />
                  )}
                  <span className={cn(style.heading, "font-fa-display flex-1")}>
                    {toPersianDigits(section.title)}
                  </span>
                  {section.articleCount > 0 && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {toPersianDigits(String(section.articleCount))} ماده
                    </span>
                  )}
                </button>

                {/* Articles in this section */}
                {!isCollapsed && sectionArticles.map(article => (
                  <div
                    key={article.id}
                    id={`article-${article.articleNumber || article.id}`}
                    className={cn(
                      "px-4 sm:px-8 py-5 border-b border-gray-100 transition-all",
                      style.indent
                    )}
                  >
                    <Link
                      href={`/${locale}/laws/${lawSlug}/${article.slug}`}
                      className="inline-block text-primary-600 hover:text-primary-800 font-semibold mb-2 text-sm"
                    >
                      {toPersianDigits(article.title)}
                    </Link>
                    {article.content && (
                      <p className="whitespace-pre-wrap text-gray-900 text-base leading-[2.15] text-justify">
                        {toPersianDigits(article.content)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
