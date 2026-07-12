"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import {
  Mail, MailOpen, Trash2, Loader2, Clock, User, Phone, AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  name: string;
  phone: string | null;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleRead(msg: Message) {
    const newRead = !msg.isRead;
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, isRead: newRead }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: newRead } : m))
    );
  }

  async function deleteMsg(id: number) {
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected === id) setSelected(null);
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const selectedMsg = messages.find((m) => m.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? "پیام‌های دریافتی" : "Inbox Messages"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL
              ? `${messages.length} پیام (${unreadCount} خوانده نشده)`
              : `${messages.length} messages (${unreadCount} unread)`}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">
            {isRTL ? "هنوز پیامی دریافت نشده است" : "No messages yet"}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Message list */}
          <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelected(msg.id);
                  if (!msg.isRead) toggleRead(msg);
                }}
                className={cn(
                  "w-full text-start p-4 rounded-xl border transition-colors cursor-pointer",
                  selected === msg.id
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-100 bg-white hover:border-gray-200",
                  !msg.isRead && "border-s-4 border-s-primary-500"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.isRead ? (
                    <MailOpen className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary-600 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm truncate",
                      msg.isRead ? "text-gray-600" : "font-bold text-gray-900"
                    )}
                  >
                    {msg.name}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 ps-6">
                  {msg.message}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 ps-6">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.createdAt).toLocaleDateString(
                    isRTL ? "fa-IR" : "en-US",
                    { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selectedMsg ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900">
                        {selectedMsg.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AtSign className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${selectedMsg.email}`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {selectedMsg.email}
                      </a>
                    </div>
                    {selectedMsg.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a
                          href={`tel:${selectedMsg.phone}`}
                          className="text-sm text-gray-700 hover:underline"
                        >
                          {selectedMsg.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRead(selectedMsg)}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                      title={isRTL ? (selectedMsg.isRead ? "خوانده‌نشده" : "خوانده‌شده") : (selectedMsg.isRead ? "Mark unread" : "Mark read")}
                    >
                      {selectedMsg.isRead ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MailOpen className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMsg(selectedMsg.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title={isRTL ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(selectedMsg.createdAt).toLocaleDateString(
                    isRTL ? "fa-IR" : "en-US",
                    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedMsg.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Mail className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {isRTL
                    ? "یک پیام را برای مشاهده انتخاب کنید"
                    : "Select a message to view"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
