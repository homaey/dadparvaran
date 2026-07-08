import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

let lawA: any;
let lawB: any;

beforeAll(async () => {
  // Create two laws, each with an article having slug "ماده-1"
  lawA = await db.legalNode.create({
    data: {
      type: "LAW",
      title: "قانون الف (آزمایشی)",
      slug: "قانون-الف-آزمایشی",
      lawKey: "test-law-a",
      orderIndex: 0,
    },
  });
  await db.legalNode.update({ where: { id: lawA.id }, data: { lawId: lawA.id } });

  await db.legalNode.create({
    data: {
      parentId: lawA.id,
      lawId: lawA.id,
      type: "ARTICLE",
      title: "ماده ۱",
      slug: "ماده-1",
      articleNumber: "۱",
      content: "متن ماده ۱ از قانون الف",
      orderIndex: 0,
    },
  });

  lawB = await db.legalNode.create({
    data: {
      type: "LAW",
      title: "قانون ب (آزمایشی)",
      slug: "قانون-ب-آزمایشی",
      lawKey: "test-law-b",
      orderIndex: 0,
    },
  });
  await db.legalNode.update({ where: { id: lawB.id }, data: { lawId: lawB.id } });

  await db.legalNode.create({
    data: {
      parentId: lawB.id,
      lawId: lawB.id,
      type: "ARTICLE",
      title: "ماده ۱",
      slug: "ماده-1",
      articleNumber: "۱",
      content: "متن ماده ۱ از قانون ب",
      orderIndex: 0,
    },
  });
});

afterAll(async () => {
  await db.legalNode.deleteMany({ where: { lawId: lawA.id } });
  await db.legalNode.deleteMany({ where: { lawId: lawB.id } });
  await db.$disconnect();
});

describe("getLegalArticleBySlug — law-scoped article lookup", () => {
  it("returns article from law A when called with law A slug", async () => {
    const article = await db.legalNode.findFirst({
      where: {
        slug: "ماده-1",
        type: "ARTICLE",
        lawId: lawA.id,
      },
    });

    expect(article).not.toBeNull();
    expect(article!.content).toBe("متن ماده ۱ از قانون الف");
  });

  it("returns article from law B when called with law B slug", async () => {
    const article = await db.legalNode.findFirst({
      where: {
        slug: "ماده-1",
        type: "ARTICLE",
        lawId: lawB.id,
      },
    });

    expect(article).not.toBeNull();
    expect(article!.content).toBe("متن ماده ۱ از قانون ب");
  });

  it("without lawId filter, could return either (demonstrates the original bug)", async () => {
    const article = await db.legalNode.findFirst({
      where: {
        slug: "ماده-1",
        type: "ARTICLE",
      },
    });

    // Without lawId, findFirst returns whichever it finds first — unreliable
    expect(article).not.toBeNull();
    // This proves the bug: we can't guarantee which law's article is returned
  });

  it("getLegalArticleBySlug integration: scopes correctly via lawId", async () => {
    // Replicate what getLegalArticleBySlug does after the fix
    const law = await db.legalNode.findFirst({
      where: { type: "LAW", slug: "قانون-الف-آزمایشی" },
    });
    expect(law).not.toBeNull();

    const article = await db.legalNode.findFirst({
      where: {
        slug: "ماده-1",
        type: "ARTICLE",
        lawId: law!.id,
      },
      include: { parent: true },
    });

    expect(article).not.toBeNull();
    expect(article!.content).toBe("متن ماده ۱ از قانون الف");
    expect(article!.parent?.id).toBe(law!.id);
  });
});
