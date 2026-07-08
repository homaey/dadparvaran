import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "احراز هویت لازم است" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "photo" | "license"

  if (!file) {
    return NextResponse.json({ error: "فایلی انتخاب نشده" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "حجم فایل بیش از ۵ مگابایت است" }, { status: 400 });
  }

  const allowed = type === "license" ? ALLOWED_DOC : ALLOWED_IMAGE;
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: `فرمت مجاز: ${allowed.map((t) => t.split("/")[1]).join(", ")}` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const subDir = type === "license" ? "licenses" : "photos";

  const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${subDir}/${filename}`;
  return NextResponse.json({ url });
}
