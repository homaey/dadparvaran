export interface City {
  name: string;
  slug: string;
  isMetro?: boolean; // کلان‌شهر
}

export interface Province {
  name: string;
  slug: string;
  region: "northwest" | "north" | "northeast" | "west" | "center" | "southwest" | "south" | "southeast";
  cities: City[];
}

export const PROVINCES: Province[] = [
  // ── شمال‌غرب ──────────────────────────────────────────────────────────────
  {
    name: "تهران", slug: "tehran", region: "center",
    cities: [
      { name: "تهران", slug: "tehran-city", isMetro: true },
      { name: "کرج", slug: "karaj", isMetro: true },
      { name: "ورامین", slug: "varamin" },
      { name: "شهریار", slug: "shahriar" },
      { name: "دماوند", slug: "damavand" },
      { name: "ری", slug: "rey" },
    ],
  },
  {
    name: "البرز", slug: "alborz", region: "north",
    cities: [
      { name: "کرج", slug: "karaj-alborz", isMetro: true },
      { name: "نظرآباد", slug: "nazarabad" },
      { name: "هشتگرد", slug: "hashtgerd" },
      { name: "چهارباغ", slug: "chaharbagh" },
    ],
  },
  {
    name: "اصفهان", slug: "isfahan", region: "center",
    cities: [
      { name: "اصفهان", slug: "isfahan-city", isMetro: true },
      { name: "کاشان", slug: "kashan" },
      { name: "نجف‌آباد", slug: "najafabad" },
      { name: "خمینی‌شهر", slug: "khomeinishahr" },
      { name: "شاهین‌شهر", slug: "shahinshahr" },
      { name: "فلاورجان", slug: "falavarjan" },
    ],
  },
  {
    name: "فارس", slug: "fars", region: "south",
    cities: [
      { name: "شیراز", slug: "shiraz", isMetro: true },
      { name: "مرودشت", slug: "marvdasht" },
      { name: "جهرم", slug: "jahrom" },
      { name: "لار", slug: "lar" },
      { name: "فسا", slug: "fasa" },
      { name: "کازرون", slug: "kazerun" },
    ],
  },
  {
    name: "خراسان رضوی", slug: "razavi-khorasan", region: "northeast",
    cities: [
      { name: "مشهد", slug: "mashhad", isMetro: true },
      { name: "نیشابور", slug: "neyshabur" },
      { name: "سبزوار", slug: "sabzevar" },
      { name: "تربت حیدریه", slug: "torbat-heydariyeh" },
      { name: "قوچان", slug: "quchan" },
      { name: "کاشمر", slug: "kashmar" },
    ],
  },
  {
    name: "خوزستان", slug: "khuzestan", region: "southwest",
    cities: [
      { name: "اهواز", slug: "ahvaz", isMetro: true },
      { name: "آبادان", slug: "abadan" },
      { name: "خرمشهر", slug: "khorramshahr" },
      { name: "دزفول", slug: "dezful" },
      { name: "بهبهان", slug: "behbahan" },
      { name: "ماهشهر", slug: "mahshahr" },
    ],
  },
  {
    name: "آذربایجان شرقی", slug: "east-azerbaijan", region: "northwest",
    cities: [
      { name: "تبریز", slug: "tabriz", isMetro: true },
      { name: "مراغه", slug: "maragheh" },
      { name: "مرند", slug: "marand" },
      { name: "میانه", slug: "mianeh" },
      { name: "اهر", slug: "ahar" },
    ],
  },
  {
    name: "آذربایجان غربی", slug: "west-azerbaijan", region: "northwest",
    cities: [
      { name: "ارومیه", slug: "urmia", isMetro: true },
      { name: "خوی", slug: "khoy" },
      { name: "میاندوآب", slug: "miandoab" },
      { name: "مهاباد", slug: "mahabad" },
      { name: "بوکان", slug: "bukan" },
    ],
  },
  {
    name: "کرمانشاه", slug: "kermanshah", region: "west",
    cities: [
      { name: "کرمانشاه", slug: "kermanshah-city", isMetro: true },
      { name: "اسلام‌آباد غرب", slug: "islamabad-gharb" },
      { name: "کنگاور", slug: "kangavar" },
      { name: "سنقر", slug: "sonqor" },
    ],
  },
  {
    name: "مازندران", slug: "mazandaran", region: "north",
    cities: [
      { name: "ساری", slug: "sari" },
      { name: "آمل", slug: "amol" },
      { name: "بابل", slug: "babol" },
      { name: "قائم‌شهر", slug: "qa'emshahr" },
      { name: "نوشهر", slug: "nowshahr" },
      { name: "چالوس", slug: "chalus" },
    ],
  },
  {
    name: "گیلان", slug: "Gilan", region: "north",
    cities: [
      { name: "رشت", slug: "rasht", isMetro: true },
      { name: "انزلی", slug: "anzali" },
      { name: "لاهیجان", slug: "lahijan" },
      { name: "لنگرود", slug: "langroud" },
      { name: "رودسر", slug: "rudsar" },
    ],
  },
  {
    name: "قم", slug: "qom", region: "center",
    cities: [
      { name: "قم", slug: "qom-city", isMetro: true },
      { name: "سلفچگان", slug: "salafchegan" },
    ],
  },
  {
    name: "مرکزی", slug: "markazi", region: "center",
    cities: [
      { name: "اراک", slug: "arak" },
      { name: "ساوه", slug: "saveh" },
      { name: "خمین", slug: "khomein" },
      { name: "محلات", slug: "mahallat" },
    ],
  },
  {
    name: "قزوین", slug: "qazvin", region: "northwest",
    cities: [
      { name: "قزوین", slug: "qazvin-city" },
      { name: "تاکستان", slug: "takestan" },
      { name: "آبیک", slug: "abyek" },
    ],
  },
  {
    name: "زنجان", slug: "zanjan", region: "northwest",
    cities: [
      { name: "زنجان", slug: "zanjan-city" },
      { name: "ابهر", slug: "abhar" },
      { name: "خرمدره", slug: "khorramdarreh" },
    ],
  },
  {
    name: "همدان", slug: "hamadan", region: "west",
    cities: [
      { name: "همدان", slug: "hamadan-city" },
      { name: "ملایر", slug: "malayer" },
      { name: "نهاوند", slug: "nahavand" },
      { name: "تویسرکان", slug: "tuyserkan" },
    ],
  },
  {
    name: "لرستان", slug: "lorestan", region: "west",
    cities: [
      { name: "خرم‌آباد", slug: "khorramabad" },
      { name: "بروجرد", slug: "borujerd" },
      { name: "ازنا", slug: "azna" },
      { name: "الیگودرز", slug: "aligudarz" },
    ],
  },
  {
    name: "کردستان", slug: "kurdistan", region: "west",
    cities: [
      { name: "سنندج", slug: "sanandaj" },
      { name: "سقز", slug: "saqqez" },
      { name: "مریوان", slug: "marivan" },
      { name: "بانه", slug: "baneh" },
    ],
  },
  {
    name: "ایلام", slug: "ilam", region: "west",
    cities: [
      { name: "ایلام", slug: "ilam-city" },
      { name: "دهلران", slug: "dehloran" },
      { name: "مهران", slug: "mehran" },
    ],
  },
  {
    name: "چهارمحال و بختیاری", slug: "chaharmahal-bakhtiari", region: "southwest",
    cities: [
      { name: "شهرکرد", slug: "shahrekord" },
      { name: "بروجن", slug: "borujen" },
      { name: "فارسان", slug: "farsan" },
    ],
  },
  {
    name: "کهگیلویه و بویراحمد", slug: "kohgiluyeh-boyerahmad", region: "south",
    cities: [
      { name: "یاسوج", slug: "yasuj" },
      { name: "گچساران", slug: "gachsaran" },
      { name: "دهدشت", slug: "dehdasht" },
    ],
  },
  {
    name: "بوشهر", slug: "bushehr", region: "south",
    cities: [
      { name: "بوشهر", slug: "bushehr-city" },
      { name: "برازجان", slug: "borazjan" },
      { name: "گناوه", slug: "ganaveh" },
    ],
  },
  {
    name: "هرمزگان", slug: "hormozgan", region: "south",
    cities: [
      { name: "بندرعباس", slug: "bandar-abbas" },
      { name: "بندرلنگه", slug: "bandar-lengeh" },
      { name: "قشم", slug: "qeshm" },
      { name: "کیش", slug: "kish" },
      { name: "میناب", slug: "minab" },
    ],
  },
  {
    name: "کرمان", slug: "kerman", region: "southeast",
    cities: [
      { name: "کرمان", slug: "kerman-city" },
      { name: "رفسنجان", slug: "rafsanjan" },
      { name: "سیرجان", slug: "sirjan" },
      { name: "جیرفت", slug: "jiroft" },
      { name: "زرند", slug: "zarand" },
    ],
  },
  {
    name: "یزد", slug: "yazd", region: "center",
    cities: [
      { name: "یزد", slug: "yazd-city" },
      { name: "میبد", slug: "meybod" },
      { name: "اردکان", slug: "ardakan" },
    ],
  },
  {
    name: "سمنان", slug: "semnan", region: "northeast",
    cities: [
      { name: "سمنان", slug: "semnan-city" },
      { name: "شاهرود", slug: "shahroud" },
      { name: "دامغان", slug: "damghan" },
      { name: "گرمسار", slug: "garmsar" },
    ],
  },
  {
    name: "خراسان شمالی", slug: "north-khorasan", region: "northeast",
    cities: [
      { name: "بجنورد", slug: "bojnurd" },
      { name: "شیروان", slug: "shirvan" },
      { name: "اسفراین", slug: "esfarayen" },
    ],
  },
  {
    name: "خراسان جنوبی", slug: "south-khorasan", region: "northeast",
    cities: [
      { name: "بیرجند", slug: "birjand" },
      { name: "قاین", slug: "qa'en" },
      { name: "فردوس", slug: "ferdows" },
    ],
  },
  {
    name: "سیستان و بلوچستان", slug: "sistan-baluchestan", region: "southeast",
    cities: [
      { name: "زاهدان", slug: "zahedan" },
      { name: "چابهار", slug: "chabahar" },
      { name: "زابل", slug: "zabol" },
      { name: "ایرانشهر", slug: "iranshahr" },
    ],
  },
  {
    name: "گلستان", slug: "golestan", region: "north",
    cities: [
      { name: "گرگان", slug: "gorgan" },
      { name: "گنبد کاووس", slug: "gonbad-kavus" },
      { name: "علی‌آباد کتول", slug: "aliabad-katul" },
    ],
  },
  {
    name: "اردبیل", slug: "ardabil", region: "northwest",
    cities: [
      { name: "اردبیل", slug: "ardabil-city" },
      { name: "مشگین‌شهر", slug: "meshginshahr" },
      { name: "پارس‌آباد", slug: "parsabad" },
    ],
  },
];

export const REGION_LABELS: Record<Province["region"], string> = {
  northwest: "شمال‌غرب",
  north: "شمال",
  northeast: "شمال‌شرق",
  west: "غرب",
  center: "مرکز",
  southwest: "جنوب‌غرب",
  south: "جنوب",
  southeast: "جنوب‌شرق",
};

export const REGION_ORDER: Province["region"][] = [
  "center", "north", "northwest", "northeast",
  "west", "southwest", "south", "southeast",
];
