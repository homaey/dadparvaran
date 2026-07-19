import { callAi } from "@/lib/ai-provider";
import type { ArticleContext } from "./ai";

export interface ImageGuidance {
  description: string;
  characteristics: string[];
  altText: string;
}

export async function generateImageGuidance(
  context: ArticleContext,
  blocks: Array<{ label: string; content: string }>,
): Promise<ImageGuidance> {
  const summary = blocks
    .filter((b) => b.content)
    .map((b) => `${b.label}: ${b.content.slice(0, 300)}`)
    .join("\n")
    .slice(0, 3000);

  const prompt = `شما مدیر هنری یک وب‌سایت حقوقی ایرانی هستید. بر اساس عنوان و محتوای مقاله‌ی زیر، ویژگی‌های یک عکس شاخص (cover) مناسب برای این مقاله را توضیح بده تا کاربر بتواند عکس مناسب را پیدا و بارگذاری کند.
عنوان: ${context.title}
دسته: ${context.articleType}
کلیدواژه: ${context.keyword}
خلاصه محتوا:
${summary}

راهنما:
- description: یک پاراگراف کوتاه فارسی که فضای کلی و مفهوم عکس مناسب را توصیف کند.
- characteristics: فهرست ۴ تا ۶ ویژگی مشخص و عملی (ترکیب‌بندی، رنگ و فضا، سوژه، و آنچه باید پرهیز شود). عکس باید واقع‌گرایانه و متناسب با مخاطب ایرانی باشد، بدون متن روی تصویر و بدون نماد یا پرچم خارجی.
- altText: یک متن جایگزین (alt) فارسی کوتاه و توصیفی برای سئو.`;

  const text = await callAi({
    prompt,
    jsonSchema: {
      name: "article_image_guidance",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["description", "characteristics", "altText"],
        properties: {
          description: { type: "string" },
          characteristics: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
          altText: { type: "string" },
        },
      },
    },
    maxTokens: 1024,
  });

  const parsed = JSON.parse(text) as ImageGuidance;
  return parsed;
}
