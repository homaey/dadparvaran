/**
 * منبع واحد اطلاعات دفاتر مؤسسه.
 *
 * هر جایی که NAP (نام/آدرس/تلفن) نمایش داده یا در schema تولید می‌شود، از
 * همین ماژول می‌خواند — فوتر، صفحه تماس، schema.ts، صفحات شهر آینده.
 *
 * پیش از این، آدرس تهران در messages/fa.json و همان‌طور در schema.ts تکرار
 * شده بود، و phoneValue کد ۰۶۱ (اهواز) داشت در حالی که addressValue تهران بود.
 * این تناقض NAP از این پس با تک‌منبع بودن غیرممکن است.
 */

export type OfficeId = "tehran" | "ahvaz" | "andimeshk";

type Bilingual = { fa: string; en: string };

export type Office = {
  id: OfficeId;
  city: Bilingual;
  region: Bilingual;
  street: Bilingual;
  /** E.164 برای tel: و schema. */
  phone: string;
  /** نمایش برای انسان — طبق قرارداد کد ملی/محلی. */
  phoneDisplay: Bilingual;
  /**
   * شماره موبایل برای واتساپ. اگر تعریف نشد، دکمه واتساپ رندر نمی‌شود.
   * از toWhatsAppLink در src/lib/whatsapp.ts استفاده کنید تا فرمت خودکار اعتبار
   * موبایل را بسنجد و روی خط ثابت null بدهد.
   */
  whatsapp?: string;
  hours: Bilingual;
  /**
   * لینک مستقیم به گوگل مپس/نشان/بلد. iframe نگذاریم — سنگین و ضد پرفورمنس.
   * اگر برای شعبه‌ای نداشتیم، دکمه «مسیریابی» رندر نشود.
   */
  mapUrl?: string;
};

// فعلاً هر سه شعبه یک شماره‌ی خط ثابت مرکزی دارند (تصمیم کاربر). ساختار
// بالا اجازه می‌دهد وقتی هر شعبه شماره‌ی خودش را داشت، فقط این فایل عوض شود.
const CENTRAL_PHONE = "+986191010285";
const CENTRAL_PHONE_DISPLAY: Bilingual = {
  fa: "۰۶۱-۹۱۰۱۰۲۸۵",
  en: "+98 61 9101 0285",
};
const STANDARD_HOURS: Bilingual = {
  fa: "شنبه تا چهارشنبه: ۸ تا ۱۷ | پنجشنبه: ۸ تا ۱۳",
  en: "Sat–Wed 8:00–17:00 · Thu 8:00–13:00",
};

export const offices: Office[] = [
  {
    id: "tehran",
    city: { fa: "تهران", en: "Tehran" },
    region: { fa: "تهران", en: "Tehran" },
    street: {
      fa: "خیابان مطهری، سلیمان‌خاطر، کوچه مسجد، پلاک ۱۹، واحد ۸",
      en: "Motahhari St., Soleimankhater, Masjed Alley, No. 19, Unit 8",
    },
    phone: CENTRAL_PHONE,
    phoneDisplay: CENTRAL_PHONE_DISPLAY,
    hours: STANDARD_HOURS,
  },
  {
    id: "ahvaz",
    city: { fa: "اهواز", en: "Ahvaz" },
    region: { fa: "خوزستان", en: "Khuzestan" },
    street: {
      fa: "کیانپارس، خیابان ۱۴ غربی، فاز ۱، مجتمع برج کیانپارس، طبقه ۸، واحد ۱",
      en: "Kianpars, 14th West St., Phase 1, Kianpars Tower, Floor 8, Unit 1",
    },
    phone: CENTRAL_PHONE,
    phoneDisplay: CENTRAL_PHONE_DISPLAY,
    hours: STANDARD_HOURS,
  },
  {
    id: "andimeshk",
    city: { fa: "اندیمشک", en: "Andimeshk" },
    region: { fa: "خوزستان", en: "Khuzestan" },
    street: {
      fa: "خیابان پناهی، طبقه دوم، پاساژ آبادی",
      en: "Panahi St., 2nd Floor, Abadi Passage",
    },
    phone: CENTRAL_PHONE,
    phoneDisplay: CENTRAL_PHONE_DISPLAY,
    hours: STANDARD_HOURS,
  },
];

/** دفتر مرجع — منبع تلفن هدر و متادیتای پیش‌فرض. */
export function primaryOffice(): Office {
  return offices[0];
}

export function findOffice(id: OfficeId): Office | undefined {
  return offices.find((o) => o.id === id);
}
