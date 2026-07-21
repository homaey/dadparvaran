import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const defaultCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
].join("; ");

// Bale Web Mini Apps are rendered inside a Bale iframe. These routes must not
// receive X-Frame-Options: DENY. The official docs also ask for frame-src
// https://*.bale.ai; frame-ancestors is added to explicitly restrict embedders.
const baleMiniAppCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tapi.bale.ai",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://tapi.bale.ai https:",
  "frame-src 'self' https://*.bale.ai https://ble.ir",
  "frame-ancestors https://*.bale.ai https://ble.ir",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/fa/bale/consultation",
        headers: [...securityHeaders, { key: "Content-Security-Policy", value: baleMiniAppCsp }],
      },
      {
        source: "/en/bale/consultation",
        headers: [...securityHeaders, { key: "Content-Security-Policy", value: baleMiniAppCsp }],
      },
      {
        source: "/:path((?!fa/bale/consultation|en/bale/consultation).*)",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: defaultCsp },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
