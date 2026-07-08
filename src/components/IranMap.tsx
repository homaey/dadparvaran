import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import { PROVINCES, REGION_LABELS, REGION_ORDER, type Province } from "@/data/iran-provinces";

interface Props {
  locale: string;
}

// Group provinces by region
function groupByRegion(provinces: Province[]) {
  const map = new Map<Province["region"], Province[]>();
  for (const region of REGION_ORDER) map.set(region, []);
  for (const p of provinces) map.get(p.region)?.push(p);
  return map;
}

export default function IranMap({ locale }: Props) {
  const isRTL = locale === "fa";
  const grouped = groupByRegion(PROVINCES);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="province-section-heading"
      className="py-16 bg-gradient-to-b from-white to-primary-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
            <MapPin className="h-4 w-4" />
            {isRTL ? "جستجو بر اساس منطقه" : "Search by Region"}
          </div>
          <h2
            id="province-section-heading"
            className="text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            {isRTL ? "وکیل در شهر خود بیابید" : "Find a Lawyer in Your City"}
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            {isRTL
              ? "استان و شهر موردنظر را انتخاب کنید تا وکلای آن منطقه را مشاهده کنید"
              : "Select your province and city to see available lawyers nearby"}
          </p>
        </div>

        {/* Region grid */}
        <div className="space-y-10">
          {REGION_ORDER.map((region) => {
            const provinces = grouped.get(region) ?? [];
            if (!provinces.length) return null;
            return (
              <div key={region}>
                {/* Region label */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 border border-primary-200 rounded-full px-3 py-1">
                    {REGION_LABELS[region]}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Province cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {provinces.map((province) => (
                    <div
                      key={province.slug}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all overflow-hidden group"
                    >
                      {/* Province header */}
                      <Link
                        href={`/${locale}/lawyers/${province.slug}`}
                        className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-50 group-hover:bg-primary-50 transition-colors"
                        aria-label={isRTL ? `وکلای استان ${province.name}` : `Lawyers in ${province.name}`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center shrink-0 transition-colors">
                          <MapPin className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <span className="font-bold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">
                          {province.name}
                        </span>
                        <span className="mr-auto text-xs text-gray-400">
                          {province.cities.length} شهر
                        </span>
                      </Link>

                      {/* Cities list */}
                      <ul className="px-4 py-3 flex flex-wrap gap-2">
                        {province.cities.map((city) => (
                          <li key={city.slug}>
                            <Link
                              href={`/${locale}/lawyers/${province.slug}/${city.slug}`}
                              className={`inline-flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 transition-colors ${
                                city.isMetro
                                  ? "bg-gold-50 border border-gold-200 text-gold-700 hover:bg-gold-100 font-semibold"
                                  : "bg-gray-50 border border-gray-100 text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700"
                              }`}
                            >
                              {city.isMetro && (
                                <Building2 className="w-3 h-3 shrink-0" />
                              )}
                              {city.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-gold-100 border border-gold-300" />
            {isRTL ? "کلان‌شهر" : "Metro City"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            {isRTL ? "شهر" : "City"}
          </span>
        </div>

      </div>
    </section>
  );
}
