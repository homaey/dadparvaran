import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Clock, ChevronLeft } from "lucide-react";
import { offices } from "@/lib/offices";
import { getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "دفاتر مؤسسه حقوقی دادپروران مهر ایران | تهران، اهواز، اندیمشک",
  description:
    "سه شعبه‌ی مؤسسه حقوقی دادپروران مهر ایران در تهران، اهواز و اندیمشک آماده‌ی ارائه خدمات وکالت و مشاوره حقوقی توسط وکلای پایه یک دادگستری. مشاوره‌ی اول رایگان.",
  alternates: {
    canonical: "https://www.dadparvaran.com/fa/offices",
  },
  openGraph: {
    title: "دفاتر مؤسسه حقوقی دادپروران مهر ایران",
    description: "سه شعبه در تهران، اهواز و اندیمشک. مشاوره اول رایگان.",
    url: "https://www.dadparvaran.com/fa/offices",
    type: "website",
  },
};

export default function OfficesHubPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "خانه", url: "https://www.dadparvaran.com/fa" },
    { name: "دفاتر ما", url: "https://www.dadparvaran.com/fa/offices" },
  ]);

  return (
    <div dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <section className="bg-gradient-to-br from-primary-950 to-primary-800 py-24 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
            شعبه‌های ما
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold font-fa mb-4">
            دفاتر مؤسسه حقوقی دادپروران مهر ایران
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed">
            سه شعبه در تهران، اهواز و اندیمشک — با تیمی از وکلای پایه یک دادگستری،
            آماده‌ی پذیرش پرونده در سراسر خوزستان و استان تهران. مشاوره‌ی اول رایگان است.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {offices.map((office) => (
              <Link
                key={office.id}
                href={`/fa/offices/${office.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-lg p-6 transition-all flex flex-col"
              >
                <h2 className="text-xl font-bold text-primary-900 font-fa mb-4 group-hover:text-primary-700 transition-colors">
                  دفتر {office.city.fa}
                </h2>
                <div className="space-y-3 text-sm flex-1 mb-5">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{office.street.fa}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="text-gray-700 font-medium" dir="ltr">
                      {office.phoneDisplay.fa}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                    <span className="text-gray-600 text-xs leading-relaxed">{office.hours.fa}</span>
                  </div>
                </div>
                <span className="inline-flex items-center justify-center gap-1.5 bg-primary-50 group-hover:bg-primary-100 text-primary-700 font-medium py-2 rounded-lg text-sm transition-colors">
                  صفحه دفتر
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
