import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { getAllPrompts, setPrompt, getAllPromptEntries } from "@/modules/ai-prompts/registry";
import { getAllCategoryPrompts, setCategoryPrompt, DEFAULT_CATEGORY_PROMPTS } from "@/modules/article-engine/category-prompts";

export async function GET() {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { prompts: sysPrompts, entries } = await getAllPrompts();
  const { prompts: catPrompts, defaults: catDefaults } = await getAllCategoryPrompts();

  return NextResponse.json({
    sysPrompts,
    entries,
    catPrompts,
    catDefaults,
  });
}

export async function PATCH(request: Request) {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    sysPrompts?: Record<string, string>;
    catPrompts?: Record<string, string>;
  } | null;

  if (!body) return NextResponse.json({ error: "داده نامعتبر است" }, { status: 400 });

  if (body.sysPrompts) {
    for (const [key, value] of Object.entries(body.sysPrompts)) {
      if (typeof value === "string") {
        await setPrompt(key, value.trim());
      }
    }
  }

  if (body.catPrompts) {
    for (const [articleType, value] of Object.entries(body.catPrompts)) {
      if (!(articleType in DEFAULT_CATEGORY_PROMPTS)) continue;
      if (typeof value !== "string") continue;
      await setCategoryPrompt(articleType, value.trim());
    }
  }

  return NextResponse.json({ ok: true });
}
