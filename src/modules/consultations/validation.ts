import { z } from "zod";

export const consultationInputSchema = z.object({
  initData: z.string().min(20).max(8192),
  clientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  category: z.string().trim().min(2).max(80),
  subCategory: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  clientRole: z.string().trim().max(100).optional().or(z.literal("")),
  caseStage: z.string().trim().min(2).max(100),
  urgency: z.enum(["عادی", "فوری", "بسیار فوری"]),
  summary: z.string().trim().min(20).max(1000),
  acceptedTerms: z.literal(true),
  website: z.string().max(200).optional(),
});

export type ConsultationInput = z.infer<typeof consultationInputSchema>;
