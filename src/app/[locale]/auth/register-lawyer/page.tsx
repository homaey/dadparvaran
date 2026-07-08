"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  Scale, Loader2, CheckCircle2, ChevronRight, ChevronLeft,
  Eye, EyeOff, Upload, Camera, FileText, Award, Briefcase,
  GraduationCap, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterLawyerPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [account, setAccount] = useState({ name: "", email: "", phone: "", password: "" });
  const [profile, setProfile] = useState({
    barNumber: "",
    experience: "",
    education: "",
    specialties: "",
    bioFA: "",
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number; nameFA: string; nameEN: string }[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    fetch("/api/tags?category=APPLIED")
      .then((r) => r.json())
      .then((d) => setAvailableTags(d.tags || []))
      .catch(() => {});
  }, []);

  async function uploadFile(file: File, type: "photo" | "license") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Upload failed");
    }
    return (await res.json()).url as string;
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const url = await uploadFile(file, "photo");
      setPhotoUrl(url);
    } catch (err: any) {
      setError(err.message);
    }
    setUploadingPhoto(false);
  }

  async function handleLicenseUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLicense(true);
    setError("");
    try {
      const url = await uploadFile(file, "license");
      setLicenseUrl(url);
    } catch (err: any) {
      setError(err.message);
    }
    setUploadingLicense(false);
  }

  function canGoNext() {
    if (step === 1) return account.name && account.email && account.password.length >= 8;
    if (step === 2) return photoUrl && profile.barNumber && profile.experience && profile.bioFA.length >= 50 && selectedTags.length > 0;
    if (step === 3) return licenseUrl;
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const regRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...account, role: "LAWYER" }),
    });
    if (!regRes.ok) {
      const d = await regRes.json();
      setError(d.error);
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: account.email, password: account.password, redirect: false });

    const memberRes = await fetch("/api/lawyers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barNumber: profile.barNumber,
        experience: parseInt(profile.experience),
        education: profile.education,
        specialties: profile.specialties,
        tagIds: selectedTags,
        bioFA: profile.bioFA,
        photoUrl,
        licenseImage: licenseUrl,
      }),
    });

    setLoading(false);

    if (!memberRes.ok) {
      const d = await memberRes.json();
      setError(d.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/${locale}/dashboard`), 3000);
  }

  const steps = [
    { label: isRTL ? "اطلاعات حساب" : "Account", icon: User },
    { label: isRTL ? "پروفایل حقوقی" : "Profile", icon: Briefcase },
    { label: isRTL ? "مدارک" : "Documents", icon: FileText },
    { label: isRTL ? "تأیید نهایی" : "Confirm", icon: CheckCircle2 },
  ];

  const fieldClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4 py-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold text-white ${isRTL ? "font-fa" : "font-serif"}`}>
            {isRTL ? "ثبت‌نام وکیل" : "Lawyer Registration"}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isRTL ? "پس از بررسی مدارک توسط ادمین، پروفایل شما فعال می‌شود" : "Your profile will be activated after admin reviews your documents"}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = step > i + 1;
            const isCurrent = step === i + 1;
            return (
              <div key={i} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isDone ? "bg-green-500 text-white" :
                    isCurrent ? "bg-gold-500 text-white shadow-lg shadow-gold-500/30" :
                    "bg-white/10 text-white/40"
                  )}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn("text-[10px] font-medium", isCurrent ? "text-white" : "text-white/40")}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("w-8 h-0.5 mb-5 rounded-full mx-1", isDone ? "bg-green-500" : "bg-white/10")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {success ? (
            <div className="text-center py-16 px-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {isRTL ? "درخواست با موفقیت ثبت شد!" : "Registration Submitted!"}
              </h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                {isRTL
                  ? "مدارک شما توسط تیم ما بررسی خواهد شد. نتیجه از طریق ایمیل اطلاع‌رسانی می‌شود."
                  : "Your documents will be reviewed by our team. You will be notified via email."}
              </p>
              <div className="mt-6 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-700">
                {isRTL ? "زمان تقریبی بررسی: ۲۴ تا ۴۸ ساعت" : "Estimated review time: 24 to 48 hours"}
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mx-8 mt-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="p-8">
                {/* Step 1: Account Info */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">{steps[0].label}</h2>
                        <p className="text-xs text-gray-400">{isRTL ? "اطلاعات ورود به سیستم" : "Login credentials"}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "نام و نام خانوادگی" : "Full Name"} *</label>
                      <input
                        type="text"
                        required
                        value={account.name}
                        onChange={(e) => setAccount((p) => ({ ...p, name: e.target.value }))}
                        placeholder={isRTL ? "مثلاً: محمد محمدی" : "e.g., Mohammad Mohammadi"}
                        className={fieldClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "ایمیل" : "Email"} *</label>
                        <input
                          type="email"
                          required
                          value={account.email}
                          onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))}
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "موبایل" : "Mobile"}</label>
                        <input
                          type="tel"
                          value={account.phone}
                          onChange={(e) => setAccount((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="09xxxxxxxxx"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "رمز عبور" : "Password"} *</label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          minLength={8}
                          value={account.password}
                          onChange={(e) => setAccount((p) => ({ ...p, password: e.target.value }))}
                          placeholder={isRTL ? "حداقل ۸ کاراکتر" : "Minimum 8 characters"}
                          className={`${fieldClass} pe-12`}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Profile */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">{steps[1].label}</h2>
                        <p className="text-xs text-gray-400">{isRTL ? "اطلاعات حرفه‌ای و تخصصی" : "Professional information"}</p>
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden shrink-0 border-3 border-dashed border-gray-300 relative group">
                        {photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-[10px]">{isRTL ? "عکس پرسنلی" : "Photo"}</span>
                          </div>
                        )}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          {uploadingPhoto ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <Camera className="w-6 h-6 text-white" />
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{isRTL ? "عکس پروفایل *" : "Profile Photo *"}</p>
                        <p className="text-xs text-gray-400 mt-1">{isRTL ? "عکس پرسنلی رسمی — JPG یا PNG" : "Formal portrait — JPG or PNG"}</p>
                        {photoUrl && (
                          <span className="flex items-center gap-1 text-green-600 text-xs mt-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />{isRTL ? "آپلود شد" : "Uploaded"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Award className="w-3.5 h-3.5 inline me-1" />{isRTL ? "شماره پروانه *" : "Bar Number *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={profile.barNumber}
                          onChange={(e) => setProfile((p) => ({ ...p, barNumber: e.target.value }))}
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Briefcase className="w-3.5 h-3.5 inline me-1" />{isRTL ? "سابقه (سال) *" : "Experience (years) *"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          required
                          value={profile.experience}
                          onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 inline me-1" />{isRTL ? "تحصیلات" : "Education"}
                      </label>
                      <input
                        type="text"
                        value={profile.education}
                        onChange={(e) => setProfile((p) => ({ ...p, education: e.target.value }))}
                        placeholder={isRTL ? "مثلاً: دکترا حقوق خصوصی — دانشگاه تهران" : "e.g., PhD Private Law — University of Tehran"}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{isRTL ? "حوزه‌های تخصصی *" : "Specialties *"}</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const selected = selectedTags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() =>
                                setSelectedTags((prev) =>
                                  selected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                                )
                              }
                              className={cn(
                                "px-3.5 py-2 rounded-xl text-sm font-medium border transition-all",
                                selected
                                  ? "bg-primary-700 text-white border-primary-700 shadow-sm"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700"
                              )}
                            >
                              {isRTL ? tag.nameFA : tag.nameEN}
                            </button>
                          );
                        })}
                      </div>
                      {selectedTags.length === 0 && (
                        <p className="text-xs text-gray-400 mt-1.5">{isRTL ? "حداقل یک تخصص انتخاب کنید" : "Select at least one specialty"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? "بیوگرافی حرفه‌ای *" : "Professional Bio *"}</label>
                      <textarea
                        rows={4}
                        required
                        minLength={50}
                        value={profile.bioFA}
                        onChange={(e) => setProfile((p) => ({ ...p, bioFA: e.target.value }))}
                        placeholder={isRTL ? "سوابق حرفه‌ای، تجربیات و دستاوردهای خود را شرح دهید... (حداقل ۵۰ کاراکتر)" : "Describe your professional background, experiences and achievements... (min 50 characters)"}
                        className={`${fieldClass} resize-none`}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-end">
                        {profile.bioFA.length}/50 {isRTL ? "کاراکتر" : "chars"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Documents */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">{steps[2].label}</h2>
                        <p className="text-xs text-gray-400">{isRTL ? "بارگذاری مدارک حرفه‌ای" : "Upload professional documents"}</p>
                      </div>
                    </div>

                    {/* License Upload */}
                    <div className={cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-colors",
                      licenseUrl ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-primary-400"
                    )}>
                      {licenseUrl ? (
                        <div>
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="font-semibold text-green-700 mb-1">{isRTL ? "پروانه وکالت بارگذاری شد" : "License uploaded"}</p>
                          <label className="text-sm text-green-600 underline cursor-pointer hover:text-green-800">
                            {isRTL ? "تغییر فایل" : "Change file"}
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicenseUpload} />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          {uploadingLicense ? (
                            <Loader2 className="w-12 h-12 text-primary-500 mx-auto mb-3 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          )}
                          <p className="font-semibold text-gray-700 mb-1">{isRTL ? "تصویر پروانه وکالت *" : "Bar License Image *"}</p>
                          <p className="text-xs text-gray-400">{isRTL ? "فایل JPG, PNG یا PDF — حداکثر ۵ مگابایت" : "JPG, PNG or PDF — max 5MB"}</p>
                          <p className="text-xs text-primary-600 mt-2">{isRTL ? "برای انتخاب کلیک کنید" : "Click to select"}</p>
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicenseUpload} />
                        </label>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                      <p className="font-semibold mb-1">{isRTL ? "توجه:" : "Note:"}</p>
                      <p>{isRTL
                        ? "تصویر پروانه وکالت برای تأیید هویت و احراز صلاحیت شما ضروری است. این مدرک فقط توسط ادمین سایت مشاهده می‌شود."
                        : "The license image is required for identity verification and qualification. This document is only visible to site admin."
                      }</p>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">{steps[3].label}</h2>
                        <p className="text-xs text-gray-400">{isRTL ? "بررسی نهایی اطلاعات" : "Final review"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-700">
                          {account.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{account.name}</p>
                        <p className="text-sm text-gray-500">{account.email}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
                      {[
                        [isRTL ? "موبایل" : "Mobile", account.phone],
                        [isRTL ? "شماره پروانه" : "Bar Number", profile.barNumber],
                        [isRTL ? "سابقه" : "Experience", `${profile.experience} ${isRTL ? "سال" : "years"}`],
                        [isRTL ? "تحصیلات" : "Education", profile.education],
                        [isRTL ? "تخصص‌ها" : "Specialties", availableTags.filter((t) => selectedTags.includes(t.id)).map((t) => isRTL ? t.nameFA : t.nameEN).join("، ") || "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-gray-500 shrink-0">{k}:</span>
                          <span className="text-gray-800 text-end">{v || "—"}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <div className={cn("flex-1 rounded-xl p-3 text-center text-xs", licenseUrl ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                        <FileText className="w-5 h-5 mx-auto mb-1" />
                        {licenseUrl ? (isRTL ? "پروانه بارگذاری شده" : "License uploaded") : (isRTL ? "پروانه بارگذاری نشده" : "No license")}
                      </div>
                      <div className={cn("flex-1 rounded-xl p-3 text-center text-xs", photoUrl ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                        <Camera className="w-5 h-5 mx-auto mb-1" />
                        {photoUrl ? (isRTL ? "عکس بارگذاری شده" : "Photo uploaded") : (isRTL ? "عکس بارگذاری نشده" : "No photo")}
                      </div>
                    </div>

                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-xs text-primary-700">
                      {isRTL
                        ? "با ارسال درخواست، شما قوانین و مقررات سایت را پذیرفته‌اید. مدارک شما توسط تیم حقوقی بررسی شده و معمولاً ظرف ۲۴ تا ۴۸ ساعت نتیجه اعلام می‌شود."
                        : "By submitting, you accept the site's terms and conditions. Your documents will be reviewed by our legal team, usually within 24 to 48 hours."}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 gap-4">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:border-gray-300 transition-colors"
                    >
                      {isRTL ? "مرحله قبل" : "Previous"}
                    </button>
                  ) : (
                    <Link
                      href={`/${locale}/auth/login`}
                      className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-center hover:border-gray-300 transition-colors"
                    >
                      {isRTL ? "بازگشت به ورود" : "Back to Login"}
                    </Link>
                  )}

                  {step < totalSteps ? (
                    <button
                      type="button"
                      disabled={!canGoNext()}
                      onClick={() => setStep((s) => s + 1)}
                      className="flex-1 bg-primary-700 hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {isRTL ? "مرحله بعد" : "Next"}
                      <Arrow className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gold-500/20"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isRTL ? "ارسال درخواست" : "Submit Request"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Login link */}
        {!success && (
          <p className="text-center text-sm text-gray-400 mt-6">
            {isRTL ? "قبلاً ثبت‌نام کرده‌اید؟ " : "Already registered? "}
            <Link href={`/${locale}/auth/login`} className="text-white hover:text-gold-400 font-medium transition-colors">
              {isRTL ? "ورود" : "Sign In"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
