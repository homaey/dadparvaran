import Script from "next/script";

/**
 * دو ردیاب موازی:
 *
 * - GA4: برای ادغام با اکوسیستم گوگل و Search Console. اسکریپت از
 *   googletagmanager.com بار می‌شود که از داخل ایران بدون VPN قابل دسترس
 *   نیست؛ برای همان کاربران Umami ثبت‌کننده‌ی اصلی است.
 * - Umami خودمیزبان روی /umami: same-origin است و برای کاربران داخل ایران
 *   هم بدون قطعی داده می‌گیرد.
 *
 * هر ردیاب فقط وقتی اسکریپتش رندر می‌شود که شناسه‌اش تنظیم شده باشد. رندر
 * فقط در پروداکشن — تا لاگ dev آلوده نشود و توسعه‌دهنده در realtime داده‌ی
 * خودش را نبیند.
 */
export default function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <>
      {gaId ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {umamiId ? (
        <Script
          id="umami-tracker"
          src="/umami/script.js"
          data-website-id={umamiId}
          strategy="afterInteractive"
          defer
        />
      ) : null}
    </>
  );
}
