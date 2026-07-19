import { ArticleType, type ArticleType as ArticleTypeValue } from "@/lib/content-enums";

function normalizeTitle(title: string): string {
  return title
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa");
}

const locationPattern =
  /(تهران|کرج|مشهد|اصفهان|شیراز|تبریز|قم|اهواز|رشت|ارومیه|یزد|کرمان|قزوین|همدان|ساری|گرگان|بندرعباس|اراک|سنندج|زاهدان|خرم آباد|اردبیل|بوشهر|شهرستان|استان|منطقه|محله)/;
const servicePattern = /(صفحه خدمت|خدمت تخصصی|خدمات حقوقی|^وکیل | وکیل (?:دعاوی|پرونده|متخصص|حقوقی|کیفری)|وکالت (?:دعاوی|پرونده)|مشاوره تخصصی)/;

/**
 * قاعده قطعی انتخاب پرامپت از روی عنوان. ترتیب قواعد بخشی از قرارداد است: مثلاً «رأی وحدت
 * رویه جدید» تحلیل رأی است، نه خبر عمومی؛ و «وکیل طلاق در تهران» صفحه محلی است، نه خدمت عمومی.
 */
export function classifyArticleType(title: string): ArticleTypeValue {
  const value = normalizeTitle(title);

  if (/(روش کار (?:دفتر|موسسه)|تعهدات (?:دفتر|وکیل)|چرا (?:سپردن|انتخاب) .*وکیل|معیار انتخاب وکیل|محرمانگی .*دفتر)/.test(value))
    return ArticleType.TRUST_BUILDER;
  if (servicePattern.test(value) && locationPattern.test(value)) return ArticleType.LOCAL_SEO;
  if (servicePattern.test(value)) return ArticleType.SERVICE_PAGE;
  if (/(تحلیل|بررسی|نقد|موردکاوی).*(رأی|رای|دادنامه)|(رأی|رای) (?:وحدت رویه|دادگاه|دیوان)|استدلال (?:دادگاه|قاضی)|منطوق (?:رأی|رای)/.test(value))
    return ArticleType.RULING_ANALYSIS;
  if (/(مطالعه موردی|موردکاوی.*پرونده|پرونده واقعی|روایت پرونده|تجربه پرونده|پرونده (?:های )?موفق)/.test(value))
    return ArticleType.CASE_STUDY;
  if (/(پرسش و پاسخ|پرسش های متداول|سوالات متداول|سؤالات متداول)/.test(value))
    return ArticleType.LEGAL_QA;
  if (/(مقایسه|تفاوت|فرق | در برابر | یا کدام|کدام بهتر)/.test(value)) return ArticleType.COMPARISON;
  if (/(قانون جدید|اصلاحیه|اصلاحات جدید|بخشنامه جدید|مصوبه جدید|تغییرات قانون|تغییر قانون|چه چیزی تغییر کرد|لازم الاجرا|لازم‌الاجرا|تحلیل جدید قانون)/.test(value))
    return ArticleType.LEGAL_UPDATE;
  if (/(گام به گام|گام‌به‌گام|مرحله به مرحله|مرحله‌به‌مرحله|مراحل (?:قانونی|عملی|ثبت|پیگیری)|نحوه |چگونه |چطور |راهنمای عملی (?:تنظیم|ثبت|پیگیری|اعتراض|مطالبه|وصول|اجرای|دریافت))/.test(value))
    return ArticleType.STEP_BY_STEP;
  if (/(چک لیست|چک‌لیست|مدارک لازم|اسناد لازم|اشتباهات رایج|خطاهای رایج|نکات کلیدی|نکات مهم|نکات حقوقی|پیش از امضا|قبل از امضا)/.test(value))
    return ArticleType.PRACTICAL_CHECKLIST;
  if (/[؟?]$/.test(value) || /(^| )(آیا|چیست|کیست|چرا|چه زمانی|چه موقع|چقدر|تا چه حد|پرسش و پاسخ|پرسش های متداول|پرسش‌های متداول|سوالات متداول|سؤالات متداول)( |$)/.test(value))
    return ArticleType.LEGAL_QA;

  return ArticleType.LEGAL_GUIDE;
}

export function articleTypeMatchesTitle(title: string, articleType: string): boolean {
  return classifyArticleType(title) === articleType;
}
