import { z } from "zod";

export const exportSchema = z.object({
  schema_version: z.literal("1.0"),
  article_id: z.number().int(),
  exported_at: z.string(),
  metadata: z.object({ title: z.string(), slug: z.string(), category: z.string(), article_type: z.string(), service: z.string(), keywords: z.array(z.string()) }),
  content: z.object({ blocks: z.array(z.object({ key: z.string(), label: z.string(), position: z.number().int(), content: z.string() })) }),
  seo: z.object({ meta_title: z.string(), meta_description: z.string() }),
  media: z.object({ image_description: z.string(), image_prompt: z.string(), alt_text: z.string() }),
});

export type ArticleExport = z.infer<typeof exportSchema>;
export function createPersianSlug(value: string) { return value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 180) }
