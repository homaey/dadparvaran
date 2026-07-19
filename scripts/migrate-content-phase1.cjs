const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  const planned = await db.task.findMany({
    where: { status: "PLANNED" },
    include: { calendarItem: { select: { id: true } } },
  });
  const tasks = planned.filter((task) => task.calendarItem);

  for (const task of tasks) {
    await db.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: task.id },
        data: { status: "ASSIGNED", reviewerId: null },
      });
      const existingActivity = await tx.taskActivity.findFirst({
        where: { taskId: task.id, toStatus: "ASSIGNED" },
      });
      if (!existingActivity) {
        await tx.taskActivity.create({
          data: {
            taskId: task.id,
            userId: task.creatorId,
            fromStatus: "PLANNED",
            toStatus: "ASSIGNED",
            note: "اصلاح فاز فوری: فعال‌سازی وظیفه تخصیص‌یافته",
          },
        });
      }
      await tx.notification.upsert({
        where: { dedupeKey: `phase1:assigned:${task.id}:${task.assigneeId}` },
        update: {},
        create: {
          userId: task.assigneeId,
          taskId: task.id,
          type: "TASK_ASSIGNED",
          title: "وظیفه جدید",
          message: `«${task.title}» برای اقدام به شما محول شده است.`,
          scheduledFor: new Date(),
          dedupeKey: `phase1:assigned:${task.id}:${task.assigneeId}`,
        },
      });
    });
  }

  const statuses = await db.task.groupBy({ by: ["status"], _count: { _all: true } });
  const activities = await db.taskActivity.count();
  const notifications = await db.notification.count({
    where: { dedupeKey: { startsWith: "phase1:assigned:" } },
  });
  console.log(JSON.stringify({ migrated: tasks.length, statuses, activities, notifications }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
