import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeFormContent } from "@/lib/sanitize";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === "ADMIN";
}

const DOC_TYPES = ["petition", "complaint", "declaration", "appeal"] as const;

// اسلاگ فقط حروف کوچک لاتین/عدد و خط تیره — قابل استفاده در URL بدون انکد.
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ باید فقط شامل حروف کوچک لاتین، عدد و خط تیره باشد");

const createSchema = z.object({
  slug: slugSchema,
  categoryId: z.number().int().positive().nullable().optional(),
  docType: z.enum(DOC_TYPES),
  titleFA: z.string().trim().min(1).max(300),
  titleEN: z.string().trim().max(300).optional().default(""),
  descFA: z.string().max(1000).optional().default(""),
  descEN: z.string().max(1000).optional().default(""),
  content: z.string().max(200_000).optional().default(""),
  isPublished: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

// ویرایش می‌تواند جزئی باشد (مثلاً فقط تغییر وضعیت انتشار)، پس همه‌ی فیلدها
// اختیاری‌اند اما هرکدام که بیاید همان اعتبارسنجی create را می‌گذراند.
const updateSchema = createSchema.partial().extend({
  id: z.number().int().positive(),
});

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function zodMessage(err: z.ZodError): string {
  return err.issues.map((i) => i.message).join("؛ ");
}

function revalidateForms(slug?: string) {
  revalidatePath("/fa/forms");
  if (slug) revalidatePath(`/fa/forms/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function GET() {
  if (!(await isAdmin())) return badRequest("Unauthorized", 401);

  const [categories, templates] = await Promise.all([
    db.legalFormCategory.findMany({
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    }),
    db.legalFormTemplate.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
  ]);

  return NextResponse.json({ categories, templates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return badRequest("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("بدنه‌ی درخواست نامعتبر است");
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(zodMessage(parsed.error));
  const data = parsed.data;

  try {
    const existing = await db.legalFormTemplate.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existing) return badRequest("این اسلاگ قبلاً استفاده شده است", 409);

    const template = await db.legalFormTemplate.create({
      data: {
        slug: data.slug,
        categoryId: data.categoryId ?? null,
        docType: data.docType,
        titleFA: data.titleFA,
        titleEN: data.titleEN,
        descFA: data.descFA,
        descEN: data.descEN,
        content: sanitizeFormContent(data.content),
        isPublished: data.isPublished,
        order: data.order,
      },
    });

    revalidateForms(template.slug);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return badRequest("این اسلاگ قبلاً استفاده شده است", 409);
    }
    console.error("forms POST failed:", err);
    return badRequest("ثبت نمونه با خطا مواجه شد", 500);
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return badRequest("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("بدنه‌ی درخواست نامعتبر است");
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest(zodMessage(parsed.error));
  const { id, ...rest } = parsed.data;

  // فقط فیلدهای مجاز نوشته می‌شوند (جلوگیری از mass-assignment).
  const data: Prisma.LegalFormTemplateUpdateInput = {};
  if (rest.slug !== undefined) data.slug = rest.slug;
  if (rest.docType !== undefined) data.docType = rest.docType;
  if (rest.titleFA !== undefined) data.titleFA = rest.titleFA;
  if (rest.titleEN !== undefined) data.titleEN = rest.titleEN;
  if (rest.descFA !== undefined) data.descFA = rest.descFA;
  if (rest.descEN !== undefined) data.descEN = rest.descEN;
  if (rest.content !== undefined) data.content = sanitizeFormContent(rest.content);
  if (rest.isPublished !== undefined) data.isPublished = rest.isPublished;
  if (rest.order !== undefined) data.order = rest.order;
  if (rest.categoryId !== undefined) {
    data.category = rest.categoryId
      ? { connect: { id: rest.categoryId } }
      : { disconnect: true };
  }

  if (Object.keys(data).length === 0) {
    return badRequest("موردی برای به‌روزرسانی ارسال نشده است");
  }

  try {
    if (rest.slug !== undefined) {
      const clash = await db.legalFormTemplate.findFirst({
        where: { slug: rest.slug, NOT: { id } },
        select: { id: true },
      });
      if (clash) return badRequest("این اسلاگ قبلاً استفاده شده است", 409);
    }

    const template = await db.legalFormTemplate.update({ where: { id }, data });
    revalidateForms(template.slug);
    return NextResponse.json(template);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") return badRequest("این اسلاگ قبلاً استفاده شده است", 409);
      if (err.code === "P2025") return badRequest("نمونه یافت نشد", 404);
    }
    console.error("forms PUT failed:", err);
    return badRequest("به‌روزرسانی نمونه با خطا مواجه شد", 500);
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return badRequest("Unauthorized", 401);
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return badRequest("شناسه ارسال نشده است");

  try {
    const deleted = await db.legalFormTemplate.delete({ where: { id } });
    revalidateForms(deleted.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return badRequest("نمونه یافت نشد", 404);
    }
    console.error("forms DELETE failed:", err);
    return badRequest("حذف نمونه با خطا مواجه شد", 500);
  }
}
