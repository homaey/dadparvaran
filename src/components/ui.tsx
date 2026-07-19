import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700 ${className}`}>{children}</span>;
}

export function MetricCard({ title, value, suffix = "" }: { title: string; value: number; suffix?: string }) {
  return (
    <Card>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 font-fa-display text-3xl font-bold text-navy-800">
        {new Intl.NumberFormat("fa-IR").format(value)}
        {suffix}
      </div>
    </Card>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
export const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 disabled:bg-gray-50 disabled:text-gray-400";
export const fieldLabelClass = "grid gap-1.5 text-sm font-medium text-gray-700";
export const tableClass = "w-full border-collapse overflow-hidden rounded-2xl bg-white text-sm";
export const thClass = "border-b border-gray-100 bg-gray-50 px-4 py-3 text-right font-medium text-gray-600";
export const tdClass = "border-b border-gray-100 px-4 py-3";
export const noticeClass = "rounded-lg bg-gold-50 px-4 py-3 text-sm text-gold-800";
export const errorClass = "min-h-[1.5rem] text-sm text-red-600";
