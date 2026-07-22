/**
 * محدودیت نرخِ درون‌حافظه‌ای مشترک.
 *
 * pm2 در حالت fork تک‌نمونه اجرا می‌شود، پس این شمارنده بین همه درخواست‌ها
 * مشترک است. با ری‌استارت صفر می‌شود — که برای جلوگیری از اسپم کافی است. اگر
 * روزی به cluster mode رفتیم، باید به Redis منتقل شود.
 *
 * هر «سطل» با یک namespace جدا نگه داشته می‌شود تا محدودیت فرم تماس و ثبت‌نام
 * روی هم اثر نگذارند.
 */

const buckets = new Map<string, number[]>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * آیا این کلید از سقف مجاز عبور کرده است؟ در صورت مجاز بودن، کلیک را ثبت می‌کند.
 *
 * @param namespace نام سطل (مثلاً "contact" یا "register")
 * @param key کلید محدودیت، معمولاً IP
 * @param limit حداکثر تعداد در بازه
 * @param windowMs طول بازه به میلی‌ثانیه
 */
export function isRateLimited(
  namespace: string,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucketKey = `${namespace}:${key}`;
  const recent = (buckets.get(bucketKey) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(bucketKey, recent);
    return true;
  }

  recent.push(now);
  buckets.set(bucketKey, recent);

  // پاک‌سازی تنبل تا Map بی‌نهایت رشد نکند
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return false;
}
