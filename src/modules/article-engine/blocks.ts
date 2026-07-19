import { db } from "@/lib/db";
import type { BlockDefinition } from "./templates";

/**
 * بلوک‌های یک مقاله را با قالب فعلی هماهنگ می‌کند.
 *
 * قالب‌ها با گذر زمان بلوک می‌گیرند؛ مقاله‌هایی که پیش از آن ساخته شده‌اند نباید عقب بمانند.
 * بدون این همگام‌سازی، بلوک تازه فقط برای مقالات جدید ساخته می‌شد و مقالات قدیمی
 * هیچ‌وقت مستندات قانونی یا پاسخ فوری پیدا نمی‌کردند.
 */
export async function syncArticleBlocks(articleId: number, definitions: BlockDefinition[]) {
  const existing = await db.articleBlock.findMany({
    where: { articleId },
    select: { id: true, key: true, content: true },
  });
  const existingKeys = new Set(existing.map((b) => b.key));
  const templateKeys = new Set(definitions.map((d) => d.key));

  const creates = definitions
    .map((definition, position) => ({ definition, position }))
    .filter(({ definition }) => !existingKeys.has(definition.key))
    .map(({ definition, position }) => ({
      articleId,
      key: definition.key,
      label: definition.label,
      position,
    }));

  const orphans = existing.filter((b) => !templateKeys.has(b.key));
  // بلوک خالیِ حذف‌شده از قالب قابل تولید نیست ولی جلوی شرط «همه بلوک‌ها تکمیل شوند» را
  // می‌گیرد و مقاله را در بازبینی قفل می‌کند. بلوک دارای محتوا حذف نمی‌شود تا نوشته‌ای از
  // دست نرود؛ فقط به انتها منتقل می‌شود.
  const orphansEmpty = orphans.filter((b) => !b.content.trim());
  const orphansFilled = orphans.filter((b) => b.content.trim());

  await db.$transaction([
    ...(orphansEmpty.length
      ? [db.articleBlock.deleteMany({ where: { id: { in: orphansEmpty.map((b) => b.id) } } })]
      : []),
    ...(creates.length ? [db.articleBlock.createMany({ data: creates })] : []),
    ...definitions.map((definition, position) =>
      db.articleBlock.updateMany({
        where: { articleId, key: definition.key },
        data: { label: definition.label, position },
      }),
    ),
    ...orphansFilled.map((block, index) =>
      db.articleBlock.update({
        where: { id: block.id },
        data: { position: definitions.length + index },
      }),
    ),
  ]);

  return { added: creates.length, removed: orphansEmpty.length, kept: orphansFilled.length };
}
