export const TaskStatus = {
  PLANNED: "PLANNED",
  ASSIGNED: "ASSIGNED",
  RESEARCHING: "RESEARCHING",
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  REVISION: "REVISION",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  OVERDUE: "OVERDUE",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const NotificationType = {
  DEADLINE_REMINDER: "DEADLINE_REMINDER",
  DEADLINE_WARNING: "DEADLINE_WARNING",
  OVERDUE_ALERT: "OVERDUE_ALERT",
  TASK_ASSIGNED: "TASK_ASSIGNED",
  REVIEW_REQUESTED: "REVIEW_REQUESTED",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  TASK_APPROVED: "TASK_APPROVED",
  ARTICLE_INACTIVE: "ARTICLE_INACTIVE",
  WORKFLOW_STUCK: "WORKFLOW_STUCK",
  DAILY_SUMMARY: "DAILY_SUMMARY",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = {
  IN_APP: "IN_APP",
  TELEGRAM: "TELEGRAM",
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  READ: "READ",
  SKIPPED: "SKIPPED",
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const QualityReviewStatus = {
  AI_REVIEWED: "AI_REVIEWED",
  CHANGES_REQUIRED: "CHANGES_REQUIRED",
  HUMAN_APPROVED: "HUMAN_APPROVED",
} as const;
export type QualityReviewStatus = (typeof QualityReviewStatus)[keyof typeof QualityReviewStatus];

export const ArticleStatus = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
} as const;
export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const ContentPlanStatus = {
  DRAFT: "DRAFT",
  GENERATED: "GENERATED",
  APPROVED: "APPROVED",
} as const;
export type ContentPlanStatus = (typeof ContentPlanStatus)[keyof typeof ContentPlanStatus];

export const CalendarItemStatus = {
  PROPOSED: "PROPOSED",
  APPROVED: "APPROVED",
  CONVERTED_TO_TASK: "CONVERTED_TO_TASK",
} as const;
export type CalendarItemStatus = (typeof CalendarItemStatus)[keyof typeof CalendarItemStatus];

/**
 * تیپ محتوا فقط «ساختار و پرامپت تولید» را تعیین می‌کند. حوزه حقوقی مقاله (خانواده، املاک و…)
 * در LegalCategory نگهداری می‌شود و نباید با این محور مخلوط شود.
 *
 * این تیپ‌ها عمداً از هم جدا شده‌اند: راهنمای عمومی با راهنمای فرایندی، خبر قانون با تحلیل رأی،
 * و مقایسه با چک‌لیست، ساختار و الزامات منبع متفاوت دارند.
 */
export const ArticleType = {
  SERVICE_PAGE: "SERVICE_PAGE",
  LOCAL_SEO: "LOCAL_SEO",
  LEGAL_GUIDE: "LEGAL_GUIDE",
  LEGAL_QA: "LEGAL_QA",
  STEP_BY_STEP: "STEP_BY_STEP",
  PRACTICAL_CHECKLIST: "PRACTICAL_CHECKLIST",
  COMPARISON: "COMPARISON",
  LEGAL_UPDATE: "LEGAL_UPDATE",
  RULING_ANALYSIS: "RULING_ANALYSIS",
  CASE_STUDY: "CASE_STUDY",
  TRUST_BUILDER: "TRUST_BUILDER",
} as const;
export type ArticleType = (typeof ArticleType)[keyof typeof ArticleType];

/**
 * انواع بازنشسته‌شده و جانشینشان. هم اسکریپت مهاجرت از این می‌خواند و هم رکوردهای قدیمی که
 * از قلم افتاده باشند در زمان اجرا با همین نگاشت به قالب درست می‌رسند.
 */
export const RETIRED_ARTICLE_TYPES: Record<string, ArticleType> = {
  EDUCATIONAL: "LEGAL_GUIDE",
  LAW_ANALYSIS: "LEGAL_UPDATE",
  LEGAL_NEWS: "LEGAL_UPDATE",
  LEGAL_SAMPLE: "PRACTICAL_CHECKLIST",
  LEGAL_GLOSSARY: "LEGAL_GUIDE",
};

/** نوع مقاله را به نوع معتبر فعلی می‌رساند؛ برای رکوردهایی که پیش از تغییر تاکسونومی ساخته شده‌اند. */
export function resolveArticleType(value: string): ArticleType {
  if (value in ArticleType) return value as ArticleType;
  return RETIRED_ARTICLE_TYPES[value] ?? ArticleType.LEGAL_GUIDE;
}

export const LegalCategory = {
  FAMILY_LAW: "FAMILY_LAW",
  PROPERTY_LAW: "PROPERTY_LAW",
  CRIMINAL_LAW: "CRIMINAL_LAW",
  CONTRACT_LAW: "CONTRACT_LAW",
  FINANCIAL_CLAIMS: "FINANCIAL_CLAIMS",
  COMMERCIAL_LAW: "COMMERCIAL_LAW",
  INHERITANCE_LAW: "INHERITANCE_LAW",
  LABOR_LAW: "LABOR_LAW",
  PROCEDURE_LAW: "PROCEDURE_LAW",
  ADMINISTRATIVE_LAW: "ADMINISTRATIVE_LAW",
} as const;
export type LegalCategory = (typeof LegalCategory)[keyof typeof LegalCategory];
