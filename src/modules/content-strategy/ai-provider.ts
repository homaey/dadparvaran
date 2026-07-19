import jalaali from "jalaali-js";
import { callAi } from "@/lib/ai-provider";
import { ArticleType, LegalCategory } from "@/lib/content-enums";
import { generatedCalendarSchema, type PlanInput } from "./schema";
import {
  articleTypeDescriptions,
  articleTypeLabels,
  articleTypeRole,
  articleTypeRoleLabels,
  legalCategoryLabels,
  legalCategorySubtopics,
} from "./constants";
import { classifyArticleType } from "./article-type-classifier";
import { currentServiceCoverage, formatServiceCoverage } from "./service-coverage";
import { getPrompt } from "@/modules/ai-prompts/registry";
import { calculatePriority } from "@/modules/workflow/workflow";

type Member = { id: string; name: string; role: string };
type PublishedSummary = { title: string; category: string | null; publishedAt: string };

const ARTICLE_TYPES = Object.values(ArticleType);
const LEGAL_CATEGORIES = Object.values(LegalCategory);

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function jalaliSeason(jm: number): string {
  if (jm >= 1 && jm <= 3) return "بهار";
  if (jm >= 4 && jm <= 6) return "تابستان";
  if (jm >= 7 && jm <= 9) return "پاییز";
  return "زمستان";
}

/** بازهٔ میلادی را به توصیف شمسی خوانا (ماه/سال/فصل) تبدیل می‌کند تا AI مناسبت‌های زمانی را لحاظ کند. */
/**
 * تاریخ میلادی به شکل YYYY-MM-DD.
 *
 * پرامپت بازه را شمسی توصیف می‌کند ولی خروجی را میلادی می‌خواهد. تا وقتی هر دو عدد را
 * صریح ندهیم، مدل باید خودش تبدیل کند — و می‌کند، غلط: مرداد را May می‌گیرد و دو سوم
 * تاریخ‌ها بیرون بازه می‌افتند.
 */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function describeJalaliPeriod(start: Date, end: Date): string {
  const s = jalaali.toJalaali(start.getFullYear(), start.getMonth() + 1, start.getDate());
  const e = jalaali.toJalaali(end.getFullYear(), end.getMonth() + 1, end.getDate());
  const startLabel = `${JALALI_MONTHS[s.jm - 1]} ${s.jy}`;
  const endLabel = `${JALALI_MONTHS[e.jm - 1]} ${e.jy}`;
  const seasons = Array.from(new Set([jalaliSeason(s.jm), jalaliSeason(e.jm)])).join(" و ");
  return startLabel === endLabel
    ? `${startLabel} (فصل ${seasons})`
    : `از ${startLabel} تا ${endLabel} (فصل ${seasons})`;
}

function buildTypesDescription(): string {
  return ARTICLE_TYPES.map(
    (t) => `- ${t}: ${articleTypeLabels[t] || t} — ${articleTypeDescriptions[t]} نقش: ${articleTypeRoleLabels[articleTypeRole[t]] ?? "—"}`,
  ).join("\n");
}

function typesForRole(role: "traffic" | "conversion" | "authority"): string {
  return ARTICLE_TYPES.filter((type) => articleTypeRole[type] === role).join("، ");
}

function calculateDistribution(items: Array<{ articleType: string }>) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.articleType, (counts.get(item.articleType) ?? 0) + 1);
  const rows = ARTICLE_TYPES.filter((type) => counts.has(type)).map((articleType) => {
    const exact = ((counts.get(articleType) ?? 0) * 100) / items.length;
    return { articleType, percentage: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  let remainder = 100 - rows.reduce((sum, row) => sum + row.percentage, 0);
  for (const row of [...rows].sort((a, b) => b.fraction - a.fraction)) {
    if (!remainder) break;
    row.percentage += 1;
    remainder -= 1;
  }
  return rows.map(({ articleType, percentage }) => ({ articleType, percentage }));
}

function buildCategoriesDescription(): string {
  return LEGAL_CATEGORIES.map((c) => {
    const subs = legalCategorySubtopics[c];
    return `- ${c} (${legalCategoryLabels[c] || c}): ${subs ? subs.join("، ") : ""}`;
  }).join("\n");
}

export async function generateIranianCalendar(
  input: PlanInput,
  members: Member[],
  publishedArticles: PublishedSummary[],
  modelOverride?: string,
) {
  const calendarBasePrompt = await getPrompt("sys_calendar");
  const publishedContext = publishedArticles.length > 0
    ? `### آرشیو محتوای منتشرشده (${publishedArticles.length} مقالهٔ اخیر)
${publishedArticles.map((a) => `- ${a.title} (${a.category || "بدون دسته"}، ${a.publishedAt})`).join("\n")}

قاعدهٔ آرشیو: هیچ عنوان جدیدی نباید همان نیت جست‌وجوی موارد بالا را تکرار کند. به‌جای تکرار، یا زاویهٔ تازه بگیر (عمیق‌تر، به‌روزتر برای سال ${jalaali.toJalaali(input.periodStart.getFullYear(), input.periodStart.getMonth() + 1, input.periodStart.getDate()).jy}، یا تخصصی‌تر) یا زیرموضوعِ پوشش‌داده‌نشده را هدف بگیر.`
    : `### آرشیو محتوا
هنوز مقاله‌ای منتشر نشده است؛ این نخستین تقویم است. مقالات ستون (pillar) و پرجست‌وجوی هر حوزهٔ اولویت‌دار را در صدر بگذار تا پایهٔ اعتبار موضوعی سایت ساخته شود.`;

  const period = describeJalaliPeriod(input.periodStart, input.periodEnd);

  const prompt = `${calendarBasePrompt}

## نقش
مدیر ارشد استراتژی محتوا و سئوی حقوقی یک وب‌سایت تخصصی حقوقی در ایران، با تجربه عملی وکالت و تسلط بر رفتار جست‌وجوی فارسی‌زبانان و اصول E-E-A-T. محتوای حقوقی YMYL است؛ دقت و کاربردی‌بودن بر هر چیز مقدم است.

## بریفِ این تقویم
- هدف: ${input.goal}
- مخاطب هدف: ${input.targetAudience}
- خدمات حقوقی مجموعه: ${input.legalServices}
- حوزه‌های اولویت‌دار: ${input.priorityAreas}
- بازهٔ انتشار: ${period}
- همین بازه به میلادی: از ${isoDay(input.periodStart)} تا ${isoDay(input.periodEnd)}. تاریخ‌ها را از روی این دو عدد بده و خودت شمسی را به میلادی تبدیل نکن.
- تعداد مقاله: دقیقاً ${input.articleCount}

## روش کار (ذهنی طی کن)
۱. شکاف: آرشیو منتشرشده را با ۱۰ دسته و زیرموضوعات تطبیق بده و حوزه‌های خالی را هدف بگیر، به‌ویژه در حوزه‌های اولویت‌دار.
۲. تقاضا: بر پایه رفتار واقعی جست‌وجوی کاربران ایرانی بسنج کدام مسائل پرتکرار یا فوری‌اند (چک برگشتی، مهریه، طلاق، خلع ید، انحصار وراثت، مطالبه وجه).
۳. تناسب زمانی با بازه «${period}» (مالیات در اسفند/فروردین، حضانت و مدرسه در مهر، اجاره‌بها در تابستان).
۴. تعادل ستون (pillar) پرجست‌وجو و بلنددُم (long-tail) کم‌رقابت.

## انواع محتوا (${ARTICLE_TYPES.length} تیپ) و نقششان در قیف
${buildTypesDescription()}

## قاعده قطعی تشخیص نوع از روی عنوان
نوع محتوا، پرامپت و بلوک‌های مقاله را تعیین می‌کند؛ legalCategory فقط حوزه حقوقی موضوع است. هر عنوان دقیقاً یک نوع دارد. با این اولویت تصمیم بگیر:
۱. روش کار دفتر/معیار انتخاب وکیل → TRUST_BUILDER
۲. خدمت حقوقی همراه شهر یا منطقه → LOCAL_SEO؛ خدمت بدون مکان → SERVICE_PAGE
۳. تحلیل رأی یا دادنامه مشخص → RULING_ANALYSIS؛ روایت پرونده واقعیِ دارای داده → CASE_STUDY
۴. تغییر رسمی قانون/اصلاحیه/بخشنامه و زمان اجرا → LEGAL_UPDATE
۵. تفاوت یا مقایسه چند گزینه → COMPARISON
۶. چک‌لیست/مدارک/اشتباهات/هشدارها → PRACTICAL_CHECKLIST
۷. مراحل، نحوه یا چگونگی انجام کار → STEP_BY_STEP
۸. یک سؤال مستقیم → LEGAL_QA
۹. توضیح ماندگار مفهوم، شرایط، حقوق یا آثار → LEGAL_GUIDE
عنوان را طوری بنویس که نشانه نوع در آن دیده شود. سال جاری یا واژه «جدید» به‌تنهایی مجوز LEGAL_UPDATE نیست و CASE_STUDY بدون پرونده واقعی پیشنهاد نشود.

## تعادل قیف — مهم‌ترین قاعده این تقویم
یک تقویم حقوقی که فقط مقاله آموزشی می‌سازد، ترافیک می‌آورد ولی موکل نمی‌آورد.
- تیپ‌های ورودی ارگانیک (${typesForRole("traffic")}) بیشترین بازدید را می‌آورند.
- تیپ‌های تبدیل (${typesForRole("conversion")}) بیشترین نقش را در تبدیل بازدیدکننده به موکل دارند.
- تیپ‌های اعتبار (${typesForRole("authority")}) اعتماد و E-E-A-T می‌سازند و از تیپ‌های دیگر پشتیبانی می‌کنند.
سبد را طوری بچین که هر سه نقش سهم معنادار داشته باشند. نه همه‌اش آموزشی، نه همه‌اش تبلیغاتی.

## قاعده ضدکنیبال — SERVICE_PAGE و LOCAL_SEO
صفحات خدمات زیر همین الان روی سایت هستند و کلیدواژه تجاری‌شان را گرفته‌اند:
${formatServiceCoverage(currentServiceCoverage())}

برای این دو تیپ:
- هرگز موضوعی پیشنهاد نده که کلیدواژه‌اش با یکی از صفحات بالا یکی است. اگر این کار را بکنی، سایت با صفحه خودش رقابت می‌کند و رتبه هر دو پایین می‌آید.
- فقط شکاف‌ها را هدف بگیر: دعاوی و خدماتی که هنوز صفحه ندارند (مثلاً تصرف عدوانی، اعسار، خلع ید، اعتراض ثالث، مطالبه اجرت‌المثل).
- برای LOCAL_SEO، ترکیب «خدمت + شهر» فقط وقتی پیشنهاد بده که تفاوت محلی واقعی وجود داشته باشد (مرجع قضایی متفاوت، رویه متفاوت). محتوای محلیِ قالبی که فقط اسم شهرش عوض شده، به سایت ضرر می‌زند.

## قاعده TRUST_BUILDER و CASE_STUDY
این دو تیپ را کم و هدفمند پیشنهاد بده. TRUST_BUILDER فقط برای حوزه‌ای که دفتر واقعاً خدمت می‌دهد و CASE_STUDY فقط وقتی مجاز است که بریف صریحاً از پرونده واقعی و قابل انتشار خبر دهد. سابقه، آمار، رضایت موکل یا نتیجه پرونده را حدس نزن.

## دسته‌بندی حقوقی (۱۰ دسته) و زیرموضوعات
${buildCategoriesDescription()}

## عنوان و کلیدواژه
- عنوان مشخص و پاسخ‌گو به یک نیت واحد. خوب: «نحوه وصول چک برگشتی صیادی + مراحل قانونی گام‌به‌گام». بد: «بررسی ابعاد حقوقی اسناد تجاری».
- keyword کلیدواژه کانونی و قابل‌جست‌وجوی فارسی باشد، نه جمله توصیفی بلند.
- searchIntent: اطلاعاتی، تراکنشی (جویای وکیل) یا راهبری.
- سبد را میان ۱۰ دسته پخش کن؛ روی یک دسته متمرکز نشو.

## امتیازدهی (۰ تا ۱۰۰، صادقانه و متمایز — از امتیاز یکنواخت بپرهیز)
popularityScore: حجم جست‌وجو · businessScore: احتمال تبدیل به موکل · seoScore: شانس رتبه با توجه به رقابت (کم‌رقابت‌تر = بالاتر) · educationalScore: عمق و اعتبارسازی.
امتیازها برآورد راهبردی‌اند، نه داده قطعی.

## قواعد خروجی
- دقیقاً ${input.articleCount} آیتم. نه کمتر، نه بیشتر.
- distribution فقط تیپ‌هایی را که واقعاً در آیتم‌ها استفاده شده‌اند، هرکدام یک‌بار دربر گیرد و مجموع درصدها ۱۰۰ شود. برای پرکردن سهمیه، تیپ نامتناسب نساز.
- publicationDate میلادی و به شکل YYYY-MM-DD، بین ${isoDay(input.periodStart)} و ${isoDay(input.periodEnd)}، پخش‌شده در طول دوره نه انباشته در یک روز. هیچ تاریخی بیرون این دو عدد نباشد.
- assignedUserId یکی از شناسه‌های مجاز یا null؛ بار کاری را متعادل کن.
- همه‌چیز فارسی و متناسب با نظام حقوقی ایران. legalCategory یکی از ۱۰ دسته مجاز.

${publishedContext}

## داده‌ها
اعضای مجاز (برای assignedUserId): ${JSON.stringify(members)}
انواع مجاز: ${ARTICLE_TYPES.join(", ")}
دسته‌های مجاز: ${LEGAL_CATEGORIES.join(", ")}`;

  const text = await callAi({
    prompt,
    jsonSchema: { name: "iranian_content_calendar", schema: calendarJsonSchema },
    maxTokens: 12288,
    model: modelOverride,
  });

  const parsed = generatedCalendarSchema.parse(JSON.parse(text));

  // مدل‌ها معمولاً چند مورد بیشتر می‌دهند. دور ریختن کل تقویم به‌خاطر چند آیتم اضافه اتلاف
  // است؛ کم‌اولویت‌ترین‌ها را کنار می‌گذاریم و به عدد خواسته‌شده می‌رسیم. کمبود ولی واقعاً
  // خطاست، چون یعنی مدل کار را نیمه‌کاره رها کرده.
  if (parsed.items.length < input.articleCount)
    throw new Error(
      `مدل فقط ${parsed.items.length} موضوع از ${input.articleCount} موضوع خواسته‌شده را ساخت. با تعداد کمتر یا مدل قوی‌تر دوباره تلاش کنید.`,
    );

  const scored = parsed.items.map((item) => ({
    ...item,
    // عنوان قرارداد قطعی انتخاب پرامپت است؛ خروجی مدل در صورت ناسازگاری اینجا اصلاح می‌شود.
    articleType: classifyArticleType(item.title),
    priorityScore: calculatePriority(item.popularityScore, item.businessScore, item.seoScore, item.educationalScore),
  }));

  const items =
    scored.length > input.articleCount
      ? // ترتیب تاریخ انتشار باید حفظ شود، پس فقط برای انتخاب مرتب می‌کنیم نه برای خروجی.
        (() => {
          const keep = new Set(
            [...scored].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, input.articleCount),
          );
          return scored.filter((item) => keep.has(item));
        })()
      : scored;

  if (items.some((i) => Number.isNaN(new Date(i.publicationDate).getTime())))
    throw new Error("مدل تاریخ نامعتبر برگرداند");

  // تاریخ انتشار جزئیاتی است که ادمین در بازبینی با انتخابگر شمسی عوض می‌کند. دور ریختن کل
  // تقویم به‌خاطر چند روز پرت‌بودن، همان اشتباهی است که سر تعداد آیتم‌ها کردیم. پس چند مورد
  // پرت را به بازه می‌چسبانیم.
  const outOfRange = items.filter((item) => {
    const date = new Date(item.publicationDate);
    return date < input.periodStart || date > input.periodEnd;
  });

  // ولی اگر بیشتر تاریخ‌ها بیرون‌اند، مدل خودِ بازه را نفهمیده. چسباندن همه به یک روز، تقویمی
  // بی‌معنا می‌سازد که فقط وقت ادمین را می‌گیرد؛ اینجا شکست صادقانه‌تر است.
  if (outOfRange.length > items.length / 2)
    throw new Error(
      `مدل ${outOfRange.length} تاریخ از ${items.length} را خارج از بازه داد؛ یعنی دوره را درست نفهمیده. دوباره تلاش کنید.`,
    );

  const clampedDates = outOfRange.length;
  const withDates = items.map((item) => {
    const date = new Date(item.publicationDate);
    if (date >= input.periodStart && date <= input.periodEnd) return item;
    const clamped = date < input.periodStart ? input.periodStart : input.periodEnd;
    return { ...item, publicationDate: clamped.toISOString() };
  });
  if (clampedDates)
    console.warn(`Calendar: ${clampedDates}/${withDates.length} تاریخ خارج از بازه بود و به بازه چسبانده شد`);

  return {
    ...parsed,
    items: withDates,
    distribution: calculateDistribution(withDates),
    clampedDates,
  };
}

const score = { type: "integer", minimum: 0, maximum: 100 };

const calendarJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["distribution", "items"],
  properties: {
    distribution: {
      type: "array",
      minItems: 1,
      maxItems: ARTICLE_TYPES.length,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["articleType", "percentage"],
        properties: {
          articleType: {
            type: "string",
            enum: ARTICLE_TYPES,
          },
          percentage: score,
        },
      },
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "articleType",
          "legalCategory",
          "keyword",
          "searchIntent",
          "targetAudience",
          "popularityScore",
          "businessScore",
          "seoScore",
          "educationalScore",
          "priorityScore",
          "publicationDate",
          "assignedUserId",
        ],
        properties: {
          title: { type: "string" },
          articleType: {
            type: "string",
            enum: ARTICLE_TYPES,
          },
          legalCategory: {
            type: "string",
            enum: LEGAL_CATEGORIES,
          },
          keyword: { type: "string" },
          searchIntent: { type: "string" },
          targetAudience: { type: "string" },
          popularityScore: score,
          businessScore: score,
          seoScore: score,
          educationalScore: score,
          priorityScore: { type: "number", minimum: 0, maximum: 100 },
          publicationDate: { type: "string" },
          assignedUserId: { type: ["string", "null"] },
        },
      },
    },
  },
};
