import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { testConnection } from "@/lib/ai-provider";

async function readSetting(key: string) {
  const row = await db.systemSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function writeSetting(key: string, value: string) {
  await db.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function GET() {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const [provider, encryptedKey, model] = await Promise.all([
    readSetting("ai_provider"),
    readSetting("ai_api_key"),
    readSetting("ai_model"),
  ]);

  return NextResponse.json({
    provider: provider ?? "openai",
    hasApiKey: !!encryptedKey,
    model: model ?? "",
  });
}

export async function PATCH(request: Request) {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    provider?: string;
    apiKey?: string;
    model?: string;
  };

  if (body.provider && ["openai", "claude", "parspack"].includes(body.provider)) {
    await writeSetting("ai_provider", body.provider);
  }

  if (body.apiKey) {
    const encrypted = encrypt(body.apiKey);
    await writeSetting("ai_api_key", encrypted);
  }

  if (body.model !== undefined) {
    await writeSetting("ai_model", body.model);
  }

  return NextResponse.json({ ok: true });
}

export async function POST() {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const result = await testConnection();
  return NextResponse.json(result);
}
