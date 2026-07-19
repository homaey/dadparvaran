import { Roles } from "@/lib/roles";
import { NextResponse } from "next/server";
import { TaskStatus } from "@/lib/content-enums";
import { authorize } from "@/lib/api";
import { db } from "@/lib/db";
export async function GET() {
  const auth = await authorize(); if ("error" in auth) return auth.error;
  if (auth.session.role === Roles.ADMIN) {
    const [totalArticles, pendingTasks, completedTasks] = await Promise.all([db.contentArticle.count(), db.task.count({ where: { status: { notIn: [TaskStatus.APPROVED,TaskStatus.PUBLISHED] } } }), db.task.count({ where: { status: {in:[TaskStatus.APPROVED,TaskStatus.PUBLISHED]} } })]);
    return NextResponse.json({ totalArticles, pendingTasks, completedTasks });
  }
  const tasks = await db.task.findMany({ where: { assigneeId: auth.session.userId }, select: { id: true, title: true, deadline: true, status: true }, orderBy: [{ deadline: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ tasks });
}
