import { db } from "./db";

export async function getAllTeamMembers() {
  return db.teamMember.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getTeamMemberBySlug(slug: string) {
  return db.teamMember.findUnique({
    where: { slug },
  });
}

export async function getTagsForTeamMember(memberId: number) {
  const taggables = await db.taggable.findMany({
    where: { taggableType: "TEAM_MEMBER", taggableId: memberId },
    include: { tag: true },
  });
  return taggables.map((t) => t.tag);
}

export async function getTagsForArticle(articleId: number) {
  const taggables = await db.taggable.findMany({
    where: { taggableType: "ARTICLE", taggableId: articleId },
    include: { tag: true },
  });
  return taggables.map((t) => t.tag);
}
