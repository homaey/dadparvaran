import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFA = locale === "fa";
  return {
    title: isFA ? "تماس با ما — مؤسسه حقوقی دادپروران مهر ایران" : "Contact Us — Dadparvaran Mehr Iran Legal Institute",
    description: isFA
      ? "راه‌های ارتباط با مؤسسه حقوقی دادپروران مهر ایران؛ شماره تماس و نشانی دفاتر تهران، اهواز و اندیمشک برای مشاوره حقوقی"
      : "Get in touch with Dadparvaran Mehr Iran Legal Institute — phone and office addresses in Tehran, Ahvaz, and Andimeshk for legal consultation",
    openGraph: {
      title: isFA ? "تماس با مؤسسه دادپروران مهر ایران" : "Contact Dadparvaran Mehr Iran",
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/contact`,
      languages: { fa: "https://www.dadparvaran.com/fa/contact", en: "https://www.dadparvaran.com/en/contact" },
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
