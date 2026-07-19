import { NextResponse } from "next/server";
import { z } from "zod";
import { ArticleType } from "@/lib/content-enums";
import { Roles } from "@/lib/roles";
import { authorize } from "@/lib/api";
import { getCategoryPrompt } from "@/modules/article-engine/category-prompts";
import { generateWholeArticle } from "@/modules/article-engine/ai";
import { generateImageGuidance } from "@/modules/article-engine/image-guidance";
import { loadRelevantLegalSources } from "@/modules/article-engine/legal-sources";
import { getTemplate, templateForArticleType } from "@/modules/article-engine/templates";

const schema = z.object({
  topic: z.string().trim().min(5).max(250),
  articleType: z.nativeEnum(ArticleType),
  legalCategory: z.string().trim().min(2).max(100).default("GENERAL"),
  audience: z.string().trim().min(2).max(200).default("کاربران فارسی‌زبان سایت"),
});

export async function POST(req: Request) {
  const auth = await authorize([Roles.ADMIN, Roles.LAWYER, Roles.CONTENT_CREATOR]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "اطلاعات موضوع کامل نیست" },
      { status: 400 },
    );

  const { topic, articleType, legalCategory, audience } = parsed.data;
  try {
    const templateKey = templateForArticleType(articleType);
    const definitions = getTemplate(templateKey);
    const [categoryGuidance, legalSources] = await Promise.all([
      getCategoryPrompt(articleType),
      loadRelevantLegalSources(topic, topic),
    ]);
    const context = {
      title: topic,
      articleType,
      legalCategory,
      audience,
      goal: "تولید یک مقاله حقوقی دقیق، کاربردی و آماده ویرایش",
      keyword: topic,
      planTitle: "مقاله مستقل ساخته‌شده با هوش مصنوعی",
      categoryGuidance,
      legalSources,
    };
    const generated = await generateWholeArticle(context, definitions);
    const blocks = definitions.map((definition, position) => ({
      key: definition.key,
      label: definition.label,
      position,
      content: generated.get(definition.key) ?? "",
      humanOnly: Boolean(definition.humanOnly),
    }));

    let media: { image_description: string; alt_text: string } | undefined;
    try {
      const guidance = await generateImageGuidance(
        context,
        blocks.map((block) => ({ label: block.label, content: block.content })),
      );
      media = { image_description: guidance.description, alt_text: guidance.altText };
    } catch (error) {
      console.error("Standalone AI image guidance failed", error);
    }

    const firstContent = blocks.find((block) => block.content)?.content ?? topic;
    return NextResponse.json({
      metadata: { title: topic, article_type: articleType, template: templateKey },
      content: { blocks },
      seo: { meta_description: firstContent.slice(0, 160) },
      media,
    });
  } catch (error) {
    console.error("Standalone AI article generation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ساخت مقاله با هوش مصنوعی ناموفق بود" },
      { status: 502 },
    );
  }
}
