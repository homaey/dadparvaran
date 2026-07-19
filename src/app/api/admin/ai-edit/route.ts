import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { callAi } from "@/lib/ai-provider";
import { getPrompt } from "@/modules/ai-prompts/registry";

export async function POST(request: Request) {
  const auth = await authorize(["ADMIN", "LAWYER"]);
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    content: string;
    promptKey?: string;
  } | null;

  if (!body?.content?.trim()) {
    return NextResponse.json({ error: "متنی برای ویرایش ارسال نشده" }, { status: 400 });
  }

  const systemPrompt = await getPrompt(body.promptKey || "sys_forms_edit");

  const text = await callAi({
    prompt: `${systemPrompt}\n\nمهم: محتوای زیر یک سند HTML قضایی است. فقط متن‌های داخل تگ‌ها را بهبود بده. ساختار HTML، کلاس‌ها، تگ‌ها، جدول‌ها و تعداد ستون‌ها را دقیقاً حفظ کن. خروجی باید HTML کامل باشد با همان ساختار اصلی.\n\nسند HTML:\n${body.content}`,
    maxTokens: 8192,
  });

  return NextResponse.json({ result: text });
}
