/**
 * شماره موبایل ایرانی را به لینک wa.me تبدیل می‌کند.
 * ۰۹۱۲۳۴۵۶۷۸۹ → https://wa.me/989123456789. اگر شماره موبایل معتبر نباشد null برمی‌گرداند
 * (مثلاً خط ثابت) تا دکمه‌ی واتساپ برای آن نمایش داده نشود.
 */
export function toWhatsAppLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // ارقام فارسی/عربی را به لاتین تبدیل و هر چیز غیرعددی را حذف کن
  const digits = phone
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  let national: string | null = null;
  if (/^09\d{9}$/.test(digits)) national = digits.slice(1);        // 09xxxxxxxxx
  else if (/^989\d{9}$/.test(digits)) national = digits.slice(2);  // 989xxxxxxxxx
  else if (/^9\d{9}$/.test(digits)) national = digits;             // 9xxxxxxxxx
  return national ? `https://wa.me/98${national}` : null;
}
