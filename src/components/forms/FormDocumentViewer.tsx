"use client";

import { useRef, useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";

type Props = {
  content: string;
  titleFA: string;
  isRTL: boolean;
};

const JUDICIARY_LOGO = "/judiciary-logo.png";

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

  /* Responsive scaling for screen preview */
  @media screen {
    .page {
      box-shadow: 0 4px 22px rgba(0,0,0,.18);
    }
  }

  @media screen and (max-width: 900px) {
    .page {
      transform: scale(0.6);
      transform-origin: top center;
      margin-bottom: -120mm;
    }
  }

  @media screen and (min-width: 901px) and (max-width: 1200px) {
    .page {
      transform: scale(0.82);
      transform-origin: top center;
      margin-bottom: -50mm;
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

export default function FormDocumentViewer({ content, titleFA, isRTL }: Props) {
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

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
      {/* Action Bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          {isRTL ? "چاپ" : "Print"}
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-primary-900 border border-gray-200 px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading
            ? (isRTL ? "در حال ساخت PDF..." : "Generating PDF...")
            : (isRTL ? "دانلود PDF" : "Download PDF")}
        </button>
      </div>

      {/* Document Preview */}
      <div className="bg-[#e9eaee] rounded-2xl border border-gray-200 shadow-lg overflow-auto p-4 sm:p-8">
        <style dangerouslySetInnerHTML={{ __html: FORM_STYLES }} />
        <div
          ref={docRef}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            fontFamily: '"B Nazanin","BNazanin","Nazanin","IRANSans","Vazirmatn","Estedad",Tahoma,Arial,sans-serif',
            direction: "rtl",
            fontSize: "14px",
            lineHeight: "1.75",
            color: "#111",
          }}
        />
      </div>
    </div>
  );
}

export { JUDICIARY_LOGO };
