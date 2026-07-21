import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function BaleConsultationCTA({
  locale = "fa",
  className = "",
}: {
  locale?: "fa" | "en" | string;
  className?: string;
}) {
  const href = process.env.NEXT_PUBLIC_BALE_BOT_URL || process.env.BALE_BOT_PUBLIC_URL;
  const label = locale === "en" ? "Request a consultation via Bale" : "درخواست مشاوره در بله";
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-3 font-semibold text-white transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#2AABEE]/40 ${className}`}
      aria-label={label}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
