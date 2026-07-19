import { NextResponse } from "next/server";
import { authorize } from "@/lib/api";
import { publishDraft } from "@/modules/article-export/publish";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const auth = await authorize(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { articleId } = await params;
  const id = Number(articleId);
  if (!id) return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 });

  const article = await publishDraft(id);
  return NextResponse.json(article);
}
