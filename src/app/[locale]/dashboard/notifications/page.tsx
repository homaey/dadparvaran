import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Notifications from "./notifications";

export default async function NotificationPage() {
  const user = await requireUser();
  if (!user) notFound();
  const t = await getTranslations("content.notifications");
  const items = await db.notification.findMany({ where: { userId: user.userId }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <>
      <header className="mb-8">
        <h1 className="font-fa-display text-2xl font-bold text-navy-900">{t("title")}</h1>
        <p className="mt-1 text-gray-500">{t("subtitle")}</p>
      </header>
      <Notifications items={items.map(n => ({ id: n.id, title: n.title, message: n.message, status: n.status, createdAt: n.createdAt.toISOString() }))} />
    </>
  );
}
