import { ArticleType, LegalCategory } from "@/lib/content-enums";
import { z } from "zod";

export const planInputSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    articleCount: z.coerce.number().int().min(1).max(60),
    goal: z.string().trim().max(2000).default("تولید محتوای حقوقی کاربردی برای جذب ترافیک ارگانیک و اعتبار حقوقی سایت"),
    targetAudience: z.string().trim().max(2000).default("شهروندان ایرانی جویای اطلاعات حقوقی"),
    legalServices: z.string().trim().max(2000).default("خدمات حقوقی جامع"),
    priorityAreas: z.string().trim().max(2000).default("تمامی حوزه‌های حقوقی"),
    teamMemberIds: z.array(z.string()).max(50).default([]),
  })
  .refine((v) => v.periodEnd > v.periodStart, {
    message: "پایان دوره باید بعد از شروع باشد",
    path: ["periodEnd"],
  });

export const generatedCalendarSchema = z.object({
  distribution: z
    .array(
      z.object({
        articleType: z.nativeEnum(ArticleType),
        percentage: z.number().int().min(0).max(100),
      }),
    )
    .min(1)
    .max(Object.values(ArticleType).length),
  items: z.array(
    z.object({
      title: z.string().min(5),
      articleType: z.nativeEnum(ArticleType),
      legalCategory: z.nativeEnum(LegalCategory),
      keyword: z.string().min(2),
      searchIntent: z.string().min(2),
      targetAudience: z.string().min(2),
      popularityScore: z.number().int().min(0).max(100),
      businessScore: z.number().int().min(0).max(100),
      seoScore: z.number().int().min(0).max(100),
      educationalScore: z.number().int().min(0).max(100),
      priorityScore: z.number().min(0).max(100),
      publicationDate: z.string(),
      assignedUserId: z.string().nullable(),
    }),
  ),
});

export type PlanInput = z.infer<typeof planInputSchema>;
