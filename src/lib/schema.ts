export function getLegalServiceSchema(locale: string) {
  const isFA = locale === "fa";
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: isFA ? "مؤسسه حقوقی دادپروران مهر ایران" : "Dadparvaraan Mehr Iran Legal Institute",
    description: isFA
      ? "ارائه خدمات حقوقی تخصصی با بیش از ۲۰ سال تجربه"
      : "Specialized legal services with over 20 years of experience",
    url: `https://www.dadparvaran.com/${locale}`,
    telephone: "+986191010285",
    address: {
      "@type": "PostalAddress",
      streetAddress: isFA
        ? "خیابان مطهری، سلیمان‌خاطر، کوچه مسجد، پلاک ۱۹، واحد ۸"
        : "Motahhari St., Soleimankhater, Masjed Alley, No. 19, Unit 8",
      addressLocality: isFA ? "تهران" : "Tehran",
      addressRegion: isFA ? "تهران" : "Tehran",
      addressCountry: "IR",
    },
    openingHours: ["Sa-We 08:00-17:00", "Th 08:00-13:00"],
    priceRange: "$$",
    sameAs: [
      "https://instagram.com/dadparvaran",
      "https://linkedin.com/company/dadparvaran",
    ],
    areaServed: {
      "@type": "Country",
      name: "Iran",
    },
  };
}

export function getLocalBusinessSchema(locale: string) {
  const isFA = locale === "fa";
  const branches = [
    {
      id: "tehran",
      name: isFA ? "دفتر تهران — دادپروران مهر ایران" : "Tehran Office — Dadparvaran Mehr Iran",
      street: isFA
        ? "خیابان مطهری، سلیمان‌خاطر، کوچه مسجد، پلاک ۱۹، واحد ۸"
        : "Motahhari St., Soleimankhater, Masjed Alley, No. 19, Unit 8",
      city: isFA ? "تهران" : "Tehran",
      region: isFA ? "تهران" : "Tehran",
    },
    {
      id: "ahvaz",
      name: isFA ? "دفتر اهواز — دادپروران مهر ایران" : "Ahvaz Office — Dadparvaran Mehr Iran",
      street: isFA
        ? "کیانپارس، خیابان ۱۴ غربی، فاز ۱، مجتمع برج کیانپارس، طبقه ۸، واحد ۱"
        : "Kianpars, 14th West St., Phase 1, Kianpars Tower, Floor 8, Unit 1",
      city: isFA ? "اهواز" : "Ahvaz",
      region: isFA ? "خوزستان" : "Khuzestan",
    },
    {
      id: "andimeshk",
      name: isFA ? "دفتر اندیمشک — دادپروران مهر ایران" : "Andimeshk Office — Dadparvaran Mehr Iran",
      street: isFA
        ? "خیابان پناهی، طبقه دوم، پاساژ آبادی"
        : "Panahi St., 2nd Floor, Abadi Passage",
      city: isFA ? "اندیمشک" : "Andimeshk",
      region: isFA ? "خوزستان" : "Khuzestan",
    },
  ];

  return branches.map((branch) => ({
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `https://www.dadparvaran.com/${locale}#${branch.id}`,
    name: branch.name,
    url: `https://www.dadparvaran.com/${locale}`,
    telephone: "+986191010285",
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.street,
      addressLocality: branch.city,
      addressRegion: branch.region,
      addressCountry: "IR",
    },
    openingHours: ["Sa-We 08:00-17:00", "Th 08:00-13:00"],
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "Iran" },
    parentOrganization: {
      "@type": "Organization",
      name: isFA ? "مؤسسه حقوقی دادپروران مهر ایران" : "Dadparvaraan Mehr Iran Legal Institute",
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
