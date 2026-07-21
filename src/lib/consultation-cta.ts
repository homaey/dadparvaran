/**
 * Central source of truth for the "Request a consultation" CTA on the site.
 *
 * User decision (2026-07-21):
 *   Every "request a consultation" or "review my case" button, wherever it
 *   sits on the site, must route to the Bale group intake — NOT to the
 *   legacy /fa/contact form. Direct phone and WhatsApp buttons (talking to
 *   an office / a specific lawyer) stay unchanged and live alongside this.
 *
 * The bot URL is read from NEXT_PUBLIC_BALE_BOT_URL so it inlines into
 * client bundles. If the env var is unset (e.g. running locally before the
 * bot is provisioned), the helper falls back to the legacy contact form —
 * so the site is never left with dead CTAs.
 *
 * Because NEXT_PUBLIC_* is read at build time, the app must be rebuilt on
 * production after the env value changes for the client-side value to update.
 */

const RAW_BALE_URL = process.env.NEXT_PUBLIC_BALE_BOT_URL?.trim();

export const BALE_BOT_URL: string | null =
  RAW_BALE_URL && RAW_BALE_URL.length > 0 ? RAW_BALE_URL : null;

/**
 * href for the primary "request consultation" button.
 * Bale bot when configured, otherwise the site's contact page in the same locale.
 */
export function consultationHref(locale: string): string {
  if (BALE_BOT_URL) return BALE_BOT_URL;
  return `/${locale === "en" ? "en" : "fa"}/contact`;
}

/**
 * Extra `<a>` attributes: only set target/rel when the destination is Bale,
 * so an internal contact-page fallback doesn't open in a new tab.
 */
export function consultationLinkProps(): { target?: string; rel?: string } {
  if (!BALE_BOT_URL) return {};
  return { target: "_blank", rel: "noopener noreferrer" };
}

/**
 * Whether the site is currently routing consultations through Bale.
 * Callers may switch label / icon based on this.
 */
export function isBaleConsultation(): boolean {
  return BALE_BOT_URL !== null;
}
