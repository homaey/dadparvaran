import { db } from "./db";

export async function getAllLaws() {
  return db.legalNode.findMany({
    where: { type: "LAW" },
    orderBy: { orderIndex: "asc" },
  });
}

export async function getLawBySlug(slug: string) {
  return db.legalNode.findFirst({
    where: { type: "LAW", slug },
  });
}

export async function getLawTree(lawId: number) {
  const allNodes = await db.legalNode.findMany({
    where: { lawId, id: { not: lawId } },
    orderBy: { orderIndex: "asc" },
  });

  type TreeNode = (typeof allNodes)[number] & { children: TreeNode[] };
  const nodeMap = new Map<number, TreeNode>();
  for (const n of allNodes) {
    nodeMap.set(n.id, { ...n, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const n of nodeMap.values()) {
    if (n.parentId === lawId) {
      roots.push(n);
    } else {
      const parent = nodeMap.get(n.parentId!);
      if (parent) parent.children.push(n);
    }
  }

  function pruneEmptySections(nodes: TreeNode[]): TreeNode[] {
    return nodes.filter((n) => {
      n.children = pruneEmptySections(n.children);
      if (n.type === "SECTION" && n.children.length === 0) return false;
      return true;
    });
  }

  return pruneEmptySections(roots);
}

export async function getLegalArticleBySlug(lawSlug: string, articleSlug: string) {
  const law = await getLawBySlug(lawSlug);
  if (!law) return null;

  const node = await db.legalNode.findFirst({
    where: {
      slug: articleSlug,
      type: "ARTICLE",
      lawId: law.id,
    },
    include: {
      parent: true,
      relatedRulings: {
        include: { ruling: true },
      },
    },
  });
  if (!node) return null;

  // قانونِ والد را ضمیمه می‌کنیم تا عنوان/H1/description بتوانند نام قانون را
  // شامل شوند. اسکیما رابطه‌ی Prisma برای lawId ندارد، اما law همین‌جا از قبل
  // واکشی شده است — پس این کار کوئری اضافه‌ای تحمیل نمی‌کند.
  return { ...node, law };
}

export async function getAdjacentArticles(lawId: number, currentOrderIndex: number, parentId: number | null) {
  const [prev, next] = await Promise.all([
    db.legalNode.findFirst({
      where: { lawId, type: "ARTICLE", orderIndex: { lt: currentOrderIndex } },
      orderBy: { orderIndex: "desc" },
      select: { slug: true, articleNumber: true, title: true },
    }),
    db.legalNode.findFirst({
      where: { lawId, type: "ARTICLE", orderIndex: { gt: currentOrderIndex } },
      orderBy: { orderIndex: "asc" },
      select: { slug: true, articleNumber: true, title: true },
    }),
  ]);
  return { prev, next };
}

export async function getTagsForLegalNode(nodeId: number) {
  const taggables = await db.taggable.findMany({
    where: { taggableType: "LEGAL_NODE", taggableId: nodeId },
    include: { tag: true },
  });
  return taggables.map((t) => t.tag);
}
