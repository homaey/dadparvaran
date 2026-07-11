import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Vazirmatn } from "next/font/google";
import { Inter, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import SessionProvider from "@/components/SessionProvider";
import { getLegalServiceSchema, getLocalBusinessSchema } from "@/lib/schema";
import "../globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });
  const isFA = locale === "fa";

  return {
    metadataBase: new URL("https://www.dadparvaran.com"),
    title: {
      default: t("title"),
      template: `%s | ${isFA ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran"}`,
    },
    description: t("description"),
    keywords: isFA
      ? ["وکیل", "وکالت", "مشاوره حقوقی", "دادخواست", "شکواییه", "اظهارنامه", "لایحه", "مؤسسه حقوقی دادپروران مهر ایران", "وکیل پایه یک"]
      : ["lawyer", "attorney", "legal counsel", "petition", "complaint", "legal notice", "brief", "law firm"],
    openGraph: {
      type: "website",
      locale: isFA ? "fa_IR" : "en_US",
      alternateLocale: isFA ? "en_US" : "fa_IR",
      url: `https://www.dadparvaran.com/${locale}`,
      siteName: isFA ? "دادپروران مهر ایران" : "Dadparvaraan Mehr Iran",
      title: t("title"),
      description: t("description"),
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}`,
      languages: {
        fa: "https://www.dadparvaran.com/fa",
        en: "https://www.dadparvaran.com/en",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
    manifest: "/manifest.json",
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fa" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const schema = getLegalServiceSchema(locale);
  const branchSchemas = getLocalBusinessSchema(locale);

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={`${vazirmatn.variable} ${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {branchSchemas.map((branch: Record<string, unknown>, i: number) => (
          <script
            key={`branch-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(branch) }}
          />
        ))}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            {children}
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
