import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export type AiProvider = "openai" | "claude" | "parspack";

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
}

async function readSetting(key: string): Promise<string | null> {
  const row = await db.systemSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getAiConfig(): Promise<AiConfig> {
  const [providerVal, encryptedKey, modelVal] = await Promise.all([
    readSetting("ai_provider"),
    readSetting("ai_api_key"),
    readSetting("ai_model"),
  ]);

  const provider = (providerVal === "claude" ? "claude" : providerVal === "parspack" ? "parspack" : "openai") as AiProvider;

  let apiKey = "";
  if (encryptedKey) {
    try {
      apiKey = decrypt(encryptedKey);
    } catch {
      apiKey = "";
    }
  }

  if (!apiKey) {
    apiKey =
      provider === "claude"
        ? process.env.ANTHROPIC_API_KEY ?? ""
        : provider === "parspack"
          ? process.env.PARSPACK_API_KEY ?? ""
          : process.env.OPENAI_API_KEY ?? "";
  }

  const defaultModel = provider === "claude" ? "claude-sonnet-4-20250514" : provider === "parspack" ? "openai/gpt-4.1-mini" : "gpt-4o-mini";
  const model = modelVal || (provider === "claude" ? process.env.ANTHROPIC_MODEL : provider === "parspack" ? process.env.PARSPACK_MODEL : process.env.OPENAI_MODEL) || defaultModel;

  if (!apiKey) {
    const msgs: Record<AiProvider, string> = {
      claude: "کلید API کلود تنظیم نشده است. از تنظیمات داشبورد یا ANTHROPIC_API_KEY استفاده کنید.",
      openai: "کلید API اوپن‌ای‌آی تنظیم نشده است. از تنظیمات داشبورد یا OPENAI_API_KEY استفاده کنید.",
      parspack: "کلید API پارس‌پک تنظیم نشده است. از تنظیمات داشبورد یا PARSPACK_API_KEY استفاده کنید.",
    };
    throw new Error(msgs[provider]);
  }

  return { provider, apiKey, model };
}

interface CallAiOptions {
  prompt: string;
  jsonSchema?: { name: string; schema: object };
  maxTokens?: number;
  model?: string;
}

export async function callAi(options: CallAiOptions): Promise<string> {
  const config = await getAiConfig();

  if (options.model) {
    config.model = options.model;
    if (options.model.startsWith("claude-")) {
      config.provider = "claude";
    } else if (options.model.startsWith("openai/")) {
      config.provider = "parspack";
    } else {
      config.provider = "openai";
    }
  }

  if (config.provider === "claude") {
    return callClaude(config, options);
  }
  if (config.provider === "parspack") {
    return callParspack(config, options);
  }
  return callOpenAi(config, options);
}

async function callOpenAi(config: AiConfig, options: CallAiOptions): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    input: options.prompt,
  };

  if (options.jsonSchema) {
    body.text = {
      format: {
        type: "json_schema",
        name: options.jsonSchema.name,
        strict: true,
        schema: options.jsonSchema.schema,
      },
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`خطای OpenAI (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
  };

  const text =
    data.output_text ??
    data.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text;

  if (!text) throw new Error("پاسخ معتبری از OpenAI دریافت نشد");
  return text;
}

async function callParspack(config: AiConfig, options: CallAiOptions): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    input: options.prompt,
  };

  if (options.maxTokens) {
    body.max_output_tokens = options.maxTokens;
  }

  if (config.model.includes("gpt-5") || config.model.includes("o1") || config.model.includes("o3") || config.model.includes("o4")) {
    body.reasoning = { effort: "low" };
  }

  if (options.jsonSchema) {
    body.text = {
      format: {
        type: "json_schema",
        name: options.jsonSchema.name,
        strict: true,
        schema: options.jsonSchema.schema,
      },
    };
  }

  const response = await fetch("https://my.parspack.com/api/aistudio/api/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`خطای پارس‌پک (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
  };

  const text =
    data.output_text ??
    data.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text;

  if (!text) throw new Error("پاسخ معتبری از پارس‌پک دریافت نشد");
  return text;
}

async function callClaude(config: AiConfig, options: CallAiOptions): Promise<string> {
  const messages = [{ role: "user", content: options.prompt }];

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: options.maxTokens ?? 4096,
    messages,
  };

  if (options.jsonSchema) {
    body.tools = [
      {
        name: options.jsonSchema.name,
        description: "Return the structured result",
        input_schema: options.jsonSchema.schema,
      },
    ];
    body.tool_choice = { type: "tool", name: options.jsonSchema.name };
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`خطای Claude (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string; input?: unknown }>;
  };

  if (options.jsonSchema) {
    const toolBlock = data.content.find((c) => c.type === "tool_use");
    if (toolBlock && "input" in toolBlock) {
      return JSON.stringify(toolBlock.input);
    }
  }

  const textBlock = data.content.find((c) => c.type === "text");
  if (textBlock?.text) return textBlock.text;

  throw new Error("پاسخ معتبری از Claude دریافت نشد");
}

export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const config = await getAiConfig();
    const text = await callAi({
      prompt: "سلام. لطفاً فقط بگو: سلام",
      maxTokens: 50,
    });
    return {
      ok: true,
      message: `اتصال به ${config.provider === "claude" ? "Claude" : config.provider === "parspack" ? "پارس‌پک" : "OpenAI"} (${config.model}) موفق بود.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "خطای ناشناخته",
    };
  }
}
