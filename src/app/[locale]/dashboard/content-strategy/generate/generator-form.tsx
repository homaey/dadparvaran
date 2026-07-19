"use client";
import { FormEvent, useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { btnPrimary, Card, inputClass, fieldLabelClass, errorClass } from "@/components/ui";
import jalaali from "jalaali-js";

type User = { id: string; name: string; role: string };

const aiModels = [
  { value: "", label: "مدل پیش‌فرض سیستم" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
];

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return jalaali.isLeapJalaaliYear(jy) ? 30 : 29;
}

function jalaliToISO(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

function currentJalaliYear(): number {
  const now = new Date();
  const { jy } = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return jy;
}

export default function GeneratorForm({ users }: { users: User[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const jYear = useMemo(() => currentJalaliYear(), []);
  const years = [jYear, jYear + 1];

  const [startYear, setStartYear] = useState(jYear);
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(jYear);
  const [endMonth, setEndMonth] = useState(3);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const f = new FormData(e.currentTarget);
    const teamMemberIds = f.getAll("teamMemberIds") as string[];

    if (teamMemberIds.length === 0) {
      setError("حداقل یک عضو تیم انتخاب کنید");
      setLoading(false);
      return;
    }

    if (endYear < startYear || (endYear === startYear && endMonth < startMonth)) {
      setError("پایان دوره باید بعد از شروع باشد");
      setLoading(false);
      return;
    }

    const periodStartISO = jalaliToISO(startYear, startMonth, 1);
    const endDayLen = jalaliMonthLength(endYear, endMonth);
    const periodEndISO = jalaliToISO(endYear, endMonth, endDayLen);

    const title = `تقویم محتوا ${PERSIAN_MONTHS[startMonth - 1]} تا ${PERSIAN_MONTHS[endMonth - 1]} ${endYear}`;

    const body = {
      title,
      periodStart: periodStartISO,
      periodEnd: periodEndISO,
      articleCount: Number(f.get("articleCount")),
      teamMemberIds,
      model: f.get("model") || undefined,
    };

    try {
      const res = await fetch("/api/admin/content-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "خطا در تولید تقویم");
        return;
      }
      router.push(`/dashboard/content-strategy/${data.id}`);
    } catch {
      setLoading(false);
      setError("خطا در ارتباط با سرور");
    }
  }

  return (
    <Card>
      <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2">
          <span className="block mb-2 font-bold text-gray-800 text-sm">دوره زمانی تقویم</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">از ماه</span>
              <div className="flex gap-2">
                <select className={inputClass} value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
                  {PERSIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select className={inputClass} value={startYear} onChange={(e) => setStartYear(Number(e.target.value))}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500">تا ماه</span>
              <div className="flex gap-2">
                <select className={inputClass} value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))}>
                  {PERSIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select className={inputClass} value={endYear} onChange={(e) => setEndYear(Number(e.target.value))}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <label className={fieldLabelClass}>
          تعداد مقاله
          <input className={inputClass} type="number" name="articleCount" min="1" max="60" defaultValue="24" required />
        </label>

        <label className={fieldLabelClass}>
          مدل هوش مصنوعی
          <select className={inputClass} name="model">
            {aiModels.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>

        <label className={`${fieldLabelClass} md:col-span-2`}>
          وکلای نویسنده
          <select className={inputClass} name="teamMemberIds" multiple size={Math.min(5, users.length)} required>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === "LAWYER" ? "وکیل" : u.role === "ADMIN" ? "ادمین" : u.role === "CONTENT_CREATOR" ? "تولیدکننده" : u.role})
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 mt-1 block">برای انتخاب چند نفر Ctrl را نگه دارید</span>
        </label>

        <div className={`md:col-span-2 ${errorClass}`}>{error}</div>

        <div className="md:col-span-2">
          <button className={btnPrimary} disabled={loading}>
            {loading ? "در حال تحلیل سایت و تولید تقویم…" : "تولید تقویم محتوا"}
          </button>
          {loading && (
            <p className="text-xs text-gray-500 mt-2">
              هوش مصنوعی مقالات منتشرشده سایت و رقبای حقوقی را تحلیل و موضوعات بهینه را پیشنهاد می‌کند. این فرایند ممکن است ۱ تا ۲ دقیقه طول بکشد.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
