import { z } from "zod";

const envSchema = z.object({
  BALE_BOT_TOKEN: z.string().min(10),
  BALE_API_BASE_URL: z.string().url().default("https://tapi.bale.ai"),
  BALE_LAWYERS_GROUP_CHAT_ID: z.string().min(1),
  BALE_WEBHOOK_PATH_SECRET: z.string().min(24),
  BALE_MINIAPP_URL: z.string().url(),
  BALE_BOT_PUBLIC_URL: z.string().url(),
  BALE_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(8000),
  BALE_MINIAPP_MAX_AGE_SECONDS: z.coerce.number().int().min(60).max(3600).default(600),
  BALE_MINIAPP_HMAC_MODE: z.enum(["docs", "telegram", "compatible"]).default("compatible"),
});

export type BaleConfig = z.infer<typeof envSchema>;

let cached: BaleConfig | null = null;

export function getBaleConfig(): BaleConfig {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}

export function isBaleConfigured(): boolean {
  return Boolean(
    process.env.BALE_BOT_TOKEN &&
      process.env.BALE_LAWYERS_GROUP_CHAT_ID &&
      process.env.BALE_WEBHOOK_PATH_SECRET &&
      process.env.BALE_MINIAPP_URL &&
      process.env.BALE_BOT_PUBLIC_URL
  );
}
