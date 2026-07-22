import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "b", "strong", "i", "em", "u", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "a", "span",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  span: ["class"],
  p: ["class"],
};

export function sanitizeContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}

export function stripHtml(dirty: string): string {
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} });
}

/**
 * پاک‌سازی HTML اوراق قضایی.
 *
 * برخلاف `sanitizeContent` (که برای متن مقاله است و div/table/style را حذف
 * می‌کند)، اینجا ساختار کاملِ سندِ چاپی باید حفظ شود: جدول‌ها، سلول‌ها،
 * کلاس‌ها و استایل‌های چیدمان. allowlist دقیقاً بر اساس عناصری که قالب‌های
 * واقعی استفاده می‌کنند ساخته شده و کمی فراتر رفته تا ویرایش دستی/‏AI هم چیزی
 * را از دست ندهد. امنیت از حذفِ تگ‌های اجراپذیر (script/iframe/svg/…) و همه‌ی
 * ویژگی‌های خارج از فهرست (‏onclick و … خودکار حذف می‌شوند) می‌آید؛ استایل‌ها
 * محدود نمی‌شوند تا ظاهر سند ذره‌ای تغییر نکند (CSP سایت هم style خارجی/اسکریپت
 * را می‌بندد).
 */
export function sanitizeFormContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "div", "span", "p", "br", "hr",
      "strong", "b", "em", "i", "u", "small", "sub", "sup",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tfoot", "tr", "td", "th",
      "col", "colgroup", "caption",
      "img",
    ],
    allowedAttributes: {
      "*": ["class", "style", "dir", "align", "colspan", "rowspan"],
      img: ["src", "alt", "width", "height", "class", "style"],
      col: ["span", "style", "width", "class"],
      colgroup: ["span", "style", "class"],
      td: ["colspan", "rowspan", "class", "style", "align"],
      th: ["colspan", "rowspan", "class", "style", "align", "scope"],
    },
    // استایل‌ها به‌عمد فیلترِ خاصیت‌به‌خاصیت نمی‌شوند تا چیدمان دست‌نخورده بماند.
    allowedStyles: undefined,
    // فقط منابع امن برای src؛ مسیرهای نسبی (لوگو) به‌صورت پیش‌فرض مجازند.
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https", "http", "data"] },
    allowProtocolRelative: false,
  });
}
