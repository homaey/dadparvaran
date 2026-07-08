import { Scale, Shield, Building2, FileText, Home, Heart, Briefcase, FileCheck, FilePen, FileSearch, Banknote, HandCoins, Landmark, DoorOpen, BadgeCheck, Gavel, UserX } from "lucide-react";

export interface ServiceDetail {
  slug: string;
  parentSlug?: string;
  icon: typeof Scale;
  titleFA: string;
  titleEN: string;
  metaTitleFA: string;
  metaTitleEN: string;
  metaDescFA: string;
  metaDescEN: string;
  heroDescFA: string;
  heroDescEN: string;
  contentFA: string[];
  contentEN: string[];
  pointsFA: string[];
  pointsEN: string[];
  faqsFA: { q: string; a: string }[];
  faqsEN: { q: string; a: string }[];
  keywordsFA: string[];
  keywordsEN: string[];
}

export const servicesData: ServiceDetail[] = [
  {
    slug: "civil",
    icon: Scale,
    titleFA: "وکیل دعاوی حقوقی و مدنی",
    titleEN: "Civil Litigation Lawyer",
    metaTitleFA: "وکیل دعاوی حقوقی و مدنی در تهران | دادپروران مهر ایران",
    metaTitleEN: "Civil Litigation Lawyer in Tehran | Dadparvaraan Mehr Iran",
    metaDescFA: "وکیل متخصص دعاوی حقوقی و مدنی: مطالبه خسارت، دعاوی قراردادی، ملکی و اسناد تجاری. مشاوره رایگان با وکیل پایه یک دادگستری.",
    metaDescEN: "Expert civil litigation attorney: damage claims, contractual disputes, property and commercial document cases. Free consultation with licensed bar attorney.",
    heroDescFA: "تیم وکلای متخصص ما با بیش از ۲۰ سال تجربه در پرونده‌های حقوقی و مدنی، از حقوق شما در مراجع قضایی دفاع می‌کنند.",
    heroDescEN: "Our expert legal team with over 20 years of experience in civil cases defends your rights in judicial authorities.",
    contentFA: [
      "دعاوی حقوقی و مدنی گسترده‌ترین بخش پرونده‌های قضایی را تشکیل می‌دهند. این دعاوی شامل اختلافات ملکی، قراردادی، مطالبات مالی و بسیاری از موضوعات دیگر هستند که حل و فصل آنها نیازمند دانش حقوقی تخصصی و تجربه عملی است.",
      "مؤسسه حقوقی دادپروران مهر ایران با تکیه بر تجربه و دانش تیم وکلای پایه یک دادگستری، خدمات جامعی در حوزه دعاوی مدنی ارائه می‌دهد. از مرحله مشاوره اولیه تا اجرای حکم، ما در تمامی مراحل دادرسی همراه شما هستیم.",
      "مطالبه خسارت، الزام به تنظیم سند رسمی، تخلیه ملک، مطالبه وجه چک و سفته، دعاوی شراکتی و دعاوی مربوط به قراردادها از جمله حوزه‌هایی هستند که تیم ما در آنها تخصص ویژه دارد.",
    ],
    contentEN: [
      "Civil litigation constitutes the broadest category of judicial cases. These cases include property disputes, contractual conflicts, financial claims, and many other subjects that require specialized legal knowledge and practical experience.",
      "Dadparvaraan Mehr Iran Legal Institute, backed by the experience and knowledge of licensed bar attorneys, provides comprehensive services in civil litigation. From initial consultation to judgment enforcement, we accompany you through all stages of proceedings.",
      "Damage claims, mandatory deed registration, property eviction, check and promissory note demands, partnership disputes, and contract-related cases are among the areas where our team has special expertise.",
    ],
    pointsFA: [
      "مطالبه خسارت و دیون",
      "دعاوی قراردادی و الزام به ایفای تعهد",
      "دعاوی ملکی و تخلیه",
      "مطالبه وجه چک، سفته و اسناد تجاری",
      "الزام به تنظیم سند رسمی",
      "دعاوی شراکتی و مضاربه",
      "اعتراض ثالث و واخواهی",
      "اعسار و تقسیط محکوم‌به",
    ],
    pointsEN: [
      "Damage and debt claims",
      "Contractual disputes and obligation enforcement",
      "Property disputes and eviction",
      "Check, promissory note and commercial document demands",
      "Mandatory official deed registration",
      "Partnership and mudaraba disputes",
      "Third-party objections and appeals",
      "Insolvency and installment payment requests",
    ],
    faqsFA: [
      { q: "هزینه وکیل دعاوی حقوقی چقدر است؟", a: "حق الوکاله بسته به نوع و پیچیدگی پرونده متفاوت است. جلسه اول مشاوره رایگان است و پس از بررسی پرونده، هزینه‌ها به صورت شفاف اعلام می‌شود." },
      { q: "مدت زمان رسیدگی به پرونده حقوقی چقدر است؟", a: "مدت رسیدگی بسته به نوع دعوا و مرجع قضایی متفاوت است. دعاوی ساده در شورای حل اختلاف ۱ تا ۳ ماه و در دادگاه عمومی ۳ تا ۱۲ ماه زمان می‌برد." },
      { q: "آیا امکان مطالبه خسارت تأخیر تأدیه وجود دارد؟", a: "بله، طبق ماده ۵۲۲ قانون آیین دادرسی مدنی، در صورت مطالبه دائن و تمکن مدیون، خسارت تأخیر تأدیه بر اساس شاخص بهای کالا و خدمات بانک مرکزی محاسبه می‌شود." },
      { q: "برای طرح دعوای حقوقی چه مدارکی لازم است؟", a: "مدارک شناسایی (کارت ملی)، مستندات مربوط به دعوا (قرارداد، چک، سند ملک و غیره)، و شهادت شهود در صورت لزوم. وکیل شما مدارک دقیق مورد نیاز را تعیین می‌کند." },
    ],
    faqsEN: [
      { q: "How much does a civil litigation lawyer cost?", a: "Attorney fees vary depending on the type and complexity of the case. The first consultation is free, and costs are transparently disclosed after case review." },
      { q: "How long does a civil case take?", a: "Processing time varies by case type and judicial authority. Simple cases at the Dispute Resolution Council take 1-3 months, and at general courts 3-12 months." },
      { q: "Can late payment damages be claimed?", a: "Yes, according to Article 522 of the Civil Procedure Code, if the creditor demands and the debtor is capable, late payment damages are calculated based on the CBI price index." },
      { q: "What documents are needed to file a civil case?", a: "Identification documents (national ID), case-related evidence (contract, check, property deed, etc.), and witness testimony if needed. Your lawyer will determine the exact documents required." },
    ],
    keywordsFA: ["وکیل حقوقی", "وکیل مدنی", "وکیل دعاوی حقوقی", "مطالبه خسارت", "دعاوی قراردادی", "وکیل ملکی تهران", "وکیل پایه یک"],
    keywordsEN: ["civil lawyer", "civil litigation attorney", "damage claims lawyer", "contract disputes", "property lawyer Tehran"],
  },
  {
    slug: "criminal",
    icon: Shield,
    titleFA: "وکیل دعاوی کیفری",
    titleEN: "Criminal Defense Lawyer",
    metaTitleFA: "وکیل کیفری در تهران | دفاع تخصصی در پرونده‌های جنایی | دادپروران",
    metaTitleEN: "Criminal Defense Lawyer in Tehran | Dadparvaraan Mehr Iran",
    metaDescFA: "وکیل متخصص دعاوی کیفری: کلاهبرداری، خیانت در امانت، جرائم رایانه‌ای و سایبری. دفاع حرفه‌ای از حقوق متهم و شاکی.",
    metaDescEN: "Expert criminal defense attorney: fraud, embezzlement, cybercrime. Professional defense of accused and complainant rights.",
    heroDescFA: "دفاع تخصصی و حرفه‌ای از حقوق موکلین در پرونده‌های کیفری با تجربه گسترده در دادسراها و دادگاه‌های کیفری.",
    heroDescEN: "Specialized and professional defense of clients' rights in criminal cases with extensive experience in prosecution offices and criminal courts.",
    contentFA: [
      "پرونده‌های کیفری از حساس‌ترین دعاوی قضایی هستند که عدم رسیدگی صحیح به آنها می‌تواند عواقب جبران‌ناپذیری مانند حبس، جریمه نقدی سنگین و محرومیت از حقوق اجتماعی به دنبال داشته باشد.",
      "تیم وکلای کیفری مؤسسه دادپروران مهر ایران با تجربه طولانی در دادسراها و دادگاه‌های کیفری تهران، هم در مقام دفاع از متهم و هم در مقام وکالت شاکی، خدمات تخصصی ارائه می‌دهند.",
      "از مرحله تحقیقات مقدماتی در دادسرا تا مرحله تجدیدنظر و اعاده دادرسی، وکلای ما با دانش به‌روز از قوانین و رویه قضایی، بهترین استراتژی دفاعی را برای پرونده شما تدوین می‌کنند.",
    ],
    contentEN: [
      "Criminal cases are among the most sensitive judicial proceedings, where improper handling can lead to irreversible consequences such as imprisonment, heavy fines, and deprivation of social rights.",
      "The criminal law team at Dadparvaraan Mehr Iran Institute, with long experience in Tehran prosecution offices and criminal courts, provides specialized services both in defense of the accused and on behalf of complainants.",
      "From preliminary investigations at the prosecution office to appeal and retrial stages, our lawyers with up-to-date knowledge of laws and judicial procedures develop the best defense strategy for your case.",
    ],
    pointsFA: [
      "کلاهبرداری و جعل اسناد",
      "خیانت در امانت و اختلاس",
      "سرقت و تصرف عدوانی",
      "جرائم رایانه‌ای و سایبری",
      "توهین و نشر اکاذیب",
      "صدور چک بلامحل",
      "ضرب و جرح و قتل",
      "جرائم مواد مخدر",
    ],
    pointsEN: [
      "Fraud and document forgery",
      "Breach of trust and embezzlement",
      "Theft and trespass",
      "Computer and cyber crimes",
      "Defamation and slander",
      "Bounced check issuance",
      "Assault, battery and homicide",
      "Drug-related offenses",
    ],
    faqsFA: [
      { q: "آیا در مرحله دادسرا نیاز به وکیل دارم؟", a: "بله، حضور وکیل در مرحله تحقیقات مقدماتی بسیار مهم است. اظهارات شما در این مرحله مبنای تصمیم‌گیری قضایی قرار می‌گیرد و داشتن وکیل از بیان اظهارات نادرست جلوگیری می‌کند." },
      { q: "تفاوت شکایت کیفری و دعوای حقوقی چیست؟", a: "در شکایت کیفری، عمل مجرمانه‌ای رخ داده و مجازات متهم (حبس، جریمه) مطرح است. در دعوای حقوقی، هدف جبران خسارت مالی است. گاهی هر دو به صورت همزمان قابل طرح هستند." },
      { q: "آیا امکان آزادی با قرار وثیقه وجود دارد؟", a: "بله، بسته به نوع جرم و شرایط پرونده، وکیل می‌تواند درخواست صدور قرار وثیقه، کفالت یا التزام به حضور نماید تا موکل در طول رسیدگی آزاد باشد." },
    ],
    faqsEN: [
      { q: "Do I need a lawyer at the prosecution stage?", a: "Yes, having a lawyer during preliminary investigations is crucial. Your statements at this stage form the basis of judicial decisions, and a lawyer prevents making incorrect statements." },
      { q: "What is the difference between a criminal complaint and civil lawsuit?", a: "In a criminal complaint, a criminal act has occurred and the accused faces punishment (prison, fine). In a civil lawsuit, the goal is financial compensation. Sometimes both can be filed simultaneously." },
      { q: "Is bail release possible?", a: "Yes, depending on the type of crime and case circumstances, a lawyer can request bail, surety, or appearance bond so the client remains free during proceedings." },
    ],
    keywordsFA: ["وکیل کیفری", "وکیل کیفری تهران", "وکیل جرائم سایبری", "وکیل کلاهبرداری", "دفاع از متهم", "وکیل دادسرا"],
    keywordsEN: ["criminal lawyer", "criminal defense attorney Tehran", "cybercrime lawyer", "fraud defense lawyer"],
  },
  {
    slug: "family",
    icon: Heart,
    titleFA: "وکیل خانواده و طلاق",
    titleEN: "Family & Divorce Lawyer",
    metaTitleFA: "وکیل خانواده و طلاق در تهران | مهریه، حضانت، نفقه | دادپروران",
    metaTitleEN: "Family & Divorce Lawyer in Tehran | Dadparvaraan Mehr Iran",
    metaDescFA: "وکیل متخصص دعاوی خانوادگی: طلاق توافقی و یکطرفه، مطالبه مهریه، حضانت فرزند، نفقه و ارث. مشاوره محرمانه و رایگان.",
    metaDescEN: "Expert family law attorney: consensual and unilateral divorce, dowry claims, child custody, alimony and inheritance. Confidential free consultation.",
    heroDescFA: "حل و فصل دعاوی خانوادگی با حفظ حریم خصوصی و احترام به کرامت خانواده، همراه با مشاوره محرمانه و حرفه‌ای.",
    heroDescEN: "Resolving family disputes while preserving privacy and respecting family dignity, with confidential and professional consultation.",
    contentFA: [
      "دعاوی خانوادگی از حساس‌ترین موضوعات حقوقی هستند که نیازمند برخورد ظریف و تخصصی هستند. تصمیمات اتخاذ شده در این دعاوی تأثیر مستقیم بر زندگی افراد خانواده، به ویژه فرزندان دارد.",
      "مؤسسه دادپروران مهر ایران با درک عمیق از قوانین خانواده و رویه دادگاه‌های خانواده، خدمات تخصصی در تمامی شاخه‌های حقوق خانواده ارائه می‌دهد. هدف ما حفظ حقوق موکل با حداقل آسیب به بنیان خانواده است.",
      "از مشاوره پیش از طلاق تا اجرای احکام مربوط به مهریه و حضانت، تیم ما با رویکردی مسئولانه و انسانی، بهترین راه‌حل حقوقی را برای شما پیدا می‌کند.",
    ],
    contentEN: [
      "Family disputes are among the most sensitive legal matters requiring delicate and specialized handling. Decisions made in these cases directly impact family members' lives, especially children.",
      "Dadparvaraan Mehr Iran Institute, with deep understanding of family law and family court procedures, provides specialized services in all branches of family law. Our goal is to protect client rights with minimum damage to family foundations.",
      "From pre-divorce consultation to enforcement of dowry and custody judgments, our team finds the best legal solution with a responsible and humane approach.",
    ],
    pointsFA: [
      "طلاق توافقی و طلاق یکطرفه",
      "مطالبه مهریه و اجرای مهریه",
      "حضانت و ملاقات فرزند",
      "نفقه زوجه و فرزندان",
      "استرداد جهیزیه",
      "تقسیم اموال مشترک",
      "ثبت ازدواج و انحلال نکاح",
      "ارث و تقسیم ترکه",
    ],
    pointsEN: [
      "Consensual and unilateral divorce",
      "Dowry claims and enforcement",
      "Child custody and visitation rights",
      "Spousal and child support (alimony)",
      "Dowry goods (Jahizieh) recovery",
      "Division of marital assets",
      "Marriage registration and annulment",
      "Inheritance and estate division",
    ],
    faqsFA: [
      { q: "شرایط طلاق توافقی چیست؟", a: "در طلاق توافقی، زوجین در مورد کلیه مسائل از جمله مهریه، حضانت فرزند، نفقه و تقسیم اموال توافق کرده و با مراجعه به دادگاه خانواده، حکم طلاق صادر می‌شود." },
      { q: "مهریه چگونه به نرخ روز محاسبه می‌شود؟", a: "مهریه وجه نقد بر اساس شاخص بهای کالاها و خدمات مصرفی بانک مرکزی از سال ازدواج تا سال مطالبه محاسبه می‌شود. از ماشین‌حساب مهریه سایت ما می‌توانید مبلغ تقریبی را محاسبه کنید." },
      { q: "حضانت فرزند با چه کسی است؟", a: "طبق قانون، حضانت فرزند پسر تا ۷ سالگی و فرزند دختر تا ۷ سالگی با مادر است. پس از آن حضانت با پدر است، مگر دادگاه مصلحت فرزند را در حضانت مادر تشخیص دهد." },
      { q: "آیا زن می‌تواند بدون اجازه شوهر تقاضای طلاق کند؟", a: "بله، زن می‌تواند با استناد به شروط ضمن عقد (مندرج در سند ازدواج) یا عسر و حرج، از دادگاه تقاضای طلاق نماید. وکیل متخصص خانواده بهترین مسیر قانونی را تعیین می‌کند." },
    ],
    faqsEN: [
      { q: "What are the conditions for consensual divorce?", a: "In consensual divorce, both spouses agree on all matters including dowry, child custody, alimony and property division, and the divorce decree is issued by the family court." },
      { q: "How is dowry calculated at current rate?", a: "Cash dowry is calculated based on the CBI consumer price index from the year of marriage to the year of claim. You can use our website's dowry calculator for an approximate amount." },
      { q: "Who gets child custody?", a: "By law, custody of sons and daughters up to age 7 is with the mother. After that, custody goes to the father, unless the court determines the child's best interest lies with the mother." },
      { q: "Can a wife request divorce without husband's permission?", a: "Yes, a wife can request divorce from the court based on marriage contract conditions or hardship and harm. A family law specialist determines the best legal path." },
    ],
    keywordsFA: ["وکیل خانواده", "وکیل طلاق", "وکیل مهریه", "وکیل حضانت", "طلاق توافقی", "نفقه", "وکیل خانواده تهران"],
    keywordsEN: ["family lawyer", "divorce lawyer Tehran", "child custody attorney", "alimony lawyer", "dowry lawyer"],
  },
  {
    slug: "commercial",
    icon: Building2,
    titleFA: "وکیل حقوق تجاری و شرکتی",
    titleEN: "Commercial & Corporate Lawyer",
    metaTitleFA: "وکیل حقوق تجاری و ثبت شرکت در تهران | دادپروران مهر ایران",
    metaTitleEN: "Commercial & Corporate Lawyer in Tehran | Dadparvaraan Mehr Iran",
    metaDescFA: "وکیل متخصص حقوق تجاری: ثبت شرکت، تنظیم قراردادهای تجاری، دعاوی شرکتی و قراردادهای بین‌المللی. مشاوره تخصصی.",
    metaDescEN: "Expert commercial law attorney: company registration, commercial contracts, corporate disputes and international agreements.",
    heroDescFA: "مشاوره و خدمات حقوقی تخصصی برای کسب‌وکارها، شرکت‌ها و فعالان اقتصادی در حوزه حقوق تجاری.",
    heroDescEN: "Specialized legal consultation and services for businesses, corporations and economic entities in commercial law.",
    contentFA: [
      "حقوق تجاری یکی از شاخه‌های مهم و تخصصی حقوق است که ناظر بر روابط تجاری اشخاص حقیقی و حقوقی می‌باشد. عدم آگاهی از قوانین تجاری می‌تواند خسارات سنگینی به کسب‌وکارها وارد کند.",
      "مؤسسه دادپروران مهر ایران با تیمی متخصص در حقوق تجاری، خدمات جامعی از ثبت شرکت تا حل اختلافات تجاری پیچیده ارائه می‌دهد. ما به عنوان مشاور حقوقی، شرکت شما را در تمامی مراحل فعالیت تجاری همراهی می‌کنیم.",
    ],
    contentEN: [
      "Commercial law is an important and specialized branch of law governing the commercial relations of individuals and legal entities. Lack of awareness of commercial laws can cause significant damage to businesses.",
      "Dadparvaraan Mehr Iran Institute, with a team specialized in commercial law, provides comprehensive services from company registration to resolving complex commercial disputes.",
    ],
    pointsFA: [
      "ثبت شرکت و تغییرات شرکتی",
      "تنظیم قراردادهای تجاری داخلی",
      "قراردادهای بین‌المللی",
      "دعاوی شرکتی و سهامداران",
      "ثبت برند و علامت تجاری",
      "ورشکستگی و تصفیه شرکت",
      "حقوق بانکی و بیمه",
      "داوری تجاری",
    ],
    pointsEN: [
      "Company registration and corporate changes",
      "Domestic commercial contract drafting",
      "International agreements",
      "Corporate and shareholder disputes",
      "Brand and trademark registration",
      "Bankruptcy and company liquidation",
      "Banking and insurance law",
      "Commercial arbitration",
    ],
    faqsFA: [
      { q: "برای ثبت شرکت چه مدارکی لازم است؟", a: "کارت ملی و شناسنامه مؤسسین، گواهی عدم سوءپیشینه، اساسنامه و اظهارنامه شرکت. تیم ما تمامی مراحل ثبت را انجام می‌دهد." },
      { q: "تفاوت شرکت سهامی و مسئولیت محدود چیست؟", a: "در شرکت سهامی، سرمایه به سهام تقسیم می‌شود و مسئولیت سهامداران محدود به مبلغ اسمی سهام است. در شرکت مسئولیت محدود، مسئولیت شرکا به نسبت سهم‌الشرکه آنهاست." },
      { q: "آیا برای قرارداد تجاری حتماً باید به وکیل مراجعه کرد؟", a: "توصیه اکید می‌شود. قراردادهای تجاری بدون بررسی حقوقی می‌توانند ریسک‌های بزرگی ایجاد کنند. وکیل تجاری بندهای حیاتی مانند فسخ، خسارت و حل اختلاف را بررسی می‌کند." },
    ],
    faqsEN: [
      { q: "What documents are needed for company registration?", a: "Founders' national ID cards and birth certificates, criminal record clearance, articles of incorporation. Our team handles all registration steps." },
      { q: "What is the difference between a joint-stock and LLC?", a: "In a joint-stock company, capital is divided into shares with limited liability. In an LLC, partners' liability is proportional to their share contribution." },
      { q: "Is a lawyer necessary for commercial contracts?", a: "Strongly recommended. Commercial contracts without legal review can create significant risks. A commercial lawyer reviews critical clauses like termination, damages and dispute resolution." },
    ],
    keywordsFA: ["وکیل تجاری", "ثبت شرکت", "وکیل شرکتی", "قرارداد تجاری", "وکیل تجاری تهران", "حقوق شرکتی"],
    keywordsEN: ["commercial lawyer", "company registration lawyer", "corporate attorney", "business lawyer Tehran"],
  },
  {
    slug: "property",
    icon: Home,
    titleFA: "وکیل امور ملکی و ثبتی",
    titleEN: "Property & Real Estate Lawyer",
    metaTitleFA: "وکیل ملکی در تهران | دعاوی ملکی و ثبتی | دادپروران مهر ایران",
    metaTitleEN: "Property & Real Estate Lawyer in Tehran | Dadparvaraan Mehr Iran",
    metaDescFA: "وکیل متخصص دعاوی ملکی: خرید و فروش ملک، تخلیه، سند رسمی، دعاوی زمین و اختلافات ملکی. مشاوره رایگان.",
    metaDescEN: "Expert property law attorney: real estate transactions, eviction, title deeds, land disputes. Free consultation.",
    heroDescFA: "حل تخصصی اختلافات ملکی و ثبتی با تکیه بر دانش عمیق از قوانین ثبت اسناد و املاک.",
    heroDescEN: "Specialized resolution of property and registration disputes based on deep knowledge of deed and property registration laws.",
    contentFA: [
      "دعاوی ملکی و ثبتی از پرتکرارترین و پرارزش‌ترین پرونده‌های قضایی هستند. با توجه به ارزش بالای املاک و پیچیدگی قوانین ثبتی، داشتن وکیل متخصص در این حوزه ضروری است.",
      "تیم ما با تسلط کامل بر قوانین ثبت اسناد و املاک، قانون مدنی و رویه دادگاه‌ها، خدمات جامعی در تمامی شاخه‌های حقوق ملکی ارائه می‌دهد.",
    ],
    contentEN: [
      "Property and registration disputes are among the most frequent and high-value judicial cases. Given the high value of properties and complexity of registration laws, having a specialist attorney is essential.",
      "Our team, with complete mastery of deed and property registration laws, civil law and court procedures, provides comprehensive services in all branches of property law.",
    ],
    pointsFA: [
      "خرید و فروش ملک و تنظیم مبایعه‌نامه",
      "الزام به تنظیم سند رسمی",
      "تخلیه مستأجر و فسخ اجاره",
      "اختلافات مشاعی و تقسیم ملک",
      "دعاوی زمین و تصرف عدوانی",
      "ابطال معامله و فسخ قرارداد",
      "افراز و تفکیک ملک",
      "رفع تصرف و خلع ید",
    ],
    pointsEN: [
      "Property purchase/sale and contract drafting",
      "Mandatory official deed registration",
      "Tenant eviction and lease termination",
      "Co-ownership disputes and property division",
      "Land disputes and trespass",
      "Transaction annulment and contract rescission",
      "Property subdivision and separation",
      "Possession removal and dispossession",
    ],
    faqsFA: [
      { q: "اگر فروشنده از تنظیم سند رسمی خودداری کند چه باید کرد؟", a: "می‌توانید دعوای الزام به تنظیم سند رسمی مطرح کنید. دادگاه در صورت احراز مالکیت شما، فروشنده را ملزم به انتقال سند می‌کند." },
      { q: "مدت قانونی تخلیه مستأجر پس از پایان اجاره چقدر است؟", a: "طبق قانون ۱۳۷۶، پس از پایان مدت اجاره و ارسال اظهارنامه، مستأجر باید ظرف مدت تعیین شده ملک را تخلیه کند. در صورت استنکاف، از طریق دادگاه اقدام می‌شود." },
      { q: "مبایعه‌نامه عادی چقدر اعتبار دارد؟", a: "مبایعه‌نامه عادی بین طرفین معتبر است ولی در برابر اشخاص ثالث، سند رسمی ملاک است. توصیه می‌شود حتماً سند رسمی تنظیم شود." },
    ],
    faqsEN: [
      { q: "What if the seller refuses to register the official deed?", a: "You can file a lawsuit for mandatory official deed registration. The court, upon establishing your ownership, obliges the seller to transfer the deed." },
      { q: "What is the legal period for tenant eviction after lease expiry?", a: "Under the 1997 law, after lease expiry and sending a notice, the tenant must vacate within the specified period. If they refuse, action is taken through the court." },
      { q: "How valid is an informal sale agreement?", a: "An informal agreement is valid between the parties but against third parties, the official deed prevails. It is recommended to always register an official deed." },
    ],
    keywordsFA: ["وکیل ملکی", "وکیل ملکی تهران", "دعاوی ملکی", "تنظیم سند", "تخلیه ملک", "وکیل زمین", "خرید و فروش ملک"],
    keywordsEN: ["property lawyer", "real estate attorney Tehran", "property disputes", "eviction lawyer"],
  },
  {
    slug: "documents",
    icon: FileText,
    titleFA: "تنظیم اوراق و اسناد قضایی",
    titleEN: "Legal Document Preparation",
    metaTitleFA: "تنظیم دادخواست، شکواییه و لوایح قضایی | دادپروران مهر ایران",
    metaTitleEN: "Legal Document Preparation | Petitions & Legal Briefs | Dadparvaraan",
    metaDescFA: "تنظیم حرفه‌ای دادخواست، شکواییه، اظهارنامه، لایحه دفاعیه و انواع اسناد حقوقی توسط وکلای متخصص.",
    metaDescEN: "Professional preparation of petitions, complaints, legal notices, defense briefs and all legal documents by expert attorneys.",
    heroDescFA: "تنظیم حرفه‌ای و تخصصی انواع اوراق قضایی و اسناد حقوقی با رعایت کامل اصول فنی و قانونی.",
    heroDescEN: "Professional and specialized preparation of all judicial papers and legal documents with full compliance to technical and legal principles.",
    contentFA: [
      "تنظیم صحیح اوراق قضایی یکی از مهم‌ترین عوامل موفقیت در دعاوی حقوقی و کیفری است. یک دادخواست یا شکواییه ناقص می‌تواند منجر به رد دعوا یا از دست رفتن حقوق شما شود.",
      "مؤسسه دادپروران مهر ایران با تیمی مجرب در تنظیم انواع اوراق قضایی، اطمینان حاصل می‌کند که اسناد شما از نظر شکلی و ماهوی کاملاً صحیح و مؤثر باشند.",
    ],
    contentEN: [
      "Proper preparation of judicial papers is one of the most important factors for success in legal and criminal cases. An incomplete petition or complaint can lead to case dismissal or loss of your rights.",
      "Dadparvaraan Mehr Iran Institute, with an experienced team in preparing all types of judicial papers, ensures your documents are formally and substantively correct and effective.",
    ],
    pointsFA: [
      "تنظیم دادخواست حقوقی",
      "تنظیم شکواییه کیفری",
      "اظهارنامه رسمی",
      "لایحه دفاعیه و تجدیدنظرخواهی",
      "قراردادهای حقوقی",
      "وصیت‌نامه و اقرارنامه",
      "صورتجلسات شرکتی",
      "اسناد ملکی و تجاری",
    ],
    pointsEN: [
      "Civil petition drafting",
      "Criminal complaint preparation",
      "Official legal notices",
      "Defense briefs and appeals",
      "Legal contracts",
      "Wills and declarations",
      "Corporate minutes",
      "Property and commercial documents",
    ],
    faqsFA: [
      { q: "هزینه تنظیم دادخواست چقدر است؟", a: "هزینه بسته به نوع و پیچیدگی دعوا متفاوت است. برای اطلاع از هزینه دقیق، با ما تماس بگیرید. جلسه مشاوره اولیه رایگان است." },
      { q: "آیا خودم می‌توانم دادخواست تنظیم کنم؟", a: "قانوناً بله، اما تنظیم نادرست دادخواست می‌تواند منجر به رد دعوا شود. توصیه می‌شود حتماً از وکیل یا مشاور حقوقی کمک بگیرید." },
      { q: "تفاوت دادخواست و شکواییه چیست؟", a: "دادخواست برای دعاوی حقوقی (مطالبه خسارت، الزام به ایفای تعهد) و شکواییه برای شکایات کیفری (کلاهبرداری، سرقت) استفاده می‌شود." },
    ],
    faqsEN: [
      { q: "How much does petition drafting cost?", a: "Cost varies by type and complexity. Contact us for exact pricing. Initial consultation is free." },
      { q: "Can I draft a petition myself?", a: "Legally yes, but improper drafting can lead to case dismissal. We recommend using a lawyer or legal consultant." },
      { q: "What is the difference between a petition and a complaint?", a: "Petitions are for civil cases (damage claims, obligation enforcement) and complaints are for criminal cases (fraud, theft)." },
    ],
    keywordsFA: ["تنظیم دادخواست", "تنظیم شکواییه", "اظهارنامه", "لایحه دفاعیه", "اوراق قضایی", "تنظیم قرارداد"],
    keywordsEN: ["legal document preparation", "petition drafting", "complaint preparation", "legal briefs"],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // خدمات کسب‌وکارها (Business Services) — parent
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "business",
    icon: Briefcase,
    titleFA: "خدمات حقوقی کسب‌وکارها",
    titleEN: "Business Legal Services",
    metaTitleFA: "خدمات حقوقی کسب‌وکارها و شرکت‌ها | دادپروران مهر ایران",
    metaTitleEN: "Business & Corporate Legal Services | Dadparvaraan Mehr Iran",
    metaDescFA: "خدمات حقوقی جامع برای کسب‌وکارها: دپارتمان حقوقی برون‌سپاری، تنظیم و بررسی قراردادها، وصول مطالبات و مشاوره تجاری تخصصی.",
    metaDescEN: "Comprehensive legal services for businesses: outsourced legal department, contract drafting & review, debt collection and expert commercial consultation.",
    heroDescFA: "مؤسسه دادپروران مهر ایران با ارائه خدمات حقوقی تخصصی، شریک حقوقی قابل‌اتکای کسب‌وکار شماست.",
    heroDescEN: "Dadparvaraan Mehr Iran provides specialized legal services as your reliable legal partner for business.",
    contentFA: [
      "کسب‌وکارها در هر مرحله از فعالیت خود با مسائل حقوقی متعددی روبرو هستند — از تنظیم قراردادهای تجاری و استخدامی گرفته تا حل اختلافات تجاری و وصول مطالبات. نداشتن مشاور حقوقی متخصص می‌تواند هزینه‌های سنگینی به شرکت تحمیل کند.",
      "مؤسسه حقوقی دادپروران مهر ایران با درک نیازهای حقوقی کسب‌وکارهای کوچک و بزرگ، بسته‌های خدماتی متنوعی ارائه می‌دهد. از دپارتمان حقوقی برون‌سپاری‌شده برای شرکت‌هایی که واحد حقوقی ندارند تا خدمات تخصصی قراردادی و وصول مطالبات.",
      "هدف ما این است که صاحبان کسب‌وکار بدون نگرانی از ریسک‌های حقوقی، روی رشد کسب‌وکار خود تمرکز کنند.",
    ],
    contentEN: [
      "Businesses face numerous legal issues at every stage — from drafting commercial and employment contracts to resolving trade disputes and debt collection.",
      "Dadparvaraan Mehr Iran Legal Institute offers diverse service packages for small and large businesses, from outsourced legal departments to specialized contract and debt collection services.",
    ],
    pointsFA: ["دپارتمان حقوقی برون‌سپاری‌شده", "خدمات حقوقی شرکت‌ها", "تنظیم قراردادهای تجاری", "بررسی و ممیزی قراردادها", "وصول مطالبات سازمانی", "مشاوره حقوقی استخدامی", "حل اختلافات تجاری", "داوری و میانجی‌گری"],
    pointsEN: ["Outsourced legal department", "Corporate legal services", "Commercial contract drafting", "Contract review & audit", "Organizational debt collection", "Employment legal consulting", "Commercial dispute resolution", "Arbitration & mediation"],
    faqsFA: [
      { q: "آیا شرکت‌های کوچک هم نیاز به خدمات حقوقی دارند؟", a: "بله. حتی یک قرارداد نادرست می‌تواند خسارت جبران‌ناپذیری به کسب‌وکار کوچک وارد کند. خدمات حقوقی پیشگیرانه بسیار کم‌هزینه‌تر از پرونده‌های قضایی است." },
      { q: "هزینه دپارتمان حقوقی برون‌سپاری چقدر است؟", a: "هزینه بر اساس حجم نیاز حقوقی شرکت، تعداد قراردادها و پرونده‌ها تعیین می‌شود. بسته‌های ماهانه با قیمت مناسب در دسترس است." },
      { q: "چه تفاوتی بین مشاوره حقوقی و وکالت وجود دارد؟", a: "مشاوره حقوقی شامل راهنمایی و اظهارنظر کارشناسی است. وکالت یعنی نمایندگی رسمی شما در مراجع قضایی و اداری. مؤسسه ما هر دو خدمت را ارائه می‌دهد." },
    ],
    faqsEN: [
      { q: "Do small businesses need legal services?", a: "Yes. Even one incorrect contract can cause irreparable damage. Preventive legal services cost far less than lawsuits." },
      { q: "How much does an outsourced legal department cost?", a: "Cost is based on the company's legal needs volume. Monthly packages are available at reasonable prices." },
    ],
    keywordsFA: ["خدمات حقوقی شرکت", "مشاوره حقوقی کسب‌وکار", "وکیل شرکت", "دپارتمان حقوقی", "حقوق تجاری"],
    keywordsEN: ["business legal services", "corporate lawyer", "outsourced legal", "commercial law"],
  },
  // ── زیرتخصص‌های کسب‌وکار ──
  {
    slug: "outsourced-legal",
    parentSlug: "business",
    icon: Building2,
    titleFA: "دپارتمان حقوقی برون‌سپاری‌شده",
    titleEN: "Outsourced Legal Department",
    metaTitleFA: "دپارتمان حقوقی برون‌سپاری شده | واحد حقوقی برای شرکت شما | دادپروران",
    metaTitleEN: "Outsourced Legal Department for Your Company | Dadparvaraan",
    metaDescFA: "واحد حقوقی اختصاصی برای شرکت شما بدون نیاز به استخدام وکیل تمام‌وقت. مشاوره، تنظیم قرارداد، پیگیری دعاوی و نظارت حقوقی.",
    metaDescEN: "Dedicated legal unit for your company without hiring full-time counsel. Consultation, contract drafting, litigation and legal oversight.",
    heroDescFA: "واحد حقوقی حرفه‌ای و اختصاصی برای شرکت شما — بدون هزینه استخدام وکیل تمام‌وقت.",
    heroDescEN: "Professional dedicated legal unit for your company — without the cost of hiring full-time counsel.",
    contentFA: [
      "بسیاری از شرکت‌های کوچک و متوسط توانایی یا نیاز به استخدام وکیل تمام‌وقت ندارند، اما مسائل حقوقی روزمره آنها نیاز به نظارت مستمر دارد. دپارتمان حقوقی برون‌سپاری‌شده، راه‌حلی حرفه‌ای و مقرون‌به‌صرفه برای این نیاز است.",
      "با اشتراک در این سرویس، تیم وکلای مؤسسه دادپروران مهر ایران به عنوان واحد حقوقی شرکت شما عمل می‌کنند: قراردادها را بررسی و تنظیم می‌کنند، مکاتبات حقوقی را انجام می‌دهند، در جلسات تجاری شرکت می‌کنند و در صورت بروز اختلاف، نمایندگی حقوقی شرکت را بر عهده می‌گیرند.",
      "این مدل به شما امکان می‌دهد با هزینه‌ای بسیار کمتر از استخدام وکیل داخلی، از خدمات یک تیم حقوقی متخصص بهره‌مند شوید.",
    ],
    contentEN: [
      "Many SMEs don't need or can't afford full-time in-house counsel, yet their daily legal matters require ongoing oversight. An outsourced legal department is a professional, cost-effective solution.",
      "By subscribing, Dadparvaraan's legal team acts as your company's legal unit — reviewing contracts, handling correspondence, attending meetings, and representing your company in disputes.",
    ],
    pointsFA: ["بررسی و تنظیم قراردادها", "مکاتبات و اظهارنامه‌های حقوقی", "مشاوره حقوقی تلفنی و حضوری", "نمایندگی در مراجع قضایی", "نظارت بر تعهدات قراردادی", "آموزش حقوقی کارکنان", "مدیریت ریسک حقوقی", "گزارش‌دهی دوره‌ای حقوقی"],
    pointsEN: ["Contract review & drafting", "Legal correspondence", "Phone & in-person consultation", "Judicial representation", "Contract obligation monitoring", "Staff legal training", "Legal risk management", "Periodic legal reporting"],
    faqsFA: [
      { q: "این سرویس مناسب چه شرکت‌هایی است؟", a: "شرکت‌هایی با ۵ تا ۲۰۰ نفر نیرو که واحد حقوقی داخلی ندارند و نیاز به مشاوره و نظارت حقوقی مستمر دارند." },
      { q: "آیا وکیل به صورت حضوری در شرکت حضور دارد؟", a: "بسته به نوع بسته اشتراکی، حضور حضوری هفتگی یا ماهانه تنظیم می‌شود. مشاوره تلفنی و آنلاین نامحدود است." },
      { q: "آیا نمایندگی در دادگاه هم شامل می‌شود؟", a: "بله. در صورت بروز دعوای قضایی، وکلای مؤسسه به عنوان نماینده حقوقی شرکت در دادگاه حاضر می‌شوند." },
    ],
    faqsEN: [
      { q: "What companies is this suitable for?", a: "Companies with 5-200 employees without in-house legal units needing ongoing legal oversight." },
      { q: "Does the lawyer physically attend the office?", a: "Depending on the package, weekly or monthly visits are scheduled. Phone and online consultation is unlimited." },
    ],
    keywordsFA: ["دپارتمان حقوقی", "برون‌سپاری حقوقی", "واحد حقوقی شرکت", "مشاور حقوقی شرکت", "وکیل شرکت"],
    keywordsEN: ["outsourced legal", "legal department", "corporate counsel", "business lawyer"],
  },
  {
    slug: "corporate-legal",
    parentSlug: "business",
    icon: Building2,
    titleFA: "خدمات حقوقی شرکت‌ها",
    titleEN: "Corporate Legal Services",
    metaTitleFA: "خدمات حقوقی شرکت‌ها | ثبت شرکت و مشاوره تجاری | دادپروران",
    metaTitleEN: "Corporate Legal Services | Company Registration | Dadparvaraan",
    metaDescFA: "خدمات حقوقی تخصصی شرکت‌ها: ثبت و تغییرات شرکت، تنظیم اساسنامه، مجامع عمومی، افزایش سرمایه و انحلال شرکت.",
    metaDescEN: "Specialized corporate services: registration, articles of incorporation, general assemblies, capital increase and dissolution.",
    heroDescFA: "خدمات حقوقی کامل از تأسیس تا اداره و تغییرات شرکت — با تیم متخصص حقوق تجاری.",
    heroDescEN: "Complete corporate legal services from establishment to management and company changes.",
    contentFA: [
      "شرکت‌ها از بدو تأسیس تا مراحل رشد و توسعه و حتی انحلال، با مسائل حقوقی متعددی روبرو هستند. انتخاب نوع شرکت، تنظیم اساسنامه، برگزاری مجامع عمومی، تغییرات سهامداران و مدیران — همه نیازمند مشاوره حقوقی تخصصی هستند.",
      "مؤسسه دادپروران مهر ایران با دانش عمیق از قانون تجارت و آیین‌نامه‌های ثبت شرکت‌ها، خدمات جامعی برای شرکت‌های سهامی، با مسئولیت محدود، تضامنی و سایر اشکال حقوقی ارائه می‌دهد.",
    ],
    contentEN: [
      "Companies face numerous legal issues from establishment through growth and even dissolution. Corporate type selection, articles drafting, assemblies, shareholder changes — all require expert counsel.",
    ],
    pointsFA: ["ثبت شرکت سهامی و مسئولیت محدود", "تنظیم و اصلاح اساسنامه", "برگزاری مجامع عمومی", "تغییر مدیران و سهامداران", "افزایش و کاهش سرمایه", "ثبت شعبه و نمایندگی", "ادغام و تملک شرکت‌ها", "انحلال و تصفیه"],
    pointsEN: ["Company registration", "Articles drafting", "General assemblies", "Director changes", "Capital changes", "Branch registration", "Mergers & acquisitions", "Dissolution"],
    faqsFA: [
      { q: "بهترین نوع شرکت برای کسب‌وکار من کدام است؟", a: "انتخاب بین سهامی خاص، مسئولیت محدود یا سایر اشکال به عواملی مانند تعداد شرکا، نوع فعالیت و حجم سرمایه بستگی دارد. مشاوران ما بهترین گزینه را پیشنهاد می‌دهند." },
      { q: "مدت زمان ثبت شرکت چقدر است؟", a: "با آماده بودن مدارک، ثبت شرکت معمولاً ۷ تا ۱۴ روز کاری زمان می‌برد." },
    ],
    faqsEN: [
      { q: "What type of company is best for my business?", a: "The choice depends on partner count, activity type and capital volume. Our consultants recommend the best option." },
    ],
    keywordsFA: ["خدمات حقوقی شرکت", "ثبت شرکت", "اساسنامه", "مجمع عمومی", "وکیل شرکت‌ها"],
    keywordsEN: ["corporate legal services", "company registration", "articles of incorporation"],
  },
  {
    slug: "contract-drafting",
    parentSlug: "business",
    icon: FilePen,
    titleFA: "تنظیم قرارداد",
    titleEN: "Contract Drafting",
    metaTitleFA: "تنظیم قرارداد حرفه‌ای | قرارداد تجاری و استخدامی | دادپروران",
    metaTitleEN: "Professional Contract Drafting | Dadparvaraan Mehr Iran",
    metaDescFA: "تنظیم حرفه‌ای انواع قراردادها: تجاری، استخدامی، مشارکتی، پیمانکاری و بین‌المللی. حفظ منافع شما با بندهای حقوقی دقیق.",
    metaDescEN: "Professional drafting of all contract types: commercial, employment, partnership, construction and international agreements.",
    heroDescFA: "تنظیم قراردادهای حرفه‌ای و محکم حقوقی — محافظت از منافع شما در هر معامله.",
    heroDescEN: "Professional and robust contract drafting — protecting your interests in every transaction.",
    contentFA: [
      "قرارداد، ستون فقرات هر رابطه تجاری و حقوقی است. یک قرارداد خوب نه تنها حقوق و تعهدات طرفین را مشخص می‌کند، بلکه راه‌حل‌های از پیش تعیین‌شده برای اختلافات احتمالی فراهم می‌کند.",
      "تیم حقوقی مؤسسه دادپروران مهر ایران با تجربه در تنظیم صدها قرارداد تجاری، استخدامی و مشارکتی، قراردادهایی تنظیم می‌کند که هم از نظر حقوقی محکم و هم از نظر اجرایی عملی باشند.",
      "از قراردادهای ساده خرید و فروش تا قراردادهای پیچیده بین‌المللی و EPC، ما مطمئن می‌شویم که منافع شما در تمامی بندها محفوظ باشد.",
    ],
    contentEN: [
      "A contract is the backbone of every commercial and legal relationship. A good contract not only defines rights and obligations but provides pre-determined solutions for potential disputes.",
      "Our team drafts legally robust and practically executable contracts across all commercial and employment categories.",
    ],
    pointsFA: ["قراردادهای خرید و فروش", "قراردادهای استخدامی و کار", "قراردادهای مشارکت مدنی", "قراردادهای پیمانکاری و EPC", "قراردادهای اجاره و رهن", "قراردادهای نمایندگی و توزیع", "قراردادهای بین‌المللی", "تعهدنامه و صلح‌نامه"],
    pointsEN: ["Purchase/sale contracts", "Employment contracts", "Partnership agreements", "Construction & EPC contracts", "Lease agreements", "Distribution agreements", "International contracts", "Settlements"],
    faqsFA: [
      { q: "تنظیم قرارداد چقدر زمان می‌برد؟", a: "قراردادهای ساده ۲ تا ۳ روز و قراردادهای پیچیده تجاری ۵ تا ۱۰ روز کاری زمان می‌برد." },
      { q: "آیا قراردادها به دو زبان تنظیم می‌شوند؟", a: "بله، برای قراردادهای بین‌المللی، نسخه فارسی و انگلیسی (یا زبان مورد نظر) تنظیم می‌شود." },
      { q: "چه بندهایی حتماً باید در قرارداد باشد؟", a: "شناسایی طرفین، موضوع قرارداد، مدت، مبلغ، شرایط فسخ، حل اختلاف، فورس‌ماژور و جریمه تخلف از مهم‌ترین بندها هستند." },
    ],
    faqsEN: [
      { q: "How long does contract drafting take?", a: "Simple contracts take 2-3 days, complex commercial contracts 5-10 business days." },
    ],
    keywordsFA: ["تنظیم قرارداد", "قرارداد تجاری", "قرارداد استخدامی", "قرارداد مشارکت", "وکیل قرارداد"],
    keywordsEN: ["contract drafting", "commercial contract", "employment contract", "partnership agreement"],
  },
  {
    slug: "contract-review",
    parentSlug: "business",
    icon: FileSearch,
    titleFA: "بررسی قرارداد",
    titleEN: "Contract Review",
    metaTitleFA: "بررسی و ممیزی قرارداد | شناسایی ریسک‌های حقوقی | دادپروران",
    metaTitleEN: "Contract Review & Audit | Legal Risk Assessment | Dadparvaraan",
    metaDescFA: "بررسی تخصصی قراردادها قبل از امضا: شناسایی بندهای مبهم، ریسک‌های حقوقی و پیشنهاد اصلاحات. از حقوق خود محافظت کنید.",
    metaDescEN: "Expert contract review before signing: identifying ambiguous clauses, legal risks and suggesting amendments.",
    heroDescFA: "قبل از امضای هر قرارداد، ریسک‌های حقوقی آن را بشناسید — بررسی تخصصی توسط وکلای مجرب.",
    heroDescEN: "Know the legal risks before signing any contract — expert review by experienced attorneys.",
    contentFA: [
      "امضای قرارداد بدون بررسی حقوقی یکی از رایج‌ترین اشتباهاتی است که خسارات سنگینی به اشخاص و شرکت‌ها وارد می‌کند. بندهای مبهم، تعهدات یکطرفه، جریمه‌های غیرمنصفانه و شرایط فسخ نامتعادل از جمله مشکلاتی هستند که فقط با بررسی حقوقی شناسایی می‌شوند.",
      "سرویس بررسی قرارداد مؤسسه دادپروران مهر ایران شامل تحلیل کامل بندهای قرارداد، شناسایی نقاط ضعف و ریسک، و ارائه پیشنهادات اصلاحی مشخص است.",
    ],
    contentEN: [
      "Signing a contract without legal review is one of the most common mistakes causing heavy damages. Ambiguous clauses, one-sided obligations, and unfair penalties are problems only identified through legal review.",
    ],
    pointsFA: ["تحلیل بندهای قرارداد", "شناسایی ریسک‌های حقوقی", "بررسی تعهدات و الزامات", "تحلیل شرایط فسخ", "بررسی بند حل اختلاف", "مطابقت با قوانین موضوعه", "ارائه گزارش مکتوب", "پیشنهاد اصلاحات"],
    pointsEN: ["Clause analysis", "Risk identification", "Obligation review", "Termination analysis", "Dispute resolution review", "Legal compliance check", "Written report", "Amendment proposals"],
    faqsFA: [
      { q: "بررسی قرارداد چقدر طول می‌کشد؟", a: "بسته به حجم و پیچیدگی قرارداد، ۱ تا ۵ روز کاری. قراردادهای فوری در ۲۴ ساعت بررسی می‌شوند." },
      { q: "آیا نتیجه بررسی مکتوب ارائه می‌شود؟", a: "بله. گزارش مکتوبی شامل تحلیل بند به بند، ریسک‌های شناسایی‌شده و پیشنهادات اصلاحی دریافت می‌کنید." },
    ],
    faqsEN: [
      { q: "How long does contract review take?", a: "Depending on volume and complexity, 1-5 business days. Urgent contracts are reviewed within 24 hours." },
    ],
    keywordsFA: ["بررسی قرارداد", "ممیزی قرارداد", "ریسک حقوقی قرارداد", "تحلیل قرارداد", "وکیل قرارداد"],
    keywordsEN: ["contract review", "contract audit", "legal risk assessment", "contract analysis"],
  },
  {
    slug: "debt-collection",
    parentSlug: "business",
    icon: HandCoins,
    titleFA: "وصول مطالبات سازمانی",
    titleEN: "Organizational Debt Collection",
    metaTitleFA: "وصول مطالبات سازمانی و شرکتی | وکیل وصول مطالبات | دادپروران",
    metaTitleEN: "Corporate Debt Collection | Dadparvaraan Mehr Iran",
    metaDescFA: "وصول مطالبات شرکتی و سازمانی: از مذاکره و اظهارنامه تا اقدام قضایی. بازگرداندن سریع و مؤثر مطالبات معوقه.",
    metaDescEN: "Corporate debt collection: from negotiation to legal action. Fast and effective recovery of overdue receivables.",
    heroDescFA: "بازگرداندن مطالبات معوقه شرکت شما — سریع، مؤثر و با کمترین هزینه.",
    heroDescEN: "Recovering your company's overdue receivables — fast, effective and at minimum cost.",
    contentFA: [
      "مطالبات معوقه یکی از بزرگ‌ترین چالش‌های مالی شرکت‌ها و سازمان‌هاست. تأخیر در وصول مطالبات جریان نقدینگی را مختل می‌کند و می‌تواند بقای کسب‌وکار را تهدید کند.",
      "تیم وصول مطالبات مؤسسه دادپروران مهر ایران با رویکردی مرحله‌ای — از مذاکره دوستانه و ارسال اظهارنامه تا اقدام قضایی و توقیف اموال — مطالبات شما را به سریع‌ترین و کم‌هزینه‌ترین روش وصول می‌کند.",
    ],
    contentEN: [
      "Overdue receivables are one of the biggest financial challenges for companies. Our staged approach — from negotiation to legal action — recovers your receivables effectively.",
    ],
    pointsFA: ["مذاکره و مصالحه", "ارسال اظهارنامه رسمی", "طرح دعوای مطالبه وجه", "درخواست تأمین خواسته", "توقیف اموال بدهکار", "اجرای احکام و توقیف حساب", "پیگیری چک و سفته برگشتی", "وصول مطالبات بین‌المللی"],
    pointsEN: ["Negotiation", "Official notice", "Debt claim lawsuit", "Injunction request", "Asset seizure", "Judgment enforcement", "Bounced check pursuit", "International debt collection"],
    faqsFA: [
      { q: "آیا امکان وصول مطالبات بدون مراجعه به دادگاه وجود دارد؟", a: "بله. بخش قابل توجهی از مطالبات با مذاکره حرفه‌ای و ارسال اظهارنامه وصول می‌شود بدون نیاز به طرح دعوا." },
      { q: "اگر بدهکار اموالی نداشته باشد چه می‌شود؟", a: "با اعمال ماده ۳ قانون نحوه اجرای محکومیت‌های مالی، امکان بازداشت بدهکار و اعمال فشار قانونی وجود دارد." },
    ],
    faqsEN: [
      { q: "Can debts be collected without going to court?", a: "Yes. A significant portion of receivables are collected through professional negotiation and official notices without litigation." },
    ],
    keywordsFA: ["وصول مطالبات", "وکیل وصول مطالبات", "مطالبات معوقه", "وصول طلب", "وکیل طلب"],
    keywordsEN: ["debt collection", "receivables recovery", "overdue debt lawyer"],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // زیرتخصص‌های خانواده
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "consensual-divorce",
    parentSlug: "family",
    icon: Heart,
    titleFA: "طلاق توافقی",
    titleEN: "Consensual Divorce",
    metaTitleFA: "طلاق توافقی | شرایط، مراحل و هزینه | وکیل طلاق توافقی | دادپروران",
    metaTitleEN: "Consensual Divorce | Conditions & Process | Dadparvaraan",
    metaDescFA: "راهنمای کامل طلاق توافقی: شرایط، مراحل، مدارک و هزینه. انجام سریع طلاق توافقی با وکیل متخصص خانواده.",
    metaDescEN: "Complete guide to consensual divorce: conditions, process, documents and costs. Fast processing with family law specialist.",
    heroDescFA: "انجام سریع و حرفه‌ای طلاق توافقی با حفظ حقوق هر دو طرف و حداقل تنش.",
    heroDescEN: "Fast and professional consensual divorce while preserving both parties' rights with minimum tension.",
    contentFA: [
      "طلاق توافقی ساده‌ترین و سریع‌ترین روش جدایی قانونی است که در آن زوجین در مورد تمام شرایط طلاق — شامل مهریه، حضانت، نفقه و تقسیم اموال — به توافق رسیده‌اند.",
      "مؤسسه دادپروران مهر ایران با تجربه در صدها پرونده طلاق توافقی، شما را در تمام مراحل از تنظیم توافق‌نامه تا ثبت رسمی طلاق همراهی می‌کند. هدف ما انجام سریع فرایند با حفظ حقوق قانونی هر دو طرف است.",
      "در طلاق توافقی نیازی به اثبات تقصیر یا دلیل خاص نیست. کافی است زوجین بر سر شرایط جدایی توافق کنند. وکیل متخصص کمک می‌کند این توافق به گونه‌ای تنظیم شود که حقوق هیچ‌یک تضییع نشود.",
    ],
    contentEN: [
      "Consensual divorce is the simplest and fastest method where both spouses agree on all conditions including dowry, custody, alimony and property division.",
      "We assist you through all stages from drafting the agreement to official divorce registration.",
    ],
    pointsFA: ["تنظیم توافق‌نامه طلاق", "تعیین تکلیف مهریه", "توافق حضانت فرزندان", "تقسیم اموال مشترک", "تعیین نفقه و اجرت‌المثل", "مراجعه به مرکز مشاوره خانواده", "ثبت دادخواست در دادگاه خانواده", "ثبت رسمی طلاق در دفترخانه"],
    pointsEN: ["Divorce agreement drafting", "Dowry settlement", "Custody agreement", "Property division", "Alimony determination", "Family counseling center visit", "Court petition filing", "Official registration"],
    faqsFA: [
      { q: "طلاق توافقی چقدر طول می‌کشد؟", a: "از زمان تقدیم دادخواست تا ثبت نهایی، معمولاً ۲ تا ۴ ماه زمان می‌برد. مدت زمان مشاوره خانواده (قبل از دادگاه) بخش عمده‌ای از این زمان است." },
      { q: "آیا حضور هر دو طرف لازم است؟", a: "در جلسه دادگاه بله، اما وکیل می‌تواند بسیاری از مراحل اداری را بدون حضور شما انجام دهد." },
      { q: "آیا می‌توان بعد از طلاق توافقی رجوع کرد؟", a: "در طلاق بائن (که اکثر طلاق‌های توافقی هستند) رجوع امکان‌پذیر نیست و برای بازگشت نیاز به عقد مجدد است." },
    ],
    faqsEN: [
      { q: "How long does consensual divorce take?", a: "From filing to registration, typically 2-4 months." },
      { q: "Is both parties' presence required?", a: "At court sessions yes, but a lawyer handles many administrative steps without your presence." },
    ],
    keywordsFA: ["طلاق توافقی", "وکیل طلاق توافقی", "شرایط طلاق توافقی", "مراحل طلاق توافقی", "هزینه طلاق توافقی"],
    keywordsEN: ["consensual divorce", "mutual divorce lawyer", "divorce process Iran"],
  },
  {
    slug: "dowry-claim",
    parentSlug: "family",
    icon: Banknote,
    titleFA: "مطالبه مهریه",
    titleEN: "Dowry Claim",
    metaTitleFA: "مطالبه مهریه به نرخ روز | وکیل مهریه | دادپروران مهر ایران",
    metaTitleEN: "Dowry Claim at Current Rate | Dowry Lawyer | Dadparvaraan",
    metaDescFA: "مطالبه مهریه به نرخ روز از طریق دادگاه و اجرای ثبت. محاسبه مهریه، توقیف اموال و اعمال ماده ۳. وکیل متخصص مهریه.",
    metaDescEN: "Dowry claim at current rate through court and registration enforcement. Calculation, asset seizure and specialist lawyer.",
    heroDescFA: "مطالبه و وصول مهریه به نرخ روز — با بهره‌گیری از تمام ظرفیت‌های قانونی.",
    heroDescEN: "Claiming and collecting dowry at current rate — utilizing all legal capacities.",
    contentFA: [
      "مهریه حق مسلم زوجه است که به محض عقد ازدواج به ملکیت او درمی‌آید. مطالبه مهریه می‌تواند از دو مسیر انجام شود: دادگاه خانواده یا اجرای ثبت اسناد رسمی.",
      "مؤسسه دادپروران مهر ایران با تخصص در پرونده‌های مهریه، بهترین مسیر قانونی را بر اساس شرایط پرونده شما انتخاب می‌کند. اگر مهریه وجه نقد باشد، به نرخ روز بر اساس شاخص بانک مرکزی محاسبه می‌شود. اگر سکه باشد، به نرخ روز سکه.",
      "در صورت عدم پرداخت توسط زوج، امکان توقیف اموال (ملک، خودرو، حساب بانکی) و در نهایت بازداشت بدهکار از طریق ماده ۳ قانون نحوه اجرای محکومیت‌های مالی وجود دارد.",
    ],
    contentEN: [
      "Dowry is the wife's absolute right that becomes her property upon marriage. Claims can be made through family court or official document registration enforcement.",
      "Our institute selects the best legal path based on your case. Cash dowry is calculated at current rate using the CBI index.",
    ],
    pointsFA: ["مطالبه مهریه از دادگاه خانواده", "مطالبه مهریه از اجرای ثبت", "محاسبه مهریه به نرخ روز", "توقیف اموال زوج", "ممنوع‌الخروجی زوج", "اعمال ماده ۳ محکومیت‌های مالی", "تقسیط مهریه", "اعسار از پرداخت مهریه"],
    pointsEN: ["Court claim", "Registration enforcement", "Current rate calculation", "Asset seizure", "Travel ban", "Financial conviction enforcement", "Installment payment", "Insolvency defense"],
    faqsFA: [
      { q: "تفاوت مطالبه مهریه از دادگاه و اجرای ثبت چیست؟", a: "از اجرای ثبت سریع‌تر است (بدون نیاز به دادرسی) ولی فقط برای مهریه مندرج در سند ازدواج رسمی. از دادگاه زمان‌برتر ولی امکانات بیشتری مانند تأمین خواسته فراهم است." },
      { q: "آیا مرد می‌تواند درخواست تقسیط مهریه بدهد؟", a: "بله. زوج می‌تواند دادخواست اعسار و تقسیط مهریه مطرح کند. دادگاه با بررسی وضع مالی زوج، حکم تقسیط صادر می‌کند." },
      { q: "آیا بعد از طلاق هم می‌توان مهریه مطالبه کرد؟", a: "بله. حق مطالبه مهریه با طلاق از بین نمی‌رود و زوجه می‌تواند بعد از طلاق نیز مهریه خود را مطالبه کند." },
    ],
    faqsEN: [
      { q: "What is the difference between court and registration enforcement?", a: "Registration enforcement is faster (no trial needed) but only for dowry in official marriage documents. Court is slower but offers more options." },
    ],
    keywordsFA: ["مطالبه مهریه", "وکیل مهریه", "مهریه به نرخ روز", "توقیف اموال مهریه", "وکیل مطالبه مهریه"],
    keywordsEN: ["dowry claim", "dowry lawyer", "dowry calculation", "dowry enforcement"],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // زیرتخصص‌های ملکی
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "deed-registration",
    parentSlug: "property",
    icon: Landmark,
    titleFA: "الزام به تنظیم سند رسمی",
    titleEN: "Mandatory Deed Registration",
    metaTitleFA: "الزام به تنظیم سند رسمی | وکیل سند ملک | دادپروران مهر ایران",
    metaTitleEN: "Mandatory Official Deed Registration | Property Lawyer | Dadparvaraan",
    metaDescFA: "دعوای الزام به تنظیم سند رسمی: شرایط، مدارک و مراحل. وادار کردن فروشنده به انتقال سند ملک از طریق دادگاه.",
    metaDescEN: "Lawsuit for mandatory deed registration: conditions, documents and process. Compelling seller to transfer property deed through court.",
    heroDescFA: "فروشنده سند نمی‌زند؟ با طرح دعوای الزام به تنظیم سند، حق خود را از طریق دادگاه بگیرید.",
    heroDescEN: "Seller won't register the deed? File a mandatory registration lawsuit to claim your right through court.",
    contentFA: [
      "یکی از شایع‌ترین دعاوی ملکی، الزام فروشنده به تنظیم سند رسمی انتقال ملک است. بسیاری از معاملات ملکی با مبایعه‌نامه عادی انجام می‌شود، اما فروشنده از حضور در دفترخانه و انتقال سند رسمی خودداری می‌کند.",
      "در این شرایط، خریدار می‌تواند با طرح دعوای «الزام به تنظیم سند رسمی» در دادگاه، فروشنده را ملزم به انتقال سند کند. دادگاه در صورت احراز وقوع معامله و مالکیت فروشنده، حکم به الزام صادر می‌کند.",
      "اگر فروشنده حتی پس از صدور حکم قطعی از انتقال سند امتناع کند، نماینده دادگاه به جای فروشنده سند را امضا و ملک را به نام خریدار منتقل می‌کند.",
    ],
    contentEN: [
      "One of the most common property lawsuits is compelling the seller to register the official transfer deed. Many property transactions are done with informal agreements, but the seller refuses to attend the notary and transfer the official deed.",
      "The buyer can file a 'mandatory deed registration' lawsuit. If the seller still refuses after a final judgment, a court representative signs in their place.",
    ],
    pointsFA: ["طرح دعوای الزام به تنظیم سند", "تأمین دلیل و استعلام ثبتی", "درخواست دستور موقت منع نقل و انتقال", "الزام فروشنده به حضور در دفترخانه", "اجرای حکم توسط نماینده دادگاه", "ابطال معاملات معارض", "الزام به تحویل مبیع", "مطالبه خسارت تأخیر"],
    pointsEN: ["Filing mandatory deed lawsuit", "Evidence preservation", "Temporary injunction", "Compelling seller presence", "Court representative execution", "Conflicting transaction annulment", "Delivery obligation", "Delay damages"],
    faqsFA: [
      { q: "چه مدارکی برای دعوای الزام به تنظیم سند لازم است؟", a: "مبایعه‌نامه، رسید پرداخت ثمن، استعلام ثبتی ملک، مدارک شناسایی و در صورت وجود شهادت شهود." },
      { q: "آیا دادگاه می‌تواند سند را بدون حضور فروشنده منتقل کند؟", a: "بله. پس از صدور حکم قطعی و عدم اجرا توسط فروشنده، نماینده دادگاه سند را به نام خریدار منتقل می‌کند." },
    ],
    faqsEN: [
      { q: "What documents are needed?", a: "Sale agreement, payment receipts, property registration inquiry, identification documents and witness testimony if available." },
    ],
    keywordsFA: ["الزام به تنظیم سند", "انتقال سند ملک", "وکیل سند", "دعوای الزام به سند", "تنظیم سند رسمی"],
    keywordsEN: ["deed registration lawsuit", "property deed transfer", "mandatory registration"],
  },
  {
    slug: "eviction",
    parentSlug: "property",
    icon: DoorOpen,
    titleFA: "تخلیه ملک",
    titleEN: "Property Eviction",
    metaTitleFA: "تخلیه ملک و مستأجر | وکیل تخلیه | دادپروران مهر ایران",
    metaTitleEN: "Property Eviction | Eviction Lawyer | Dadparvaraan Mehr Iran",
    metaDescFA: "تخلیه ملک تجاری و مسکونی: دستور تخلیه فوری، دعوای تخلیه، فسخ اجاره و استرداد ودیعه. وکیل متخصص تخلیه.",
    metaDescEN: "Commercial and residential eviction: immediate eviction order, eviction lawsuit, lease termination and deposit recovery.",
    heroDescFA: "تخلیه قانونی ملک — سریع و با حداقل هزینه، از دستور تخلیه فوری تا دعوای قضایی.",
    heroDescEN: "Legal property eviction — fast and cost-effective, from immediate eviction orders to litigation.",
    contentFA: [
      "تخلیه ملک یکی از پردردسرترین مسائل حقوقی برای مالکان است. مستأجری که بعد از پایان قرارداد ملک را تخلیه نمی‌کند یا اجاره‌بها نمی‌پردازد، باعث ضرر مالی و فرسایش اعصاب مالک می‌شود.",
      "بر اساس قانون روابط موجر و مستأجر ۱۳۷۶، اگر قرارداد اجاره رسمی باشد، مالک می‌تواند دستور تخلیه فوری از شورای حل اختلاف دریافت کند. اگر قرارداد عادی باشد، از طریق دعوای تخلیه در دادگاه اقدام می‌شود.",
    ],
    contentEN: [
      "Property eviction is one of the most troublesome legal issues for landlords. Under the 1997 Landlord-Tenant Act, official lease contracts allow immediate eviction orders from the Dispute Resolution Council.",
    ],
    pointsFA: ["دستور تخلیه فوری (شورای حل اختلاف)", "دعوای تخلیه از دادگاه", "تخلیه به دلیل عدم پرداخت اجاره", "تخلیه ملک تجاری", "فسخ قرارداد اجاره", "مطالبه اجور معوقه", "مطالبه اجرت‌المثل", "تخلیه ید و رفع تصرف"],
    pointsEN: ["Immediate eviction order", "Court eviction lawsuit", "Non-payment eviction", "Commercial eviction", "Lease termination", "Overdue rent claim", "Fair rental value claim", "Possession removal"],
    faqsFA: [
      { q: "آیا می‌توان مستأجر را فوری تخلیه کرد؟", a: "اگر قرارداد اجاره رسمی (دفترخانه‌ای) باشد و مدت آن تمام شده باشد، بله — از طریق شورای حل اختلاف دستور تخلیه فوری صادر می‌شود." },
      { q: "اگر قرارداد عادی باشد چطور؟", a: "باید دعوای تخلیه در دادگاه مطرح شود. مدت رسیدگی معمولاً ۲ تا ۶ ماه است." },
      { q: "تکلیف ودیعه (رهن) مستأجر چه می‌شود؟", a: "مالک موظف است ودیعه را همزمان با تخلیه مسترد کند. اگر خسارتی وارد شده باشد، باید از طریق دادگاه اثبات و کسر شود." },
    ],
    faqsEN: [
      { q: "Can a tenant be evicted immediately?", a: "If the lease is official (notarized) and expired, yes — an immediate eviction order is issued through the Dispute Resolution Council." },
    ],
    keywordsFA: ["تخلیه ملک", "تخلیه مستأجر", "دستور تخلیه", "وکیل تخلیه", "تخلیه ملک تجاری", "فسخ اجاره"],
    keywordsEN: ["property eviction", "tenant eviction", "eviction lawyer", "lease termination"],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // وکیل چک — parent + sub
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "check",
    icon: BadgeCheck,
    titleFA: "وکیل چک و اسناد تجاری",
    titleEN: "Check & Commercial Documents Lawyer",
    metaTitleFA: "وکیل چک برگشتی و اسناد تجاری | دادپروران مهر ایران",
    metaTitleEN: "Bounced Check & Commercial Documents Lawyer | Dadparvaraan",
    metaDescFA: "وکیل متخصص چک: مطالبه وجه چک، شکایت کیفری صدور چک بلامحل، توقیف اموال صادرکننده. پیگیری سریع و مؤثر.",
    metaDescEN: "Check specialist lawyer: check amount claims, criminal complaints for bounced checks, issuer asset seizure.",
    heroDescFA: "پیگیری حقوقی و کیفری چک‌های برگشتی و اسناد تجاری — سریع و با کمترین هزینه.",
    heroDescEN: "Legal and criminal pursuit of bounced checks — fast and at minimum cost.",
    contentFA: [
      "چک یکی از مهم‌ترین اسناد تجاری در معاملات روزمره ایرانیان است. چک برگشتی می‌تواند هم از مسیر حقوقی (مطالبه وجه) و هم از مسیر کیفری (صدور چک بلامحل) پیگیری شود.",
      "مؤسسه دادپروران مهر ایران با تجربه گسترده در پرونده‌های چک و اسناد تجاری، سریع‌ترین و مؤثرترین مسیر قانونی را برای وصول وجه چک شما انتخاب می‌کند.",
    ],
    contentEN: [
      "Checks are one of the most important commercial documents in Iranian transactions. Bounced checks can be pursued both civilly (amount claim) and criminally (bounced check issuance).",
    ],
    pointsFA: ["مطالبه وجه چک", "شکایت کیفری چک بلامحل", "توقیف اموال صادرکننده", "ممنوع‌الخروجی صادرکننده", "واخواست سفته", "مطالبه وجه سفته", "اعسار از پرداخت", "مسئولیت ظهرنویس"],
    pointsEN: ["Check amount claim", "Criminal complaint", "Issuer asset seizure", "Travel ban", "Promissory note protest", "Promissory note claim", "Insolvency", "Endorser liability"],
    faqsFA: [
      { q: "تفاوت شکایت حقوقی و کیفری چک چیست؟", a: "در شکایت حقوقی، هدف وصول وجه چک است. در شکایت کیفری، هدف مجازات صادرکننده (حبس) است. می‌توان هر دو را همزمان مطرح کرد." },
      { q: "مهلت شکایت کیفری چک چقدر است؟", a: "دارنده چک باید ظرف ۶ ماه از تاریخ صدور چک، آن را به بانک ارائه کند و ظرف ۶ ماه از تاریخ برگشت، شکایت کیفری مطرح نماید." },
    ],
    faqsEN: [
      { q: "What is the difference between civil and criminal check complaints?", a: "Civil aims to recover the amount; criminal aims to punish the issuer. Both can be filed simultaneously." },
    ],
    keywordsFA: ["وکیل چک", "چک برگشتی", "مطالبه وجه چک", "چک بلامحل", "وکیل سفته"],
    keywordsEN: ["check lawyer", "bounced check", "check claim", "promissory note lawyer"],
  },
  {
    slug: "check-claim",
    parentSlug: "check",
    icon: Banknote,
    titleFA: "مطالبه وجه چک",
    titleEN: "Check Amount Claim",
    metaTitleFA: "مطالبه وجه چک | وصول چک برگشتی | وکیل چک | دادپروران",
    metaTitleEN: "Check Amount Claim | Bounced Check Recovery | Dadparvaraan",
    metaDescFA: "مطالبه وجه چک برگشتی از طریق دادگاه و اجرای ثبت: توقیف اموال، مسدود کردن حساب و ممنوع‌الخروجی صادرکننده.",
    metaDescEN: "Bounced check recovery through court and registration enforcement: asset seizure, account blocking and travel ban.",
    heroDescFA: "وصول سریع وجه چک برگشتی با استفاده از تمام ابزارهای قانونی.",
    heroDescEN: "Fast recovery of bounced check amounts using all legal instruments.",
    contentFA: [
      "مطالبه وجه چک از دو مسیر امکان‌پذیر است: اجرای ثبت اسناد رسمی (سریع‌تر و بدون نیاز به دادرسی) و دادخواست مطالبه وجه در دادگاه حقوقی.",
      "از طریق اجرای ثبت، دارنده چک می‌تواند مستقیماً اموال صادرکننده را توقیف کند. از طریق دادگاه، امکان مطالبه خسارت تأخیر تأدیه علاوه بر اصل وجه وجود دارد.",
      "تیم ما بر اساس مبلغ چک، وضعیت صادرکننده و شرایط پرونده، بهترین مسیر را انتخاب می‌کند. در بسیاری از موارد، پیگیری همزمان از هر دو مسیر توصیه می‌شود.",
    ],
    contentEN: [
      "Check claims can be pursued through registration enforcement (faster, no trial) or court petition. Registration allows direct asset seizure; court allows additional delay damages.",
    ],
    pointsFA: ["مطالبه از طریق اجرای ثبت", "دادخواست مطالبه وجه", "درخواست تأمین خواسته", "توقیف حساب بانکی", "توقیف خودرو و ملک", "ممنوع‌الخروجی", "مطالبه خسارت تأخیر تأدیه", "اجرای حکم و وصول"],
    pointsEN: ["Registration enforcement", "Court petition", "Injunction request", "Bank account seizure", "Vehicle & property seizure", "Travel ban", "Late payment damages", "Judgment enforcement"],
    faqsFA: [
      { q: "کدام مسیر برای وصول چک سریع‌تر است؟", a: "اجرای ثبت سریع‌تر است (معمولاً ۱ تا ۲ ماه). مسیر دادگاه ۳ تا ۶ ماه طول می‌کشد ولی امکان مطالبه خسارت تأخیر تأدیه دارد." },
      { q: "آیا از ظهرنویس هم می‌توان مطالبه کرد؟", a: "بله. دارنده چک می‌تواند علیه صادرکننده، ظهرنویس‌ها و ضامن‌ها به صورت همزمان اقدام کند." },
    ],
    faqsEN: [
      { q: "Which path is faster for check recovery?", a: "Registration enforcement is faster (1-2 months). Court takes 3-6 months but allows late payment damages." },
    ],
    keywordsFA: ["مطالبه وجه چک", "وصول چک", "توقیف اموال چک", "وکیل وصول چک", "اجرای ثبت چک"],
    keywordsEN: ["check claim", "check recovery", "bounced check enforcement"],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // زیرتخصص‌های کیفری
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "fraud",
    parentSlug: "criminal",
    icon: Gavel,
    titleFA: "وکیل کلاهبرداری",
    titleEN: "Fraud Lawyer",
    metaTitleFA: "وکیل کلاهبرداری | دفاع و شکایت | دادپروران مهر ایران",
    metaTitleEN: "Fraud Lawyer | Defense & Prosecution | Dadparvaraan Mehr Iran",
    metaDescFA: "وکیل متخصص پرونده‌های کلاهبرداری: شکایت از کلاهبرداری، دفاع از متهم، استرداد اموال و مطالبه خسارت. تجربه گسترده در دادسرا.",
    metaDescEN: "Fraud specialist lawyer: fraud complaints, defense of accused, asset recovery and damage claims.",
    heroDescFA: "دفاع و شکایت تخصصی در پرونده‌های کلاهبرداری — با تجربه گسترده در دادسراهای تهران.",
    heroDescEN: "Specialized defense and prosecution in fraud cases — with extensive experience in Tehran prosecution offices.",
    contentFA: [
      "کلاهبرداری طبق ماده ۱ قانون تشدید مجازات مرتکبین ارتشا و اختلاس و کلاهبرداری، عبارت است از بردن مال دیگری از طریق توسل به وسایل متقلبانه. مجازات آن ۱ تا ۷ سال حبس و رد مال و جزای نقدی است.",
      "پرونده‌های کلاهبرداری از پیچیده‌ترین پرونده‌های کیفری هستند. اثبات عنصر «توسل به وسایل متقلبانه» و «قصد مجرمانه» نیازمند تخصص و تجربه ویژه است. تیم کیفری مؤسسه دادپروران، هم در مقام شاکی و هم در مقام دفاع از متهم، خدمات تخصصی ارائه می‌دهد.",
      "کلاهبرداری اینترنتی، فروش مال غیر، کلاهبرداری در معاملات ملکی و کلاهبرداری شرکتی از جمله انواع رایج هستند که تیم ما در آنها تخصص دارد.",
    ],
    contentEN: [
      "Fraud under Iranian law is taking others' property through deceptive means, carrying 1-7 years imprisonment. These are among the most complex criminal cases.",
    ],
    pointsFA: ["شکایت کلاهبرداری", "دفاع از متهم به کلاهبرداری", "کلاهبرداری اینترنتی", "فروش مال غیر", "کلاهبرداری ملکی", "استرداد اموال", "مطالبه خسارت", "کلاهبرداری شرکتی"],
    pointsEN: ["Fraud complaint", "Defense of accused", "Internet fraud", "Selling others' property", "Property fraud", "Asset recovery", "Damage claims", "Corporate fraud"],
    faqsFA: [
      { q: "مجازات کلاهبرداری چیست؟", a: "۱ تا ۷ سال حبس به اضافه رد مال به صاحبش و جزای نقدی معادل مالی که اخذ کرده. برای کلاهبرداری در سطح کلان مجازات سنگین‌تر است." },
      { q: "تفاوت کلاهبرداری و خیانت در امانت چیست؟", a: "در کلاهبرداری، مال از ابتدا با فریب اخذ می‌شود. در خیانت در امانت، مال به صورت امانت سپرده شده ولی امین از آن سوءاستفاده می‌کند." },
      { q: "چگونه کلاهبرداری اینترنتی را شکایت کنم؟", a: "با مراجعه به پلیس فتا یا دادسرا و ارائه مدارک (اسکرین‌شات، رسید پرداخت، مکاتبات). وکیل متخصص مدارک لازم را مشخص می‌کند." },
    ],
    faqsEN: [
      { q: "What is the punishment for fraud?", a: "1-7 years imprisonment plus return of property and fine. Larger-scale fraud carries heavier penalties." },
    ],
    keywordsFA: ["وکیل کلاهبرداری", "کلاهبرداری اینترنتی", "شکایت کلاهبرداری", "فروش مال غیر", "وکیل کیفری کلاهبرداری"],
    keywordsEN: ["fraud lawyer", "internet fraud", "fraud defense", "property fraud"],
  },
  {
    slug: "breach-of-trust",
    parentSlug: "criminal",
    icon: UserX,
    titleFA: "وکیل خیانت در امانت",
    titleEN: "Breach of Trust Lawyer",
    metaTitleFA: "وکیل خیانت در امانت | شکایت و دفاع | دادپروران مهر ایران",
    metaTitleEN: "Breach of Trust Lawyer | Complaint & Defense | Dadparvaraan",
    metaDescFA: "وکیل متخصص خیانت در امانت: شکایت از امین خائن، دفاع از متهم، استرداد مال امانی. مشاوره رایگان.",
    metaDescEN: "Breach of trust specialist: complaint against unfaithful trustee, defense of accused, recovery of entrusted property.",
    heroDescFA: "پیگیری تخصصی پرونده‌های خیانت در امانت — شکایت یا دفاع با وکلای مجرب کیفری.",
    heroDescEN: "Specialized handling of breach of trust cases — complaint or defense with experienced criminal attorneys.",
    contentFA: [
      "خیانت در امانت طبق ماده ۶۷۴ قانون مجازات اسلامی، عبارت است از استعمال، تصاحب، تلف یا مفقود کردن مالی که بر حسب امانت، اجاره، وکالت یا هر عنوان دیگری به شخص سپرده شده باشد. مجازات آن ۶ ماه تا ۳ سال حبس است.",
      "این جرم در روابط تجاری (شریک، وکیل، مدیر شرکت)، روابط خانوادگی و حتی روابط دوستانه رخ می‌دهد. اثبات آن نیازمند نشان دادن سه عنصر است: سپردن مال به صورت امانت، تصاحب یا استعمال غیرمجاز، و قصد مجرمانه.",
    ],
    contentEN: [
      "Breach of trust under Article 674 of Islamic Penal Code is the use, appropriation, destruction or loss of property entrusted to a person. Punishment is 6 months to 3 years imprisonment.",
    ],
    pointsFA: ["شکایت خیانت در امانت", "دفاع از متهم به خیانت در امانت", "خیانت در امانت شریک تجاری", "خیانت مدیرعامل شرکت", "تصاحب اموال سپرده‌شده", "استرداد مال امانی", "مطالبه خسارت", "خیانت وکیل یا نماینده"],
    pointsEN: ["Breach of trust complaint", "Defense of accused", "Business partner breach", "CEO breach", "Entrusted property seizure", "Property recovery", "Damage claims", "Agent/attorney breach"],
    faqsFA: [
      { q: "تفاوت خیانت در امانت و سرقت چیست؟", a: "در سرقت، مال بدون رضایت صاحب ربوده می‌شود. در خیانت در امانت، مال با رضایت صاحب سپرده شده ولی امین از آن سوءاستفاده کرده است." },
      { q: "چگونه خیانت در امانت را اثبات کنم؟", a: "با ارائه مدارک سپردن مال (رسید، قرارداد، شهادت شهود) و اثبات تصاحب غیرمجاز. وکیل متخصص استراتژی اثبات را تعیین می‌کند." },
    ],
    faqsEN: [
      { q: "What is the difference between breach of trust and theft?", a: "In theft, property is taken without consent. In breach of trust, property was willingly entrusted but the trustee misused it." },
    ],
    keywordsFA: ["خیانت در امانت", "وکیل خیانت در امانت", "شکایت خیانت در امانت", "تصاحب مال امانی"],
    keywordsEN: ["breach of trust", "breach of trust lawyer", "misappropriation"],
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return servicesData.find((s) => s.slug === slug);
}

export function getParentServices(): ServiceDetail[] {
  return servicesData.filter((s) => !s.parentSlug);
}

export function getChildServices(parentSlug: string): ServiceDetail[] {
  return servicesData.filter((s) => s.parentSlug === parentSlug);
}

export interface ServiceCategory {
  parent: ServiceDetail;
  children: ServiceDetail[];
}

export function getServiceCategories(): ServiceCategory[] {
  const parents = getParentServices();
  return parents.map((parent) => ({
    parent,
    children: getChildServices(parent.slug),
  }));
}
