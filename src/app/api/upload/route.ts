import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
// حداکثر بُعد پس از بازکدگذاری. عکس پروفایل هیچ‌جای سایت بزرگ‌تر از این نمایش
// داده نمی‌شود، و ذخیره‌ی اصلِ فایل چندمگابایتی قبلاً LCP صفحه اصلی را خراب
// کرده بود؛ پس همین‌جا در مبدأ کوچک می‌شود.
const MAX_DIMENSION = 1200;

/**
 * نوع فایل را از روی بایت‌های واقعی تشخیص می‌دهد.
 *
 * اتکا به `file.type` امن نیست: آن هدر را کلاینت می‌فرستد و هر مقداری می‌تواند
 * باشد. پسوند نام فایل هم به همین دلیل کنار گذاشته می‌شود — پسوند خروجی فقط
 * از نوعِ تأییدشده ساخته می‌شود.
 */
function sniffType(buf: Buffer): "jpeg" | "png" | "webp" | "pdf" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return "pdf";
  return null;
}

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

  const input = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffType(input);
  const pdfAllowed = type === "license";

  if (!sniffed || (sniffed === "pdf" && !pdfAllowed)) {
    return NextResponse.json(
      { error: pdfAllowed ? "فرمت مجاز: jpeg, png, webp, pdf" : "فرمت مجاز: jpeg, png, webp" },
      { status: 400 }
    );
  }

  const subDir = pdfAllowed ? "licenses" : "photos";
  const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  await mkdir(uploadDir, { recursive: true });

  let output: Buffer;
  let ext: string;

  if (sniffed === "pdf") {
    // PDF را نمی‌توان بازکدگذاری کرد؛ فقط امضای معتبرش تأیید شده و عیناً ذخیره می‌شود.
    output = input;
    ext = "pdf";
  } else {
    // بازکدگذاری کامل تصویر: هر چیزی که در فایل جاسازی شده باشد (اسکریپت،
    // متادیتای مخرب) در این مرحله از بین می‌رود، چون خروجی از پیکسل‌های
    // رمزگشایی‌شده دوباره ساخته می‌شود.
    try {
      output = await sharp(input)
        .rotate() // اعمال چرخش EXIF پیش از حذف متادیتا
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      ext = "webp";
    } catch {
      return NextResponse.json({ error: "فایل تصویری معتبر نیست" }, { status: 400 });
    }
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), output);

  return NextResponse.json({ url: `/uploads/${subDir}/${filename}` });
}
