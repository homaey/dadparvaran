import Link from "next/link";
import { ArrowLeft, CalendarClock, PenLine, Sparkles } from "lucide-react";

type Accent = "gold" | "primary" | "violet";

const styles: Record<Accent, { card: string; icon: string; action: string }> = {
  gold: {
    card: "border-gold-200 bg-gold-50/40 hover:border-gold-500",
    icon: "bg-gold-100 text-gold-700",
    action: "text-gold-700",
  },
  primary: {
    card: "border-primary-200 bg-primary-50/40 hover:border-primary-500",
    icon: "bg-primary-100 text-primary-700",
    action: "text-primary-700",
  },
  violet: {
    card: "border-violet-200 bg-violet-50/40 hover:border-violet-500",
    icon: "bg-violet-100 text-violet-700",
    action: "text-violet-700",
  },
};

export default function ArticleCreationOptions({ locale }: { locale: string }) {
  const isRTL = locale === "fa";
  const options = [
    {
      href: `/${locale}/dashboard/articles/new/calendar`,
      icon: CalendarClock,
      title: isRTL ? "مقالات ارجاعی" : "Assigned Articles",
      description: isRTL
        ? "موضوع و پرامپت‌ها را مدیر در تقویم محتوا مشخص کرده است؛ موضوع را انتخاب کنید و ادامه دهید."
        : "The manager has already set the topic and prompts; select an assignment and continue.",
      action: isRTL ? "مشاهده موضوعات ارجاعی" : "View assignments",
      accent: "gold" as Accent,
    },
    {
      href: `/${locale}/dashboard/articles/new/manual`,
      icon: PenLine,
      title: isRTL ? "ساخت مقاله دستی" : "Create Manually",
      description: isRTL
        ? "عنوان و محتوای مقاله را از ابتدا خودتان وارد و بخش‌های آن را مدیریت کنید."
        : "Enter the title and write and organize the article yourself from scratch.",
      action: isRTL ? "شروع نوشتن" : "Start writing",
      accent: "primary" as Accent,
    },
    {
      href: `/${locale}/dashboard/articles/new/ai`,
      icon: Sparkles,
      title: isRTL ? "ساخت مقاله با هوش مصنوعی" : "Create with AI",
      description: isRTL
        ? "موضوع دلخواه را دستی وارد کنید؛ هوش مصنوعی مقاله کامل را می‌سازد و خودکار ساختاربندی می‌کند."
        : "Enter any topic; AI creates the complete draft and structures it automatically.",
      action: isRTL ? "وارد کردن موضوع" : "Enter a topic",
      accent: "violet" as Accent,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map(({ href, icon: Icon, title, description, action, accent }) => {
        const theme = styles[accent];
        return (
          <Link
            key={href}
            href={href}
            className={`group rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${theme.card}`}
          >
            <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${theme.icon}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="mt-2 min-h-20 text-sm leading-7 text-gray-600">{description}</p>
            <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${theme.action}`}>
              {action}
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "" : "rotate-180"}`} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
