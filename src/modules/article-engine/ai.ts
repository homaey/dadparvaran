import { callAi } from "@/lib/ai-provider";
import { getPrompt } from "@/modules/ai-prompts/registry";
import type { BlockDefinition } from "./templates";
import { formatLegalSources, type LegalSourceContext } from "./legal-sources";
import { FAQ_BLOCK_KEYS, normalizeFaqContent } from "./faq";

export type ArticleContext = {
  title: string;
  articleType: string;
  legalCategory: string;
  audience: string;
  goal: string;
  keyword: string;
  planTitle: string;
  categoryGuidance?: string;
  legalSources?: LegalSourceContext[];
};

export type BlockOperation =
  | "generate"
  | "regenerate"
  | "simplify"
  | "professionalize"
  | "shorten"
  | "expand";

const operationInstructions: Record<BlockOperation, string> = {
  generate: "این بلوک را از ابتدا بنویس.",
  regenerate: "نسخه‌ای تازه و بهتر از این بلوک بنویس.",
  simplify: "متن فعلی را ساده‌تر کن ولی دقت حقوقی را حفظ کن.",
  professionalize: "لحن متن را رسمی‌تر و حرفه‌ای‌تر کن.",
  shorten: "متن را خلاصه‌تر کن و فقط نکات ضروری را نگه دار.",
  expand: "متن را با جزئیات مرتبط بیشتر گسترش بده بدون تکرار.",
};

export async function generateArticleBlock(
  context: ArticleContext,
  definition: BlockDefinition,
  operation: BlockOperation,
  currentContent = "",
) {
  if (definition.humanOnly)
    throw new Error(`بلوک «${definition.label}» را وکیل می‌نویسد و با هوش مصنوعی تولید نمی‌شود`);

  const { categoryGuidance, legalSources = [], ...contextRest } = context;

  const [basePrompt, spinePrompt, sourceStandard] = await Promise.all([
    getPrompt("sys_article_base"),
    getPrompt("sys_article_spine"),
    getPrompt("sys_source_standard"),
  ]);

  const prompt = `${basePrompt}

${spinePrompt}

${sourceStandard}
${categoryGuidance ? `\n## راهنمای این تیپ محتوا\n${categoryGuidance}` : ""}

منابع قانونی مرتبط (از بانک قوانین سایت):
${formatLegalSources(legalSources)}

فقط به منابع بالا استناد دقیق کن. اگر برای ادعایی منبع کافی وجود ندارد، شماره ماده یا مرجع را حدس نزن و [نیازمند بررسی حقوقی] بنویس.

زمینه مقاله:
- عنوان: ${contextRest.title}
- نوع مقاله: ${contextRest.articleType}
- دسته حقوقی: ${contextRest.legalCategory}
- مخاطب: ${contextRest.audience}
- هدف: ${contextRest.goal}
- کلمه کلیدی: ${contextRest.keyword}

بلوکی که باید بنویسی: ${definition.label}
راهنمای بلوک: ${definition.instruction}
عملیات: ${operationInstructions[operation]}
${currentContent ? `متن فعلی: ${currentContent}` : ""}

فقط محتوای همین بلوک را بنویس. خروجی باید متن خالص باشد بدون هیچ نشانه مارک‌داون.`;

  const text = await callAi({
    prompt,
    jsonSchema: {
      name: "article_block",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["content"],
        properties: { content: { type: "string" } },
      },
    },
  });

  const parsed = JSON.parse(text) as { content?: unknown };
  if (typeof parsed.content !== "string" || !parsed.content.trim())
    throw new Error("محتوای بلوک خالی است");

  let content = parsed.content.trim();
  content = content.replace(/[*#]/g, "");
  content = content.replace(/\n{3,}/g, "\n\n");

  if (FAQ_BLOCK_KEYS.has(definition.key)) content = normalizeFaqContent(content);

  return content;
}

/**
 * Generates the article as one coherent piece. Sections are returned only so
 * the platform can retain its internal quality, export, and rendering model.
 */
export async function generateWholeArticle(context: ArticleContext, definitions: BlockDefinition[]) {
  const writableDefinitions = definitions.filter((definition) => !definition.humanOnly);
  if (!writableDefinitions.length) throw new Error("بخشی برای تولید خودکار وجود ندارد");

  const { categoryGuidance, legalSources = [], ...contextRest } = context;
  const [basePrompt, spinePrompt, sourceStandard] = await Promise.all([
    getPrompt("sys_article_base"),
    getPrompt("sys_article_spine"),
    getPrompt("sys_source_standard"),
  ]);
  const sectionPlan = writableDefinitions
    .map((definition, index) => `${index + 1}. ${definition.label}: ${definition.instruction}`)
    .join("\n");
  const humanSections = definitions
    .filter((definition) => definition.humanOnly)
    .map((definition) => definition.label)
    .join("، ");
  const faqSections = writableDefinitions.filter((definition) => FAQ_BLOCK_KEYS.has(definition.key));

  const text = await callAi({
    prompt: `${basePrompt}

${spinePrompt}

${sourceStandard}
${categoryGuidance ? `\n## راهنمای نوع محتوا\n${categoryGuidance}` : ""}

منابع قانونی مرتبط:
${formatLegalSources(legalSources)}

یک مقاله حقوقی یکپارچه و روان تولید کن، نه مجموعه‌ای از پاسخ‌های جداگانه. جریان متن باید طبیعی باشد و بین بخش‌ها تکرار نداشته باشد.
اگر برای ادعایی منبع کافی وجود ندارد، ماده یا مرجع را حدس نزن و بنویس [نیازمند بررسی حقوقی].

زمینه مقاله:
- عنوان: ${contextRest.title}
- نوع: ${contextRest.articleType}
- دسته حقوقی: ${contextRest.legalCategory}
- مخاطب: ${contextRest.audience}
- هدف: ${contextRest.goal}
- کلیدواژه: ${contextRest.keyword}

طرح درونی مقاله (این عناوین را طبیعی در متن پوشش بده):
${sectionPlan}
${humanSections ? `\nبخش‌های «${humanSections}» باید خالی بمانند چون فقط وکیل آن‌ها را می‌نویسد.` : ""}
${faqSections.length ? `\nبرای بخش‌های پرسش‌های متداول، هر جفت را دقیقاً با این قالب متنی برگردان و برای هیچ سؤال، پاسخ را حذف نکن:\nسؤال: متن سؤال؟\nپاسخ: متن پاسخ\n\nسؤال: متن سؤال بعدی؟\nپاسخ: متن پاسخ بعدی` : ""}

خروجی را فقط به صورت JSON بده. هر بخش را در کلید خودش بگذار؛ این بخش‌بندی صرفاً برای ذخیره‌سازی داخلی است.`,
    jsonSchema: {
      name: "complete_article",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["blocks"],
        properties: {
          blocks: {
            type: "array",
            minItems: writableDefinitions.length,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["key", "content"],
              properties: {
                key: { type: "string", enum: writableDefinitions.map((definition) => definition.key) },
                content: { type: "string" },
              },
            },
          },
        },
      },
    },
  });

  const parsed = JSON.parse(text) as { blocks?: Array<{ key?: unknown; content?: unknown }> };
  const generated = new Map<string, string>();
  for (const item of parsed.blocks ?? []) {
    if (typeof item.key !== "string" || typeof item.content !== "string" || !item.content.trim()) continue;
    const cleaned = item.content.trim().replace(/[*#]/g, "").replace(/\n{3,}/g, "\n\n");
    generated.set(item.key, FAQ_BLOCK_KEYS.has(item.key) ? normalizeFaqContent(cleaned) : cleaned);
  }
  const missing = writableDefinitions.filter((definition) => !generated.has(definition.key));
  if (missing.length) throw new Error("تولید کامل مقاله ناقص است؛ دوباره تلاش کنید");
  return generated;
}
