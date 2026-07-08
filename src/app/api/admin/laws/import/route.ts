import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const VALID_TYPES = ["LAW", "BOOK", "PART", "CHAPTER", "SECTION", "SUBSECTION", "ARTICLE"] as const;

const nodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.enum(VALID_TYPES),
    title: z.string().min(1, "عنوان الزامی است"),
    slug: z.string().optional(),
    articleNumber: z.string().optional(),
    content: z.string().optional(),
    orderIndex: z.number().optional(),
    children: z.array(nodeSchema).optional(),
  })
);

const lawImportSchema = z.object({
  schemaVersion: z.literal(1, {
    errorMap: () => ({ message: "schemaVersion باید ۱ باشد" }),
  }),
  type: z.literal("LAW", {
    errorMap: () => ({ message: "ریشه باید type: LAW باشد" }),
  }),
  title: z.string().min(1),
  slug: z.string().optional(),
  lawKey: z.string().regex(/^[a-zA-Z0-9-]+$/, "lawKey فقط حروف لاتین، عدد و خط‌تیره"),
  adoptionDate: z.string().optional(),
  adoptionAuthority: z.string().optional(),
  sourceUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  children: z.array(nodeSchema).optional(),
});

function slugify(title: string): string {
  return title
    .replace(/[\s‌]+/g, "-")
    .replace(/[^؀-ۿa-zA-Z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateArticles(
  node: z.infer<typeof nodeSchema>,
  path: string,
  errors: string[]
) {
  const nodePath = `${path}/${node.slug || node.title}`;
  if (node.type === "ARTICLE") {
    if (!node.content?.trim()) errors.push(`${nodePath}: ماده بدون محتوا`);
    if (!node.articleNumber) errors.push(`${nodePath}: ماده بدون شماره`);
  }
  if (node.children) {
    const slugSet = new Set<string>();
    for (const child of node.children) {
      const childSlug = child.slug || slugify(child.title);
      if (slugSet.has(childSlug)) {
        errors.push(`${nodePath}: اسلاگ تکراری «${childSlug}»`);
      }
      slugSet.add(childSlug);
      validateArticles(child, nodePath, errors);
    }
  }
}

async function insertNode(
  node: z.infer<typeof nodeSchema>,
  parentId: number | null,
  orderIndex: number,
  lawId: number,
  tx: any
): Promise<number> {
  const slug = node.slug || slugify(node.title);

  const data: any = {
    type: node.type,
    title: node.title,
    slug,
    parentId,
    orderIndex,
    lawId,
    articleNumber: node.articleNumber || null,
    content: node.content || null,
  };

  const created = await tx.legalNode.create({ data });

  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      await insertNode(node.children[i], created.id, i, lawId, tx);
    }
  }

  return created.id;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON نامعتبر" }, { status: 400 });
  }

  const parsed = lawImportSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`
    );
    return NextResponse.json(
      { error: "اعتبارسنجی ناموفق", details: messages },
      { status: 400 }
    );
  }

  const law = parsed.data;

  const articleErrors: string[] = [];
  validateArticles(law as any, "", articleErrors);
  if (articleErrors.length > 0) {
    return NextResponse.json(
      { error: "خطای ساختاری", details: articleErrors },
      { status: 400 }
    );
  }

  const existing = await db.legalNode.findFirst({
    where: { lawKey: law.lawKey },
    select: { id: true, title: true },
  });

  const mode = (req.headers.get("x-import-mode") || "create") as string;

  if (existing && mode !== "replace") {
    return NextResponse.json(
      {
        error: "duplicate",
        message: `قانونی با کلید «${law.lawKey}» قبلاً وجود دارد: «${existing.title}»`,
        existingId: existing.id,
      },
      { status: 409 }
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      if (existing && mode === "replace") {
        await tx.taggable.deleteMany({
          where: { taggableType: "LEGAL_NODE", taggableId: existing.id },
        });
        const descendants = await getAllDescendantIds(existing.id, tx);
        if (descendants.length > 0) {
          await tx.taggable.deleteMany({
            where: {
              taggableType: "LEGAL_NODE",
              taggableId: { in: descendants },
            },
          });
          await tx.nodeRelatedRuling.deleteMany({
            where: { legalNodeId: { in: descendants } },
          });
          await tx.nodeRelatedRuling.deleteMany({
            where: { legalNodeId: existing.id },
          });
          for (let i = descendants.length - 1; i >= 0; i--) {
            await tx.legalNode.delete({ where: { id: descendants[i] } });
          }
        }
        await tx.legalNode.delete({ where: { id: existing.id } });
      }

      const rootSlug = law.slug || slugify(law.title);
      const root = await tx.legalNode.create({
        data: {
          type: "LAW",
          title: law.title,
          slug: rootSlug,
          lawKey: law.lawKey,
          adoptionDate: law.adoptionDate || null,
          adoptionAuthority: law.adoptionAuthority || null,
          sourceUrl: law.sourceUrl || null,
          orderIndex: 0,
        },
      });

      // Set lawId on the root node itself
      await tx.legalNode.update({
        where: { id: root.id },
        data: { lawId: root.id },
      });

      if (law.children) {
        for (let i = 0; i < law.children.length; i++) {
          await insertNode(law.children[i], root.id, i, root.id, tx);
        }
      }

      if (law.tags && law.tags.length > 0) {
        for (const tagSlug of law.tags) {
          const tag = await tx.tag.findUnique({ where: { slug: tagSlug } });
          if (tag) {
            await tx.taggable.create({
              data: {
                tagId: tag.id,
                taggableType: "LEGAL_NODE",
                taggableId: root.id,
              },
            });
          }
        }
      }

      return { id: root.id, title: root.title, lawKey: root.lawKey };
    }, { timeout: 30000 });

    return NextResponse.json({
      success: true,
      message: existing ? "قانون با موفقیت به‌روزرسانی شد" : "قانون با موفقیت وارد شد",
      law: result,
    });
  } catch (err: any) {
    console.error("Law import error:", err);
    return NextResponse.json(
      { error: "خطا در ذخیره‌سازی", details: [err.message] },
      { status: 500 }
    );
  }
}

async function getAllDescendantIds(parentId: number, tx: any): Promise<number[]> {
  const children = await tx.legalNode.findMany({
    where: { parentId },
    select: { id: true },
  });
  const ids: number[] = [];
  for (const child of children) {
    ids.push(child.id);
    const sub = await getAllDescendantIds(child.id, tx);
    ids.push(...sub);
  }
  return ids;
}
