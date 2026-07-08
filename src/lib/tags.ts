import { db } from "./db";

export async function getTagBySlug(slug: string) {
  return db.tag.findUnique({ where: { slug } });
}

export async function getItemsByTag(tagId: number) {
  const taggables = await db.taggable.findMany({
    where: { tagId },
  });

  const legalNodeIds = taggables
    .filter((t) => t.taggableType === "LEGAL_NODE")
    .map((t) => t.taggableId);

  const teamMemberIds = taggables
    .filter((t) => t.taggableType === "TEAM_MEMBER")
    .map((t) => t.taggableId);

  const articleIds = taggables
    .filter((t) => t.taggableType === "ARTICLE")
    .map((t) => t.taggableId);

  const [legalNodes, teamMembers, articles] = await Promise.all([
    legalNodeIds.length > 0
      ? db.legalNode.findMany({ where: { id: { in: legalNodeIds } } })
      : [],
    teamMemberIds.length > 0
      ? db.teamMember.findMany({ where: { id: { in: teamMemberIds } } })
      : [],
    articleIds.length > 0
      ? db.article.findMany({
          where: { id: { in: articleIds }, status: "PUBLISHED" },
          include: { author: true, category: true },
        })
      : [],
  ]);

  return { legalNodes, teamMembers, articles };
}
