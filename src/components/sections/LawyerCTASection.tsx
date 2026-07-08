import Link from "next/link";
import { useLocale } from "next-intl";
import { Scale, UserPlus, LogIn, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function LawyerCTASection() {
  const locale = useLocale();
  const isRTL = locale === "fa";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-primary-900 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-gold-500 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-primary-400 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Scale className="w-6 h-6 text-gold-400" />
              <span className="text-gold-400 text-sm font-semibold">
                {isRTL ? "پنل وکلا" : "Lawyer Portal"}
              </span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold text-white mb-6 leading-snug ${isRTL ? "font-fa" : "font-serif"}`}>
              {isRTL
                ? "وکیل هستید؟ به تیم ما بپیوندید"
                : "Are you a Lawyer? Join Our Team"}
            </h2>
            <p className="text-primary-200 leading-relaxed mb-8 max-w-lg">
              {isRTL
                ? "با ثبت‌نام در مؤسسه حقوقی دادپروران مهر ایران، پروفایل حرفه‌ای خود را ایجاد کنید، مقالات تخصصی منتشر نمایید و به مراجعان بیشتری دسترسی پیدا کنید."
                : "Register with Dadparvaran Mehr Iran to create your professional profile, publish expert articles, and reach more clients."}
            </p>

            <div className="flex items-center gap-4 mb-8">
              {[
                isRTL ? "پروفایل حرفه‌ای" : "Professional Profile",
                isRTL ? "انتشار مقالات" : "Publish Articles",
                isRTL ? "دسترسی به مراجعان" : "Reach Clients",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-primary-200">
                  <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Cards */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/auth/register-lawyer`}
              className="flex-1 group bg-gold-500 hover:bg-gold-600 text-primary-900 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/20 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-900/10 flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isRTL ? "font-fa" : ""}`}>
                {isRTL ? "ثبت‌نام وکیل" : "Register as Lawyer"}
              </h3>
              <p className="text-primary-900/70 text-sm mb-4 leading-relaxed">
                {isRTL
                  ? "پروانه وکالت و اطلاعات حرفه‌ای خود را ثبت کنید. پس از تأیید مدیریت، پروفایل شما فعال می‌شود."
                  : "Submit your license and professional info. Your profile will be activated after admin approval."}
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                {isRTL ? "شروع ثبت‌نام" : "Start Registration"}
                <Arrow className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href={`/${locale}/auth/login`}
              className="flex-1 group bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isRTL ? "font-fa" : ""}`}>
                {isRTL ? "ورود به پنل" : "Login to Dashboard"}
              </h3>
              <p className="text-primary-200 text-sm mb-4 leading-relaxed">
                {isRTL
                  ? "اگر قبلاً ثبت‌نام کرده‌اید، وارد داشبورد خود شوید و مقالات و پروفایل خود را مدیریت کنید."
                  : "Already registered? Log in to manage your profile, articles, and dashboard."}
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 group-hover:gap-3 transition-all">
                {isRTL ? "ورود" : "Login"}
                <Arrow className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
