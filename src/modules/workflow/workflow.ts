import { TaskStatus, type TaskStatus as TaskStatusValue } from "@/lib/content-enums";
import { Roles } from "@/lib/roles";

export const workflowLabels: Record<string, string> = {
  PLANNED: "برنامه‌ریزی‌شده",
  ASSIGNED: "محول‌شده",
  RESEARCHING: "در حال پژوهش",
  DRAFT: "پیش‌نویس",
  REVIEW: "بازبینی",
  REVISION: "نیازمند اصلاح",
  APPROVED: "تأییدشده",
  PUBLISHED: "منتشرشده",
  OVERDUE: "عقب‌افتاده",
};

type TransitionMap = Partial<Record<TaskStatusValue, TaskStatusValue[]>>;

// نویسنده تا مرحله «ارسال به بازبینی» پیش می‌رود؛ تأیید نهایی به عهده ادمین است.
// نقش بازبین حقوقی جداگانه از گردش کار حذف شده و ادمین جای آن را می‌گیرد.
const creatorTransitions: TransitionMap = {
  [TaskStatus.ASSIGNED]: [TaskStatus.RESEARCHING],
  [TaskStatus.RESEARCHING]: [TaskStatus.DRAFT],
  [TaskStatus.DRAFT]: [TaskStatus.REVIEW],
  [TaskStatus.REVISION]: [TaskStatus.DRAFT, TaskStatus.REVIEW],
  [TaskStatus.OVERDUE]: [TaskStatus.RESEARCHING, TaskStatus.DRAFT, TaskStatus.REVIEW],
};

const adminTransitions: TransitionMap = {
  ...creatorTransitions,
  [TaskStatus.PLANNED]: [TaskStatus.ASSIGNED],
  // ادمین نقش تأییدکننده را دارد: پیش‌نویسِ ارسال‌شده را بازبینی و تأیید می‌کند.
  [TaskStatus.REVIEW]: [TaskStatus.REVISION, TaskStatus.APPROVED],
  [TaskStatus.APPROVED]: [TaskStatus.PUBLISHED],
  [TaskStatus.OVERDUE]: [
    TaskStatus.RESEARCHING,
    TaskStatus.DRAFT,
    TaskStatus.REVIEW,
    TaskStatus.REVISION,
    TaskStatus.APPROVED,
  ],
};

export function getAllowedTransitions(role: string, from: string): TaskStatusValue[] {
  const map =
    role === Roles.ADMIN
      ? adminTransitions
      : role === Roles.CONTENT_CREATOR || role === Roles.LAWYER
        ? creatorTransitions
        : {};
  return map[from as TaskStatusValue] ?? [];
}

export function canTransition(role: string, from: string, to: string) {
  if (from === to) return false;
  return getAllowedTransitions(role, from).includes(to as TaskStatusValue);
}

export function isArticleEditableStatus(status: string) {
  return status !== TaskStatus.APPROVED && status !== TaskStatus.PUBLISHED;
}

export function calculatePriority(popularity: number, business: number, seo: number, educational: number) {
  return popularity * 0.3 + business * 0.3 + seo * 0.25 + educational * 0.15;
}
