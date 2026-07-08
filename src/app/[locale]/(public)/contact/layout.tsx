import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFA = locale === "fa";
  return {
    title: isFA
      ? "تماس با ما | مشاوره رایگان حقوقی | دادپروران مهر ایران"
      : "Contact Us | Free Legal Consultation | Dadparvaraan Mehr Iran",
    description: isFA
      ? "برای مشاوره رایگان حقوقی با مؤسسه دادپروران مهر ایران تماس بگیرید. تهران، خیابان ولیعصر. تلفن: ۰۲۱-۸۸۸۸۸۸۸۸"
      : "Contact Dadparvaraan Mehr Iran for free legal consultation. Tehran, Valiasr Street. Phone: +98 21 8888 8888",
    keywords: isFA
      ? ["تماس با وکیل", "مشاوره رایگان حقوقی", "وکیل تهران", "شماره وکیل"]
      : ["contact lawyer", "free legal consultation", "lawyer Tehran"],
    alternates: {
      canonical: `https://www.dadparvaran.com/${locale}/contact`,
      languages: { fa: "/fa/contact", en: "/en/contact" },
    },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
