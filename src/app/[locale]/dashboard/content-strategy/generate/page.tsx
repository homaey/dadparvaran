import { Roles } from "@/lib/roles";

import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import GeneratorForm from "./generator-form";

export default async function Generate() {
  await requireUser([Roles.ADMIN]);
  const t = await getTranslations("content.contentStrategy");
  const users = await db.user.findMany({ where: { role: { in: [Roles.ADMIN, Roles.LAWYER, Roles.CONTENT_CREATOR] } }, select: { id: true, name: true, role: true }, orderBy: { name: "asc" } });
  return (
    <>
      <header className="mb-8">
        <h1 className="font-fa-display text-2xl font-bold text-navy-900">{t("generateTitle")}</h1>
        <p className="mt-1 text-gray-500">{t("generateSubtitle")}</p>
      </header>
      <GeneratorForm users={users} />
    </>
  );
}
