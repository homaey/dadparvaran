"use client";

import { useEffect, useRef, useState } from "react";
import {
  Printer, Download, Loader2, FileText, X, ZoomIn, ZoomOut, Maximize2,
} from "lucide-react";

type Props = {
  content: string;
  titleFA: string;
  isRTL: boolean;
};

const JUDICIARY_LOGO = "/judiciary-logo.png";

// A4 width (210mm) in CSS pixels at 96dpi.
const A4_WIDTH_PX = 794;

function createWatermarkImage(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-30 * Math.PI / 180);

  ctx.font = '900 64px "Vazirmatn","Estedad","IRANSans","B Nazanin",Tahoma,Arial,sans-serif';
  ctx.fillStyle = "rgba(30, 58, 138, 0.07)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.fillText("مؤسسه حقوقی دادپروران مهر ایران", 0, 0);

  return canvas.toDataURL("image/png");
}

const FORM_STYLES = `
  :root {
    --border: #181818;
    --paper: #fff;
    --soft: #f8fafc;
    --line: #d9dee7;
    --blue: #194f8a;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    background: #fff;
    padding: 11mm;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .frame {
    border: 2px solid var(--border);
    min-height: 275mm;
    padding: 5mm;
    position: relative;
  }

  /* Brand Header */
  .brand-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 0 2.8mm;
  }
  .brand-logo {
    width: 18mm;
    height: 18mm;
    display: block;
    margin-bottom: 1.2mm;
  }
  .brand-logo img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
  .brand-text {
    font-size: 12px;
    font-weight: 900;
    line-height: 1.3;
    text-align: center;
  }
  .brand-sub {
    font-size: 11px;
    font-weight: 700;
    color: #333;
    margin-top: 0.6mm;
    text-align: center;
  }

  /* Title */
  .p-title {
    text-align: center;
    font-size: 18px;
    font-weight: 900;
    margin: 0 0 4mm;
    line-height: 1.5;
  }

  /* Top Meta Grid */
  .top-meta {
    display: grid;
    grid-template-columns: 28mm 1fr 28mm 1fr;
    border: 1px solid var(--border);
    margin-bottom: 3mm;
    font-weight: 700;
  }
  .top-meta > div {
    border-left: 1px solid var(--border);
    min-height: 9mm;
    padding: 1.5mm 2mm;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .top-meta > div:nth-child(2n-1) {
    background: #f5f5f5;
  }
  .top-meta > div:last-child {
    border-left: 0;
  }
  .top-meta .val {
    justify-content: flex-start;
    font-weight: 400;
  }

  /* Print Table */
  table.print-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 3mm;
    font-size: 13px;
  }
  .print-table th, .print-table td {
    border: 1px solid var(--border);
    padding: 1.5mm 1mm;
    vertical-align: middle;
    text-align: center;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .print-table th {
    background: #f7f7f7;
    font-weight: 800;
  }
  .caption {
    background: #efefef !important;
    text-align: right !important;
    padding-right: 3mm !important;
    font-size: 14px !important;
  }
  .role-cell {
    width: 22mm;
    background: #fbfbfb;
    font-weight: 800;
  }
  .address-head {
    font-size: 12px;
    line-height: 1.5;
  }
  .value {
    text-align: right;
    white-space: pre-wrap;
    min-height: 7mm;
  }
  .section-row td {
    height: 22mm;
    vertical-align: top !important;
  }
  .label-cell {
    width: 42mm;
    background: #f7f7f7;
    font-weight: 900;
    text-align: center !important;
    vertical-align: middle !important;
    line-height: 1.7;
  }

  /* Body Box */
  .body-box {
    border: 1px solid var(--border);
    padding: 3mm;
    margin-top: 2mm;
    min-height: 70mm;
  }
  .body-head {
    font-weight: 900;
    margin-bottom: 2mm;
  }
  .body-preview {
    white-space: pre-wrap;
    text-align: justify;
    line-height: 2;
    min-height: 45mm;
  }

  /* Signature */
  .signature-line {
    height: 17mm;
    border: 1px solid var(--border);
    border-top: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 3mm;
    font-weight: 800;
  }

  /* Footer Grid */
  .footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--border);
    margin-top: 3mm;
    min-height: 20mm;
  }
  .footer-grid > div {
    border-left: 1px solid var(--border);
    padding: 2mm;
    line-height: 1.8;
  }
  .footer-grid > div:last-child {
    border-left: 0;
  }

  .empty {
    color: #777;
  }

  /* Screen preview + full-screen viewer are scaled to fit their container via
     JS (see fitPage) so the fixed A4 box always fits any viewport width without
     horizontal overflow. No CSS transform scaling here — a CSS transform does
     not shrink the layout box and would break both the preview and the PDF. */
  @media screen {
    .page {
      box-shadow: 0 4px 22px rgba(0,0,0,.18);
    }
  }

  /* Print styles */
  @page {
    size: A4 portrait;
    margin: 0;
  }

  @media print {
    body {
      margin: 0 !important;
      padding: 0 !important;
    }
    .page {
      box-shadow: none;
      margin: 0;
      padding: 7mm 8mm 6mm 8mm;
    }
    .frame {
      border-width: 1.6px;
      padding: 3mm;
    }
  }
`;

const FULL_PAGE_HTML = (content: string, titleFA: string) => `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8"/>
<title>${titleFA}</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;color:#111;direction:rtl;
font-family:"B Nazanin","BNazanin","Nazanin","IRANSans","Vazirmatn","Estedad",Tahoma,Arial,sans-serif;
font-size:14px;line-height:1.75}
${FORM_STYLES}
</style>
</head>
<body>
${content}
</body>
</html>`;

// Scale the fixed-width A4 `.page` inside `wrap` to `factor` of its natural
// size (relative to the container width) and reserve the correct scaled height
// so nothing overflows or leaves a gap. `factor` 1 = fit-to-width.
function fitPage(container: HTMLElement | null, wrap: HTMLElement | null, factor = 1) {
  if (!container || !wrap) return;
  const page = wrap.querySelector(".page") as HTMLElement | null;
  if (!page) return;
  const cs = getComputedStyle(container);
  const padX = parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
  const available = container.clientWidth - padX;
  if (available <= 0) return; // container hidden (display:none)
  const fitScale = Math.min(1, available / A4_WIDTH_PX);
  const scale = fitScale * factor;
  // The .page is 794px wide with `margin: 0 auto`; inside a narrower, RTL wrap
  // that pushes it off-screen. Pin it absolutely to the wrap's top-left corner
  // (direction-independent) so the top-left transform scales it in place.
  wrap.style.position = "relative";
  page.style.position = "absolute";
  page.style.top = "0";
  page.style.left = "0";
  page.style.margin = "0";
  page.style.transformOrigin = "top left";
  page.style.transform = `scale(${scale})`;
  // A transform does not change the layout box — size the wrapper to the result.
  wrap.style.width = `${A4_WIDTH_PX * scale}px`;
  wrap.style.height = `${page.offsetHeight * scale}px`;
}

const DocStyle: React.CSSProperties = {
  fontFamily:
    '"B Nazanin","BNazanin","Nazanin","IRANSans","Vazirmatn","Estedad",Tahoma,Arial,sans-serif',
  direction: "rtl",
  fontSize: "14px",
  lineHeight: "1.75",
  color: "#111",
};

export default function FormDocumentViewer({ content, titleFA, isRTL }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1); // multiplier over fit-to-width in the viewer

  // Desktop inline preview — auto-fit to its container width.
  const previewRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = previewRef.current;
    const wrap = previewWrapRef.current;
    if (!container || !wrap) return;
    const run = () => fitPage(container, wrap, 1);
    run();
    const ro = new ResizeObserver(run);
    ro.observe(container);
    const page = wrap.querySelector(".page") as HTMLElement | null;
    if (page) ro.observe(page);
    const t = setTimeout(run, 400);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [content]);

  // Full-screen viewer — fit-to-width × zoom, so users can zoom in to read.
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!viewerOpen) return;
    const container = viewerRef.current;
    const wrap = viewerWrapRef.current;
    if (!container || !wrap) return;
    const run = () => fitPage(container, wrap, zoom);
    run();
    const ro = new ResizeObserver(run);
    ro.observe(container);
    const t = setTimeout(run, 250);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [viewerOpen, zoom, content]);

  // Lock body scroll + Escape-to-close while the viewer is open.
  useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setViewerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [viewerOpen]);

  const openViewer = () => { setZoom(1); setViewerOpen(true); };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(FULL_PAGE_HTML(content, titleFA));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const container = document.createElement("div");
      container.innerHTML = FULL_PAGE_HTML(content, titleFA);
      document.body.appendChild(container);

      const pageEl = container.querySelector(".page") as HTMLElement;
      if (!pageEl) {
        document.body.removeChild(container);
        setDownloading(false);
        return;
      }

      const watermarkDataUrl = createWatermarkImage();

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${titleFA}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            width: 794,
            windowWidth: 794,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] } as any,
        } as any)
        .from(pageEl)
        .toPdf();

      const pdf = await worker.get("pdf");
      const totalPages = pdf.internal.getNumberOfPages();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const wmWidth = 160;
      const wmHeight = 54;

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.addImage(
          watermarkDataUrl,
          "PNG",
          (pageWidth - wmWidth) / 2,
          (pageHeight - wmHeight) / 2,
          wmWidth,
          wmHeight,
        );
      }

      pdf.save(`${titleFA}.pdf`);
      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: FORM_STYLES }} />

      {/* Action Bar — mobile-first: full-width stacked buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex flex-1 items-center justify-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-5 py-3.5 sm:py-3 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {downloading
            ? (isRTL ? "در حال ساخت PDF..." : "Generating PDF...")
            : (isRTL ? "دانلود PDF" : "Download PDF")}
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex flex-1 items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-900 border border-gray-200 px-5 py-3.5 sm:py-3 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          <Printer className="w-5 h-5" />
          {isRTL ? "چاپ" : "Print"}
        </button>
      </div>

      {/* Mobile / tablet: tappable preview card → opens full-screen viewer.
          A full A4 shrunk into a phone is unreadable, so we don't render it
          inline here; the viewer shows it at a readable, zoomable size. */}
      <button
        onClick={openViewer}
        className="lg:hidden w-full flex flex-col items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-9 px-6 transition-colors cursor-pointer text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
          <FileText className="w-7 h-7 text-primary-700" />
        </div>
        <span className="font-bold text-primary-900">
          {isRTL ? "مشاهده سند" : "View Document"}
        </span>
        <span className="text-sm text-gray-500 max-w-xs leading-relaxed">
          {isRTL
            ? "برای دیدن نمونه در اندازه‌ی خوانا و بزرگ‌نمایی، لمس کنید"
            : "Tap to open the template at a readable size with zoom"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-primary-700 text-sm font-semibold mt-1">
          <Maximize2 className="w-4 h-4" />
          {isRTL ? "نمای تمام‌صفحه" : "Full screen"}
        </span>
      </button>

      {/* Desktop: inline A4 preview, auto-fit to the column width. */}
      <div
        ref={previewRef}
        className="hidden lg:block bg-[#e9eaee] rounded-2xl border border-gray-200 shadow-lg overflow-hidden p-6"
      >
        <div ref={previewWrapRef} className="mx-auto" style={{ overflow: "hidden" }}>
          <div dangerouslySetInnerHTML={{ __html: content }} style={DocStyle} />
        </div>
      </div>

      {/* Full-screen viewer overlay */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-white flex flex-col"
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
        >
          {/* Top bar */}
          <div className="shrink-0 flex items-center gap-2 px-3 sm:px-5 h-14 border-b border-gray-200 bg-white">
            <button
              onClick={() => setViewerOpen(false)}
              className="w-10 h-10 -ms-1 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label={isRTL ? "بستن" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
            <span className="flex-1 font-bold text-primary-900 text-sm sm:text-base truncate">
              {titleFA}
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40"
              disabled={zoom <= 1}
              aria-label={isRTL ? "کوچک‌نمایی" : "Zoom out"}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="w-12 text-center text-sm text-gray-500 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40"
              disabled={zoom >= 3}
              aria-label={isRTL ? "بزرگ‌نمایی" : "Zoom in"}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="hidden sm:inline-flex items-center gap-2 ms-2 bg-primary-900 hover:bg-primary-800 text-white px-4 h-10 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isRTL ? "دانلود" : "Download"}
            </button>
          </div>

          {/* Scrollable document area */}
          <div ref={viewerRef} className="flex-1 overflow-auto bg-[#e9eaee] p-3 sm:p-6">
            <div ref={viewerWrapRef} className="mx-auto" style={{ overflow: "hidden" }}>
              <div dangerouslySetInnerHTML={{ __html: content }} style={DocStyle} />
            </div>
          </div>

          {/* Mobile bottom action */}
          <div className="shrink-0 sm:hidden border-t border-gray-200 p-3 bg-white">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-900 hover:bg-primary-800 text-white py-3.5 rounded-xl font-semibold cursor-pointer disabled:opacity-60"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isRTL ? "دانلود PDF" : "Download PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { JUDICIARY_LOGO };
