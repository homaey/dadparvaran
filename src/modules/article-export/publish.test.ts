import { afterEach, describe, expect, it, vi } from "vitest";

const upsert = vi.fn();
const update = vi.fn();
const findUnique = vi.fn();
const findSlugOwner = vi.fn();
const transaction = vi.fn(async (callback: (tx: unknown) => unknown) =>
  callback({
    article: {
      findUnique: (...args: unknown[]) => findSlugOwner(...args),
      create: (...args: unknown[]) => upsert(...args),
      update: (...args: unknown[]) => upsert(...args),
    },
    contentArticle: { update: (...args: unknown[]) => update(...args) },
  }),
);
vi.mock("@/lib/db", () => ({
  db: {
    contentArticle: { findUnique: (...args: unknown[]) => findUnique(...args) },
    $transaction: (...args: unknown[]) => transaction(...(args as [never])),
  },
}));
const buildArticleExport = vi.fn();
vi.mock("./serializer", () => ({ buildArticleExport: (...args: unknown[]) => buildArticleExport(...args) }));

import { publishToMainSite } from "./publish";

afterEach(() => vi.clearAllMocks());

describe("publishToMainSite", () => {
  it("publishes the main-site Article and links the content article atomically", async () => {
    buildArticleExport.mockResolvedValue({
      metadata: { title: "فسخ قرارداد", slug: "فسخ-قرارداد" },
      content: {
        blocks: [
          { key: "quick_answer", label: "پاسخ فوری", position: 0, content: "پاسخ کوتاه." },
          { key: "introduction", label: "مقدمه", position: 1, content: "متن مقدمه" },
          { key: "conclusion", label: "نتیجه", position: 2, content: "متن نتیجه" },
        ],
      },
      seo: { meta_description: "راهنمای فسخ قرارداد" },
    });
    findUnique.mockResolvedValue({ coverImage: "/cover.webp" });
    upsert.mockResolvedValue({ id: 42 });

    const result = await publishToMainSite(7, 3);

    expect(buildArticleExport).toHaveBeenCalledWith(7);
    const arg = upsert.mock.calls[0][0];
    expect(findSlugOwner).toHaveBeenCalledWith({ where: { slug: "فسخ-قرارداد" }, select: { id: true } });
    expect(arg.data.status).toBe("PUBLISHED");
    expect(arg.data.authorId).toBe(3);
    expect(arg.data.coverImage).toBe("/cover.webp");
    expect(update).toHaveBeenCalledWith({ where: { id: 7 }, data: { publishedArticleId: 42, status: "PUBLISHED" } });
    expect(result).toEqual({ id: 42 });
  });

  it("stores blocks in the render format the public page understands", async () => {
    // صفحه عمومی روی block.type سوییچ می‌کند و هر بلوک بدون type را دور می‌اندازد؛ ذخیره
    // بلوک معنایی خام یعنی مقاله با بدنه خالی منتشر شود.
    buildArticleExport.mockResolvedValue({
      metadata: { title: "فسخ قرارداد", slug: "فسخ-قرارداد" },
      content: {
        blocks: [
          { key: "quick_answer", label: "پاسخ فوری", position: 0, content: "پاسخ کوتاه." },
          { key: "introduction", label: "مقدمه", position: 1, content: "متن مقدمه" },
        ],
      },
      seo: { meta_description: "راهنمای فسخ قرارداد" },
    });
    findUnique.mockResolvedValue({ coverImage: null });
    upsert.mockResolvedValue({ id: 42 });

    await publishToMainSite(7, 3);

    const stored = JSON.parse(upsert.mock.calls[0][0].data.blocks);
    expect(stored).toEqual([
      { type: "callout", variant: "info", title: "پاسخ فوری", content: "پاسخ کوتاه." },
      { type: "heading", content: "مقدمه" },
      { type: "paragraph", content: "متن مقدمه" },
    ]);
    stored.forEach((block: { type: string }) => expect(block.type).toBeTruthy());
  });
});
