import { offices, primaryOffice, type Office } from "@/lib/offices";

const INSTITUTE_NAME = {
  fa: "مؤسسه حقوقی دادپروران مهر ایران",
  en: "Dadparvaraan Mehr Iran Legal Institute",
} as const;

// sameAs عمداً خالی است تا وقتی آدرس‌های واقعی پیج‌های اجتماعی از کاربر
// نرسیده، schema به پروفایل‌های ناموجود اشاره نکند (که پیش‌تر می‌کرد و
// تناقض با UI ایجاد می‌کرد چون آیکون‌های فوتر href="#" بودند).
const SAME_AS: string[] = [];

function localeText(loc: string, bilingual: { fa: string; en: string }): string {
  return loc === "fa" ? bilingual.fa : bilingual.en;
}

function officeAddress(office: Office, locale: string) {
  return {
    "@type": "PostalAddress" as const,
    streetAddress: localeText(locale, office.street),
    addressLocality: localeText(locale, office.city),
    addressRegion: localeText(locale, office.region),
    addressCountry: "IR",
  };
}

export function getLegalServiceSchema(locale: string) {
  const main = primaryOffice();
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: localeText(locale, INSTITUTE_NAME),
    description:
      locale === "fa"
        ? "ارائه خدمات حقوقی تخصصی با بیش از ۲۰ سال تجربه"
        : "Specialized legal services with over 20 years of experience",
    url: `https://www.dadparvaran.com/${locale}`,
    telephone: main.phone,
    address: officeAddress(main, locale),
    openingHours: ["Sa-We 08:00-17:00", "Th 08:00-13:00"],
    priceRange: "$$",
    sameAs: SAME_AS,
    areaServed: { "@type": "Country", name: "Iran" },
  };
}

export function getLocalBusinessSchema(locale: string) {
  const officeLabel = locale === "fa" ? "دفتر" : "Office";
  const dash = locale === "fa" ? "—" : "—";

  return offices.map((office) => ({
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `https://www.dadparvaran.com/${locale}#${office.id}`,
    name: `${officeLabel} ${localeText(locale, office.city)} ${dash} ${localeText(locale, INSTITUTE_NAME)}`,
    url: `https://www.dadparvaran.com/${locale}`,
    telephone: office.phone,
    address: officeAddress(office, locale),
    openingHours: ["Sa-We 08:00-17:00", "Th 08:00-13:00"],
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "Iran" },
    parentOrganization: {
      "@type": "Organization",
      name: localeText(locale, INSTITUTE_NAME),
    },
  }));
}

export function getPersonSchema(member: {
  name: string;
  role: string;
  description?: string;
  image?: string;
  url: string;
  barNumber?: string;
  experience?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.description,
    image: member.image,
    url: member.url,
    worksFor: {
      "@type": "LegalService",
      name: "Dadparvaraan Mehr Iran Legal Institute",
    },
    ...(member.barNumber ? { identifier: member.barNumber } : {}),
    ...(member.experience
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "Bar License",
            description: `${member.experience}+ years of legal practice`,
          },
        }
      : {}),
  };
}

export function getServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      "@type": "LegalService",
      name:
        service.locale === "fa"
          ? "مؤسسه حقوقی دادپروران مهر ایران"
          : "Dadparvaraan Mehr Iran Legal Institute",
      url: `https://www.dadparvaran.com/${service.locale}`,
    },
    areaServed: { "@type": "Country", name: "Iran" },
  };
}

export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedAt?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  const datePublished = article.publishedAt ?? article.datePublished;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished,
    dateModified: article.dateModified ?? datePublished,
    // Article rich results require an image — fall back to the site OG image.
    image: article.image ?? "https://www.dadparvaran.com/og-image.jpg",
    url: article.url,
    publisher: {
      "@type": "Organization",
      name: "Dadparvaraan Mehr Iran Legal Institute",
      logo: {
        "@type": "ImageObject",
        url: "https://www.dadparvaran.com/logo.png",
      },
    },
  };
}

export function getFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
