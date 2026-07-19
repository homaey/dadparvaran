import { createHash } from "node:crypto";
import { z } from "zod";
import { callAi } from "@/lib/ai-provider";
import { getPrompt } from "@/modules/ai-prompts/registry";
import type { LegalSourceContext } from "@/modules/article-engine/legal-sources";

const finding = z.object({
  severity: z.enum(["critical", "major", "minor"]),
  blockKey: z.string(),
  issue: z.string(),
  recommendation: z.string(),
});

export const legalReviewSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string(),
  findings: z.array(finding),
  missingWarnings: z.array(z.string()),
});

export const seoReviewSchema = z.object({
  score: z.number().int().min(0).max(100),
  readabilityScore: z.number().int().min(0).max(100),
  summary: z.string(),
  findings: z.array(finding),
  metaDescription: z.string().max(170),
});

export type ReviewArticle = {
  title: string;
  keyword: string;
  audience: string;
  legalCategory: string;
  blocks: Array<{ key: string; label: string; content: string }>;
  legalSources?: LegalSourceContext[];
};

export function contentSignature(article: ReviewArticle) {
  return createHash("sha256").update(JSON.stringify(article)).digest("hex");
}

const findingJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["severity", "blockKey", "issue", "recommendation"],
  properties: {
    severity: { type: "string", enum: ["critical", "major", "minor"] },
    blockKey: { type: "string" },
    issue: { type: "string" },
    recommendation: { type: "string" },
  },
};

export async function runLegalReviewer(article: ReviewArticle) {
  const sysPrompt = await getPrompt("sys_legal_review");
  const prompt = `${sysPrompt}\n${JSON.stringify(article)}`;

  const text = await callAi({
    prompt,
    jsonSchema: {
      name: "iranian_legal_quality_review",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["score", "summary", "findings", "missingWarnings"],
        properties: {
          score: { type: "integer", minimum: 0, maximum: 100 },
          summary: { type: "string" },
          findings: { type: "array", items: findingJsonSchema },
          missingWarnings: { type: "array", items: { type: "string" } },
        },
      },
    },
    maxTokens: 4096,
  });

  return legalReviewSchema.parse(JSON.parse(text));
}

export async function runSeoReviewer(article: ReviewArticle) {
  const sysPrompt = await getPrompt("sys_seo_review");
  const prompt = `${sysPrompt}\nکلیدواژه هدف: ${article.keyword}\n${JSON.stringify(article)}`;

  const text = await callAi({
    prompt,
    jsonSchema: {
      name: "persian_seo_quality_review",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["score", "readabilityScore", "summary", "findings", "metaDescription"],
        properties: {
          score: { type: "integer", minimum: 0, maximum: 100 },
          readabilityScore: { type: "integer", minimum: 0, maximum: 100 },
          summary: { type: "string" },
          findings: { type: "array", items: findingJsonSchema },
          metaDescription: { type: "string", maxLength: 170 },
        },
      },
    },
    maxTokens: 4096,
  });

  return seoReviewSchema.parse(JSON.parse(text));
}
