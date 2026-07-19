"use client";
import { useState } from "react";
import { Card, btnSecondary } from "@/components/ui";

type N = { id: number; title: string; message: string; status: string; createdAt: string };

export default function Notifications({ items }: { items: N[] }) {
  const [read, setRead] = useState(items.every(i => i.status === "READ"));

  async function mark() {
    const res = await fetch("/api/notifications", { method: "PATCH" });
    if (res.ok) setRead(true);
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-600">{items.length} اعلان</span>
        {!read && <button className={btnSecondary} onClick={mark}>علامت‌گذاری همه به‌عنوان خوانده‌شده</button>}
      </div>
      {items.length ? (
        <div className="grid gap-3">
          {items.map(n => (
            <Card key={n.id} className={!read && n.status !== "READ" ? "border-r-4 border-r-gold-400" : ""}>
              <b className="text-navy-900">{n.title}</b>
              <p className="my-1 text-gray-600">{n.message}</p>
              <small className="text-gray-400">{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(n.createdAt))}</small>
            </Card>
          ))}
        </div>
      ) : (
        <Card>اعلانی وجود ندارد.</Card>
      )}
    </section>
  );
}
