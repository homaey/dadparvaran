import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEADLINES = {
  civil: {
    label: "آیین دادرسی مدنی",
    items: [
      {title:"رفع نقص دادخواست بدوی", days:10, foreignDays:60, article:"ماده ۵۴"},
      {title:"شکایت از قرار رد دادخواست بدوی", days:10, foreignDays:60, article:"ماده ۵۴"},
      {title:"پرداخت هزینه انتشار آگهی", days:30, foreignDays:60, article:"ماده ۵۵"},
      {title:"شکایت از قرار رد دادخواست به علت عدم پرداخت هزینه آگهی", days:10, foreignDays:60, article:"ماده ۵۵"},
      {title:"صدور قرار رد دادخواست به علت نامعلوم بودن خواهان یا اقامتگاه", days:2, article:"ماده ۵۶ / تکلیف دفتر"},
      {title:"رفع نقص دادخواست پس از بررسی دادگاه", days:10, foreignDays:60, article:"ماده ۶۶"},
      {title:"شکایت از قرار رد دادخواست موضوع ماده ۶۶", days:10, foreignDays:60, article:"ماده ۶۶"},
      {title:"فاصله ابلاغ وقت تا جلسه رسیدگی", days:5, foreignDays:60, article:"ماده ۶۴", defaultMode:"minimum"},
      {title:"فاصله انتشار آگهی تا جلسه رسیدگی", days:30, foreignDays:60, article:"ماده ۷۳", defaultMode:"minimum"},
      {title:"اعاده اوراق ابلاغ توسط کارگزینی یا رئیس کارمند", days:10, article:"تبصره ۱ ماده ۶۸ / تکلیف اداری"},
      {title:"تعیین وقت رسیدگی پس از عدم تشکیل دادگاه، حداکثر", days:60, article:"تبصره ماده ۱۰۰"},
      {title:"طرح اصل دعوا پس از صدور قرار تأمین خواسته", days:10, foreignDays:60, article:"ماده ۱۱۲"},
      {title:"اعتراض به قرار تأمین خواسته", days:10, foreignDays:60, article:"ماده ۱۱۶"},
      {title:"مطالبه خسارت ناشی از اجرای قرار تأمین خواسته", days:20, foreignDays:60, article:"ماده ۱۲۰"},
      {title:"دفاع طرف مقابل در مطالبه خسارت ناشی از تأمین خواسته", days:10, foreignDays:60, article:"ماده ۱۲۰"},
      {title:"دادخواست جلب ثالث پس از جلسه اول", days:3, foreignDays:60, article:"ماده ۱۳۵"},
      {title:"دادخواست جلب ثالث در واخواهی توسط معترض‌علیه", days:3, foreignDays:60, article:"ماده ۱۳۶"},
      {title:"مهلت جرح گواه پس از استمهال", days:7, article:"تبصره ماده ۲۳۴"},
      {title:"تسلیم اصل سند موضوع ادعای جعل", days:10, foreignDays:60, article:"ماده ۲۲۰"},
      {title:"پرداخت دستمزد کارشناس", days:7, foreignDays:60, article:"ماده ۲۵۹"},
      {title:"اظهارنظر طرفین درباره نظریه کارشناس", days:7, foreignDays:60, article:"ماده ۲۶۰"},
      {title:"انشای رأی پس از اعلام ختم دادرسی", days:7, article:"ماده ۲۹۵ / تکلیف دادگاه"},
      {title:"پاک‌نویس و امضای رأی", days:5, article:"ماده ۲۹۷ / تکلیف دادگاه"},
      {title:"واخواهی از حکم غیابی", days:20, foreignDays:60, article:"ماده ۳۰۶"},
      {title:"درخواست تجدیدنظرخواهی", days:20, foreignDays:60, article:"ماده ۳۳۶"},
      {title:"اعتراض به قرار رد دادخواست تجدیدنظر به علت نقص هویت یا اقامتگاه", days:10, foreignDays:60, article:"ماده ۳۴۴"},
      {title:"رفع نقص دادخواست تجدیدنظر", days:10, foreignDays:60, article:"ماده ۳۴۵"},
      {title:"پاسخ به دادخواست تجدیدنظر", days:10, foreignDays:60, article:"ماده ۳۴۶"},
      {title:"رفع نقص بدوی در مرحله تجدیدنظر", days:10, foreignDays:60, article:"ماده ۳۵۰"},
      {title:"رفع نقص دادخواست فرجامی", days:10, foreignDays:60, article:"ماده ۳۸۳"},
      {title:"شکایت از قرار رد دادخواست فرجامی", days:20, foreignDays:60, article:"ماده ۳۸۳"},
      {title:"شکایت از قرار رد دادخواست فرجامی به علت نامعلوم بودن هویت", days:20, foreignDays:60, article:"ماده ۳۸۴"},
      {title:"پاسخ فرجام‌خوانده به دادخواست فرجامی", days:20, foreignDays:60, article:"ماده ۳۸۵"},
      {title:"تقاضای رسیدگی فرجامی از طریق دادستان کل", days:30, foreignDays:60, article:"تبصره ماده ۳۸۷"},
      {title:"رفع نقص دادخواست رسیدگی فرجامی نزد دادستان کل", days:10, foreignDays:60, article:"تبصره ماده ۳۸۸"},
      {title:"درخواست فرجام‌خواهی", days:20, foreignDays:60, article:"ماده ۳۹۷"},
      {title:"پاسخ به درخواست فرجام تبعی", days:20, foreignDays:60, article:"ماده ۴۱۳"},
      {title:"دادخواست اعتراض ثالث طاری در دادگاه دیگر", days:20, foreignDays:60, article:"ماده ۴۲۳"},
      {title:"درخواست اعاده دادرسی", days:20, foreignDays:60, article:"ماده ۴۲۷"},
      {title:"دادخواست اعاده دادرسی طاری پس از درخواست", days:3, article:"تبصره ماده ۴۳۳"},
      {title:"معرفی داور یا تراضی درباره داور ثالث", days:10, foreignDays:60, article:"ماده ۴۵۹"},
      {title:"اعلام نظر درباره داور واحد یا جانشین داور", days:10, foreignDays:60, article:"ماده ۴۶۰"},
      {title:"رد داور تعیین‌شده با قرعه", days:10, foreignDays:60, article:"ماده ۴۷۱"},
      {title:"تعیین داور جایگزین توسط دادگاه در فرض استعفا یا امتناع", days:10, article:"ماده ۴۷۴ / تکلیف دادگاه"},
      {title:"مدت داوری در صورت عدم تعیین مدت", days:90, article:"تبصره ماده ۴۸۴"},
      {title:"تصمیم داور درباره تصحیح رأی داوری", days:20, article:"ماده ۴۸۷"},
      {title:"اجرای رأی داوری پیش از درخواست اجراییه", days:20, foreignDays:60, article:"ماده ۴۸۸ و تبصره ماده ۴۹۰"},
      {title:"درخواست ابطال رأی داوری", days:20, foreignDays:60, article:"ماده ۴۹۰"},
    ],
  },
  executionCivil: {
    label: "اجرای احکام مدنی",
    items: [
      {title:"اجرای مفاد اجراییه", days:10},
      {title:"اجرای حکم غیابی پس از انجام آگهی", days:10},
      {title:"پرداخت بدهی پس از تمکن", days:30},
      {title:"تسلیم قرار تأخیر اجرای حکم", days:15},
      {title:"شکایت نسبت به صورت‌برداری اموال منقول", days:7},
      {title:"اعتراض به نظریه ارزیاب اموال منقول", days:3},
      {title:"پرداخت حق‌الزحمه ارزیاب اموال منقول", days:3},
      {title:"پرداخت اجرت حافظ اموال منقول", days:10},
      {title:"جلوگیری از انتقال ملک یا مال به محکوم‌له", days:60},
    ],
  },
  criminal: {
    label: "آیین دادرسی کیفری",
    items: [
      {title:"رجوع ذی‌نفع به دادگاه صالح پس از صدور قرار اناطه", days:30, article:"ماده ۲۱"},
      {title:"ارسال قرار اناطه بازپرس به نظر دادستان", days:3, article:"تبصره ۱ ماده ۲۱ / تکلیف مرجع"},
      {title:"درخواست تعقیب مجدد پس از صدور قرار ترک تعقیب", days:365, article:"ماده ۷۹"},
      {title:"اعتراض به قرار بایگانی پرونده", days:10, article:"ماده ۸۰"},
      {title:"حداقل مدت تعلیق تعقیب", days:180, article:"ماده ۸۱ / مدت قرار"},
      {title:"حداکثر مدت تعلیق تعقیب", days:730, article:"ماده ۸۱ / مدت قرار"},
      {title:"ترک اعتیاد در دستور تعلیق تعقیب، حداکثر", days:180, article:"بند ب ماده ۸۱"},
      {title:"ممنوعیت خروج از کشور در دستور تعلیق تعقیب، حداکثر", days:180, article:"بند ذ ماده ۸۱"},
      {title:"اعتراض به قرار تعلیق تعقیب", days:10, article:"تبصره ۲ ماده ۸۱"},
      {title:"مهلت متهم برای تحصیل گذشت شاکی یا جبران خسارت", days:60, article:"ماده ۸۲"},
      {title:"مدت میانجی‌گری کیفری، حداکثر", days:90, article:"ماده ۸۲"},
      {title:"مهلت متهم برای تعیین وکیل و تدارک دفاع در طرح شفاهی دعوا", days:3, article:"ماده ۸۶"},
      {title:"تقدیم دادخواست ضرر و زیان در رسیدگی با طرح شفاهی دعوای کیفری", days:5, article:"ماده ۸۶"},
      {title:"اعتراض شاکی به قرار رد دسترسی به اوراق پرونده", days:3, article:"تبصره ۱ ماده ۱۰۰"},
      {title:"اعتراض به قرار توقف تحقیقات به علت ناشناخته بودن مرتکب", days:10, foreignDays:30, article:"ماده ۱۰۴ و تبصره ماده ۲۷۰"},
      {title:"اعتراض به تصمیم جلوگیری از فعالیت تولیدی، خدماتی یا تجاری", days:5, article:"ماده ۱۱۴"},
      {title:"مهلت حضور متهم پس از احضار از طریق نشر آگهی", days:30, article:"ماده ۱۷۴"},
      {title:"تمدید مهلت حضور متهم با عذر اعلام‌شده، حداکثر", days:3, article:"تبصره ماده ۱۷۸"},
      {title:"اعتبار دستور منع خروج متهم پیش از دسترسی به او", days:180, article:"ماده ۱۸۸"},
      {title:"شروع تحقیق از متهم تحت نظر توسط بازپرس، حداکثر", days:1, article:"ماده ۱۸۹ / ۲۴ ساعت"},
      {title:"اعتراض متهم یا وکیل به قرار عدم دسترسی به اوراق یا اسناد پرونده", days:3, article:"ماده ۱۹۱"},
      {title:"اعتراض به اصل قرار منتهی به بازداشت یا عدم پذیرش کفیل یا وثیقه", days:10, article:"ماده ۲۲۶"},
      {title:"اعتراض به دستور اخذ وجه‌التزام، وجه‌الکفاله یا ضبط وثیقه", days:10, article:"ماده ۲۳۵"},
      {title:"واریز وجه قرار تأمین برای جلوگیری از ضبط", days:10, article:"تبصره ۱ ماده ۲۳۶"},
      {title:"اظهارنظر بازپرس درباره درخواست فک یا تبدیل قرار بازداشت", days:5, article:"ماده ۲۴۱"},
      {title:"اعتراض به رد درخواست فک یا تبدیل قرار بازداشت", days:10, article:"ماده ۲۴۱"},
      {title:"مهلت بازبینی بازداشت در جرائم موضوع بندهای الف تا ت ماده ۳۰۲", days:60, article:"ماده ۲۴۲ / دوره بازبینی"},
      {title:"مهلت بازبینی بازداشت در سایر جرائم", days:30, article:"ماده ۲۴۲ / دوره بازبینی"},
      {title:"اعتراض به ابقاء قرار تأمین یا بازداشت", days:10, article:"ماده ۲۴۲"},
      {title:"اعتراض به قرار نظارت قضایی صادره از بازپرس", days:10, article:"تبصره ۲ ماده ۲۴۷"},
      {title:"اعتراض به قرار نظارت قضایی صادره از دادگاه", days:10, article:"تبصره ۲ ماده ۲۴۷"},
      {title:"درخواست جبران خسارت بازداشت پس از رأی قطعی بی‌گناهی", days:180, article:"ماده ۲۵۷"},
      {title:"اعتراض به رد درخواست جبران خسارت بازداشت", days:20, article:"ماده ۲۵۷"},
      {title:"اظهارنظر بازپرس پس از ختم تحقیقات و اعلام کفایت", days:5, article:"ماده ۲۶۴"},
      {title:"اظهارنظر دادستان درباره قرار نهایی بازپرس", days:3, article:"ماده ۲۶۵"},
      {title:"صدور کیفرخواست پس از موافقت دادستان با جلب به دادرسی", days:2, article:"ماده ۲۶۸"},
      {title:"اعتراض به قرار منع تعقیب", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"اعتراض به قرار موقوفی تعقیب", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"اعتراض به قرار اناطه در دادسرا", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"اعتراض به قرار بازداشت موقت", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"اعتراض به قرار ابقاء تأمین", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"اعتراض به قرار تشدید تأمین", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"اعتراض متهم به قرار تأمین خواسته", days:10, foreignDays:30, article:"ماده ۲۷۰"},
      {title:"تعیین وقت رسیدگی پس از وصول پرونده به دفتر دادگاه", days:2, article:"ماده ۳۹۲ / تکلیف دفتر"},
      {title:"حداکثر مهلت دادستان برای احضار یا جلب متهم متواری در کیفری یک", days:15, article:"ماده ۳۹۴"},
      {title:"فاصله دو نوبت آگهی رسیدگی غیابی در دادگاه کیفری یک", days:10, article:"تبصره ۱ ماده ۳۹۴"},
      {title:"حداقل فاصله آخرین آگهی تا وقت دادرسی غیابی در کیفری یک", days:30, article:"تبصره ۱ ماده ۳۹۴", defaultMode:"minimum"},
      {title:"پاک‌نویس یا تایپ رأی دادگاه", days:3, article:"ماده ۳۷۸ / تکلیف دادگاه"},
      {title:"ارسال دادنامه برای ابلاغ پس از امضاء", days:3, article:"تبصره ۱ ماده ۳۸۰ / تکلیف دفتر"},
      {title:"اخطار معرفی وکیل در دادگاه کیفری یک", days:5, article:"ماده ۳۸۴ / تکلیف دفتر"},
      {title:"معرفی وکیل توسط متهم در دادگاه کیفری یک", days:10, article:"ماده ۳۸۴"},
      {title:"تسلیم ایرادها و اعتراض‌ها پس از تعیین وکیل در کیفری یک", days:10, article:"ماده ۳۸۷"},
      {title:"تمدید مهلت تسلیم ایرادها و اعتراض‌ها در کیفری یک", days:10, article:"ماده ۳۸۷"},
      {title:"تهیه گزارش مبسوط پرونده در کیفری یک", days:10, article:"ماده ۳۸۹ / تکلیف عضو دادگاه"},
      {title:"انشای رأی دادگاه کیفری یک پس از ختم رسیدگی", days:7, article:"ماده ۴۰۴"},
      {title:"واخواهی از حکم غیابی کیفری", days:20, foreignDays:60, article:"ماده ۴۰۶"},
      {title:"واخواهی از حکم غیابی پس از اطلاع در فرض عدم ابلاغ واقعی", days:20, article:"تبصره ۲ ماده ۴۰۶"},
      {title:"اعتراض به قرار رد ایراد رد دادرس", days:10, article:"ماده ۴۲۳"},
      {title:"تجدیدنظرخواهی از رأی کیفری", days:20, foreignDays:60, article:"ماده ۴۳۱"},
      {title:"فرجام‌خواهی از رأی کیفری", days:20, foreignDays:60, article:"ماده ۴۳۱"},
      {title:"رفع نقص درخواست یا دادخواست تجدیدنظر یا فرجام", days:10, article:"ماده ۴۴۰"},
      {title:"اسقاط یا استرداد تجدیدنظر برای درخواست تخفیف ماده ۴۴۲", days:20, article:"ماده ۴۴۲ / پیش از پایان مهلت تجدیدنظر"},
      {title:"حضور برای پرداخت جزای نقدی و امکان معافیت بیست درصد", days:10, article:"تبصره ۳ ماده ۵۲۹"},
      {title:"اعتراض به عملیات توقیف داده‌ها و سامانه‌های رایانه‌ای", days:10, article:"ماده ۶۸۲"},
      {title:"اعتراض به قرارهای تأمینی علیه شخص حقوقی", days:10, article:"ماده ۶۹۰"},
    ],
  },
};

const FIXED_HOLIDAYS: [number, number][] = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 12], [1, 13],
  [3, 14], [3, 15],
  [11, 22],
  [12, 29],
];

async function main() {
  console.log("Importing legal deadlines...");

  let total = 0;
  for (const [category, data] of Object.entries(DEADLINES)) {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      await db.legalDeadline.upsert({
        where: { category_title: { category, title: item.title } },
        update: {
          days: item.days,
          foreignDays: (item as any).foreignDays ?? null,
          article: (item as any).article ?? null,
          defaultMode: (item as any).defaultMode ?? null,
          orderIndex: i + 1,
          isActive: true,
        },
        create: {
          category,
          title: item.title,
          days: item.days,
          foreignDays: (item as any).foreignDays ?? null,
          article: (item as any).article ?? null,
          defaultMode: (item as any).defaultMode ?? null,
          orderIndex: i + 1,
          isActive: true,
        },
      });
      total++;
    }
    console.log(`  ${category}: ${data.items.length} items (${data.label})`);
  }
  console.log(`Total deadlines imported: ${total}`);

  console.log("\nImporting fixed Shamsi holidays (1404-1406)...");
  let holidayCount = 0;
  for (const year of [1404, 1405, 1406]) {
    for (const [m, d] of FIXED_HOLIDAYS) {
      const titles: Record<string, string> = {
        "1/1": "نوروز", "1/2": "نوروز", "1/3": "نوروز", "1/4": "نوروز",
        "1/12": "روز جمهوری اسلامی", "1/13": "سیزده‌بدر",
        "3/14": "رحلت امام خمینی", "3/15": "قیام ۱۵ خرداد",
        "11/22": "پیروزی انقلاب اسلامی",
        "12/29": "ملی شدن صنعت نفت",
      };
      await db.holiday.upsert({
        where: { jalaliYear_jalaliMonth_jalaliDay: { jalaliYear: year, jalaliMonth: m, jalaliDay: d } },
        update: {},
        create: {
          jalaliYear: year,
          jalaliMonth: m,
          jalaliDay: d,
          title: titles[`${m}/${d}`] || null,
          isFixed: true,
        },
      });
      holidayCount++;
    }
  }
  console.log(`Total holidays imported: ${holidayCount}`);

  const dbCount = await db.legalDeadline.count();
  const holidayDbCount = await db.holiday.count();
  console.log(`\nVerification — DB counts: ${dbCount} deadlines, ${holidayDbCount} holidays`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
