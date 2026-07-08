"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, X, Upload, CheckCircle2, XCircle } from "lucide-react";

interface TagData {
  id: number;
  nameFA: string;
  nameEN: string;
}

interface LawyerData {
  id: number;
  nameFA: string;
  nameEN: string;
  roleFA: string;
  roleEN: string;
  bioFA: string;
  bioEN: string;
  barNumber: string | null;
  experience: number;
  education: string | null;
  phone: string | null;
  photoUrl: string | null;
  licenseImage: string | null;
  isActive: boolean;
  status: string;
  tags?: TagData[];
}

export default function LawyerActions({
  member,
  locale,
}: {
  member: LawyerData;
  locale: string;
}) {
  const router = useRouter();
  const isRTL = locale === "fa";
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/admin/lawyers?id=${member.id}`, { method: "DELETE" });
    setDeleting(false);
    setShowDelete(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Pencil className="w-4 h-4" />
          {isRTL ? "ویرایش" : "Edit"}
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-medium border border-red-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {isRTL ? "حذف" : "Delete"}
        </button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDelete(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isRTL ? "حذف وکیل" : "Delete Lawyer"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {isRTL
                  ? `آیا از حذف «${member.nameFA}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
                  : `Are you sure you want to delete "${member.nameEN}"? This cannot be undone.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {isRTL ? "انصراف" : "Cancel"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isRTL ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <LawyerEditModal
          member={member}
          locale={locale}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function LawyerEditModal({
  member,
  locale,
  onClose,
  onSaved,
}: {
  member: LawyerData;
  locale: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isRTL = locale === "fa";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagData[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    member.tags?.map((t) => t.id) || []
  );

  useEffect(() => {
    fetch("/api/tags?category=APPLIED")
      .then((r) => r.json())
      .then((d) => setAvailableTags(d.tags || []))
      .catch(() => {});
  }, []);

  const [form, setForm] = useState({
    nameFA: member.nameFA,
    nameEN: member.nameEN,
    roleFA: member.roleFA,
    roleEN: member.roleEN,
    bioFA: member.bioFA,
    bioEN: member.bioEN,
    barNumber: member.barNumber || "",
    phone: member.phone || "",
    experience: member.experience,
    education: member.education || "",
    photoUrl: member.photoUrl || "",
    licenseImage: member.licenseImage || "",
    isActive: member.isActive,
    status: member.status,
  });

  async function uploadFile(file: File, type: "photo" | "license") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url as string;
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file, "photo");
      setForm((p) => ({ ...p, photoUrl: url }));
    } catch {}
    setUploadingPhoto(false);
  }

  async function handleLicenseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLicense(true);
    try {
      const url = await uploadFile(file, "license");
      setForm((p) => ({ ...p, licenseImage: url }));
    } catch {}
    setUploadingLicense(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/lawyers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, ...form, tagIds: selectedTagIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isRTL ? "خطا در ذخیره تغییرات" : "Failed to save changes"));
        setSaving(false);
        return;
      }
      setSaving(false);
      onSaved();
    } catch {
      setError(isRTL ? "خطا در ارتباط با سرور" : "Connection error");
      setSaving(false);
    }
  }

  const fieldClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8"
        dir={isRTL ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isRTL ? "ویرایش وکیل" : "Edit Lawyer"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-gray-200">
              {form.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-700 bg-primary-50">
                  {form.nameFA.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isRTL ? "آپلود عکس" : "Upload Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              <p className="text-xs text-gray-400 mt-1">{isRTL ? "JPG, PNG یا WebP — حداکثر ۵ مگابایت" : "JPG, PNG or WebP — max 5MB"}</p>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "نام فارسی" : "Name (FA)"}</label>
              <input value={form.nameFA} onChange={(e) => setForm((p) => ({ ...p, nameFA: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "نام انگلیسی" : "Name (EN)"}</label>
              <input value={form.nameEN} onChange={(e) => setForm((p) => ({ ...p, nameEN: e.target.value }))} className={fieldClass} />
            </div>
          </div>

          {/* Roles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "سمت فارسی" : "Role (FA)"}</label>
              <input value={form.roleFA} onChange={(e) => setForm((p) => ({ ...p, roleFA: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "سمت انگلیسی" : "Role (EN)"}</label>
              <input value={form.roleEN} onChange={(e) => setForm((p) => ({ ...p, roleEN: e.target.value }))} className={fieldClass} />
            </div>
          </div>

          {/* Bar & Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "شماره پروانه" : "Bar Number"}</label>
              <input value={form.barNumber} onChange={(e) => setForm((p) => ({ ...p, barNumber: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "سال تجربه" : "Experience"}</label>
              <input type="number" min="0" max="60" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: parseInt(e.target.value) || 0 }))} className={fieldClass} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "شماره موبایل" : "Phone Number"}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              pattern="^09\d{9}$"
              placeholder="09xxxxxxxxx"
              dir="ltr"
              className={fieldClass}
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "تحصیلات" : "Education"}</label>
            <input value={form.education} onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))} className={fieldClass} />
          </div>

          {/* Specialties */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "تخصص‌ها" : "Specialties"}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          selected
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                        selected
                          ? "bg-primary-700 text-white border-primary-700 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700"
                      }`}
                    >
                      {isRTL ? tag.nameFA : tag.nameEN}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bio FA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "بیوگرافی فارسی" : "Bio (FA)"}</label>
            <textarea rows={3} value={form.bioFA} onChange={(e) => setForm((p) => ({ ...p, bioFA: e.target.value }))} className={`${fieldClass} resize-none`} />
          </div>

          {/* Bio EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "بیوگرافی انگلیسی" : "Bio (EN)"}</label>
            <textarea rows={3} value={form.bioEN} onChange={(e) => setForm((p) => ({ ...p, bioEN: e.target.value }))} className={`${fieldClass} resize-none`} />
          </div>

          {/* License Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "تصویر پروانه وکالت" : "License Image"}</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border border-gray-200 transition-colors">
                {uploadingLicense ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isRTL ? "آپلود پروانه" : "Upload License"}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicenseChange} />
              </label>
              {form.licenseImage && (
                <span className="flex items-center gap-1 text-green-600 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  {isRTL ? "آپلود شده" : "Uploaded"}
                </span>
              )}
            </div>
          </div>

          {/* Status toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{isRTL ? "فعال" : "Active"}</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{isRTL ? "وضعیت:" : "Status:"}</span>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="PENDING">{isRTL ? "در انتظار" : "Pending"}</option>
                <option value="APPROVED">{isRTL ? "تأیید شده" : "Approved"}</option>
                <option value="REJECTED">{isRTL ? "رد شده" : "Rejected"}</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {isRTL ? "انصراف" : "Cancel"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isRTL ? "ذخیره تغییرات" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
