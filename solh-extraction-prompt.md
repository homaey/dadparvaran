# مستر پرامپت استخراج محتوای سایت solh.ir برای پروژه دادپروران

## ⚠️ قوانین امنیتی (اجباری)

1. **قبل از تغییر اسکیما یا داده، یک نسخه‌ی پشتیبان از دیتابیس بگیر.**
2. **اگر جایی این پرامپت با کد موجود در تناقض بود یا تصمیمی ریسک داشت، قبل از تغییر از من بپرس.**
3. **این داده از منبع سایت solh.ir توسط کاربر تهیه شده. مقادیر را تغییر نده، گِرد نکن، و از خودت رکورد نساز. فقط عیناً import کن.**
4. **ماشین‌حساب سهم‌الارث (طرحش جدا در حال بررسی است؛ اینجا دست نزن).**

---

## ۱. هدف کلی

محتوای استخراج‌شده از سایت solh.ir (مقالات آموزشی، پرسش‌وپاسخ‌ها، و اسناد حقوقی) را پردازش کن و به فایل‌های JSON ساختارمند تبدیل کن تا در پروژه Next.js سایت **dadparvaran.com** قابل import شوند.

**اخبار نمی‌خواهیم — فقط مقالات آموزشی (`section === "post"`)، پرسش‌وپاسخ‌ها، و اسناد حقوقی (دادخواست، شکواییه، قرارداد، وکالت‌نامه، اظهارنامه، گواهی/اقرارنامه، اساسنامه).**

### فایل‌های منبع

| منبع | مسیر | محتوا |
|------|------|-------|
| `articles.json` | `C:\My Web Sites\solh\extracted\articles.json` | 659 رکورد (169 آموزشی + 490 خبر — فقط آموزشی‌ها) |
| `questions.json` | `C:\My Web Sites\solh\extracted\questions.json` | 10,779 پرسش‌وپاسخ حقوقی |
| `petition/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\petition\` | 142 فایل HTML دادخواست |
| `complaint/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\complaint\` | 81 فایل HTML شکواییه |
| `contract/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\contract\` | 219 فایل HTML قرارداد |
| `power-of-attorney/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\power-of-attorney\` | 121 فایل HTML وکالت‌نامه |
| `declaration/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\declaration\` | 38 فایل HTML اظهارنامه |
| `confirmation/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\confirmation\` | 46 فایل HTML گواهی/اقرارنامه |
| `company-statute/` | `C:\My Web Sites\solh\oragh- solh\www.solh.ir\company-statute\` | 42 فایل HTML اساسنامه |

---

## ۲. ساختار پروژه دادپروران

- **فریمورک:** Next.js 14 App Router
- **ORM:** Prisma با SQLite
- **مسیر پروژه:** `C:\Users\HOSSEINI\Desktop\dadparvaran`
- **اسکیمای Prisma:** `dadparvaran/prisma/schema.prisma`
- **زبان:** فارسی (fa) و انگلیسی (en) با `[locale]` routing

---

## ۳. اسکیمای دیتابیس مرتبط (Prisma)

### ۳.۱ مقالات (Article)

```prisma
model Article {
  id          Int       @id @default(autoincrement())
  authorId    Int                    // FK → TeamMember.id
  categoryId  String?                // FK → Category.id (cuid)
  title       String
  slug        String    @unique
  excerpt     String?                // خلاصه ۱-۲ جمله
  blocks      String    @default("[]")  // JSON array of content blocks
  coverImage  String?
  status      String    @default("DRAFT")  // DRAFT | SCHEDULED | PUBLISHED
  readTimeMin Int       @default(5)
  viewCount   Int       @default(0)
  priority    Int       @default(0)       // 0-100
  scheduledAt DateTime?
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### ۳.۲ دسته‌بندی (Category)

```prisma
model Category {
  id     String @id @default(cuid())
  nameFA String
  nameEN String
  slug   String @unique
}
```

**دسته‌بندی‌های ثابت:**

| slug | nameFA | nameEN |
|------|--------|--------|
| `civil-law` | حقوق مدنی | Civil Law |
| `criminal-law` | حقوق کیفری | Criminal Law |
| `commercial-law` | حقوق تجاری | Commercial Law |
| `family-law` | حقوق خانواده | Family Law |
| `property-law` | امور ملکی | Property Law |
| `inheritance-law` | ارث و امور حسبی | Inheritance Law |
| `labor-law` | حقوق کار | Labor Law |
| `financial-claims` | چک، سفته و مطالبات | Financial Claims |
| `procedure-law` | آیین دادرسی | Procedure Law |
| `contract-law` | قراردادها | Contracts |

### ۳.۳ تگ‌ها (Tag + Taggable)

```prisma
model Tag {
  id          Int    @id @default(autoincrement())
  category    String              // "LEGAL_TOPIC" | "ARTICLE_TYPE" | ...
  nameFA      String
  nameEN      String
  slug        String @unique
  description String?
}

model Taggable {
  tagId        Int
  taggableType String   // "ARTICLE" | "LEGAL_NODE" | ...
  taggableId   Int
  @@id([tagId, taggableType, taggableId])
}
```

### ۳.۴ نمونه اوراق قضایی (LegalFormTemplate + LegalFormCategory)

```prisma
model LegalFormCategory {
  id       Int    @id @default(autoincrement())
  parentId Int?                   // برای زیرشاخه‌ها
  nameFA   String
  nameEN   String @default("")
  slug     String @unique
  descFA   String @default("")
  descEN   String @default("")
  icon     String?
  order    Int    @default(0)
}

model LegalFormTemplate {
  id          Int     @id @default(autoincrement())
  slug        String  @unique
  categoryId  Int?                   // FK → LegalFormCategory.id
  docType     String                 // petition | complaint | contract | power-of-attorney | declaration | confirmation | company-statute
  titleFA     String
  titleEN     String  @default("")
  descFA      String  @default("")   // توضیح کوتاه
  descEN      String  @default("")
  content     String  @default("")   // متن HTML کامل سند
  isPublished Boolean @default(true)
  order       Int     @default(0)
}
```

---

## ۴. فرمت Blocks (محتوای مقاله)

فیلد `blocks` در Article یک JSON array است. هر بلوک یکی از این type‌ها را دارد:

```typescript
type Block =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "callout"; content: string; variant: "info" | "tip" | "warning" | "danger" }
  | { type: "steps"; items: string[] }
  | { type: "faq"; items: Array<{ q: string; a: string }> }
```

**قوانین بلوک‌بندی:**
- هر پاراگراف حداکثر ۴ جمله
- heading فقط برای عناوین فرعی (نه عنوان اصلی مقاله)
- حداقل ۱ بلوک callout در مقالات آموزشی
- لیست‌های شماره‌دار → `steps`
- بخش‌های سؤال-جواب → `faq`

---

## ۵. انواع مقاله (ArticleType)

| مقدار | فارسی | کاربرد |
|-------|-------|--------|
| `EDUCATIONAL` | آموزشی | مقالات آموزشی حقوقی عمومی |
| `STEP_BY_STEP` | راهنمای گام‌به‌گام | آموزش مراحل یک فرآیند حقوقی |
| `LEGAL_QA` | پرسش‌وپاسخ حقوقی | مجموعه سؤال و جواب |
| `LAW_ANALYSIS` | تحلیل قانون | تحلیل مواد قانونی |
| `LEGAL_SAMPLE` | نمونه اسناد حقوقی | نمونه دادخواست، شکوائیه، ... |
| `LEGAL_NEWS` | اخبار حقوقی | (استفاده نمی‌شود در این استخراج) |
| `LEGAL_GLOSSARY` | واژه‌نامه حقوقی | تعریف اصطلاحات |

---

## ۶. دستور کار: فایل‌های خروجی

### ۶.۱ فایل اول: `processed-articles.json`

**منبع:** `articles.json` (فقط رکوردهایی با `section === "post"` و `content.length > 600`)

**اخبار (`section === "news"`) را کاملاً نادیده بگیر.**

هر رکورد خروجی:

```json
{
  "sourceId": "10",
  "title": "عنوان مقاله (trim شده)",
  "slug": "عنوان-فارسی-بدون-نشانه-10",
  "excerpt": "خلاصه ۱-۲ جمله‌ای از ابتدای متن",
  "categorySlug": "property-law",
  "articleType": "EDUCATIONAL",
  "blocks": [
    { "type": "paragraph", "content": "..." },
    { "type": "heading", "content": "..." },
    { "type": "callout", "content": "...", "variant": "info" },
    { "type": "steps", "items": ["...", "..."] }
  ],
  "priority": 75,
  "readTimeMin": 8,
  "tags": ["آپارتمان", "شارژ ساختمان", "هزینه مشترک"],
  "datePublished": "2018-10-20",
  "image": "https://www.solh.ir/Images/Learning/..."
}
```

**الگوریتم تولید slug:**
```
title.trim()
  .replace(/[()«»؟?.,،:؛"'!\/\\]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 70) + "-" + sourceId
```

**الگوریتم تشخیص categorySlug:**

از کلمات کلیدی عنوان و ۹۰۰ کاراکتر اول محتوا:

| categorySlug | کلمات کلیدی |
|-------------|-------------|
| `inheritance-law` | ارث، وراثت، ترکه، وصیت، سهم‌الارث، انحصار وراثت، ماترک، حسبی، قیمومت |
| `family-law` | طلاق، مهریه، نفقه، حضانت، ازدواج، تمکین، عقد، زوجه، زوج |
| `financial-claims` | چک، سفته، برگشتی، مطالبه وجه، مطالبات، اعسار، تقسیط |
| `procedure-law` | دادخواست، دادرسی، تجدیدنظر، واخواهی، فرجام، اجرای حکم، دادگاه، ابلاغ |
| `contract-law` | قرارداد، بیع، معامله، فسخ، اجاره، مبایعه، تعهد، وجه التزام |
| `property-law` | ملک، املاک، سند رسمی، خلع ید، سرقفلی، تصرف عدوانی، آپارتمان، افراز |
| `criminal-law` | کلاهبرداری، سرقت، جرم، کیفری، مجازات، قصاص، دیه، جعل، خیانت در امانت |
| `commercial-law` | شرکت، تجاری، ورشکستگی، سهام، تجارت، علامت تجاری، برند |
| `labor-law` | کارگر، کارفرما، بیمه، سنوات، اخراج، قرارداد کار، تأمین اجتماعی |
| `civil-law` | (پیش‌فرض اگر هیچ‌کدام match نشد) |

اگر کلمه کلیدی در **عنوان** باشد، وزن ۳ برابر بدهید.

**الگوریتم تشخیص articleType:**
- اگر عنوان شامل «مراحل»، «چگونه»، «آموزش گام» باشد → `STEP_BY_STEP`
- اگر عنوان شامل «ماده»، «قانون»، «تبصره» و محتوا تحلیلی باشد → `LAW_ANALYSIS`
- اگر عنوان شامل «نمونه دادخواست»، «نمونه شکوائیه» باشد → `LEGAL_SAMPLE`
- بقیه → `EDUCATIONAL`

**الگوریتم priority (0-100):**

| کلمات کلیدی | امتیاز |
|-------------|--------|
| مهریه، طلاق، حضانت، نفقه، ازدواج | 90 |
| ارث، وراثت، ترکه، وصیت | 85 |
| چک، سفته، مطالبات، اعسار | 82 |
| خرید، فروش، ملک، آپارتمان، سند، سرقفلی | 80 |
| کلاهبرداری، شکایت، سرقت، جرم | 78 |
| قرارداد، اجاره، فسخ، بیع | 75 |
| دادخواست، دادگاه، تجدیدنظر، اجرای حکم | 70 |
| کارگر، کارفرما، بیمه، اخراج، سنوات | 68 |
| شرکت، ثبت، تجاری، برند | 55 |
| (هیچ match نشد) | 30 |

اگر محتوا بیش از ۵۰۰۰ کاراکتر باشد: `priority += 5` (حداکثر ۱۰۰)

**محاسبه readTimeMin:**
```
Math.max(2, Math.round(wordCount / 200))
```

**استخراج excerpt:**
اولین پاراگراف محتوا (اولین بلوک متنی که نه heading است نه list). حداکثر ۲ جمله.

**تبدیل محتوا به blocks:**
1. خطوط خالی → جداکننده پاراگراف
2. خطوط شروع‌شده با `## ` → بلوک `heading`
3. خطوط شروع‌شده با `- ` → جمع کن در بلوک `steps`
4. بقیه → بلوک `paragraph`
5. هر پاراگراف طولانی‌تر از ۴ جمله را به چند پاراگراف بشکن

---

### ۶.۲ فایل دوم: `processed-qa-articles.json`

**منبع:** `questions.json` (۱۰,۷۷۹ پرسش‌وپاسخ)

پرسش‌وپاسخ‌ها را بر اساس تگ‌ها گروه‌بندی کن. هر گروه (تگ) با حداقل ۵ سؤال، یک مقاله LEGAL_QA می‌شود.

```json
[
  {
    "groupTag": "طلاق",
    "title": "پرسش و پاسخ حقوقی درباره طلاق",
    "slug": "پرسش-و-پاسخ-حقوقی-درباره-طلاق-qa",
    "categorySlug": "family-law",
    "articleType": "LEGAL_QA",
    "excerpt": "پاسخ وکیل به رایج‌ترین سؤالات حقوقی درباره طلاق",
    "blocks": [
      {
        "type": "faq",
        "items": [
          {
            "q": "عنوان سؤال (title فیلد)",
            "a": "پاسخ وکیل (answer فیلد)"
          }
        ]
      }
    ],
    "priority": 90,
    "readTimeMin": 15,
    "questionCount": 45,
    "tags": ["طلاق"]
  }
]
```

**نکات مهم:**
- هر گروه حداکثر ۳۰ سؤال (اگر بیشتر بود، به بخش‌ها تقسیم کن مثلاً "طلاق - بخش ۱")
- سؤالات را بر اساس کیفیت مرتب کن: سؤالات طولانی‌تر و جواب‌های مفصل‌تر اول
- سؤالات خیلی کوتاه (جواب کمتر از ۲۰ کاراکتر) را حذف کن
- فیلد `question` (متن سؤال کاربر) را نادیده بگیر، فقط از `title` (عنوان ویرایش‌شده) و `answer` استفاده کن

---

### ۶.۳ فایل سوم: `extracted-tags.json`

تمام تگ‌های یکتا از questions.json را استخراج کن:

```json
[
  {
    "nameFA": "طلاق",
    "nameEN": "Divorce",
    "slug": "talaq",
    "category": "LEGAL_TOPIC",
    "questionCount": 1097,
    "suggestedCategorySlug": "family-law"
  }
]
```

**ترجمه nameEN:** تگ‌ها را به انگلیسی ترجمه کن. اگر مطمئن نیستی، از pinglish slug استفاده کن.

**slug:** نام فارسی → حروف لاتین (pinglish) مثل `talaq`, `mehriyeh`, `ers`, `check`

**نگاشت تگ → دسته حقوقی (`suggestedCategorySlug`):**

| تگ‌ها | categorySlug |
|-------|-------------|
| طلاق، مهریه، نفقه، حضانت، تمکین، عقد موقت، ازدواج | `family-law` |
| ارث، انحصار وراثت | `inheritance-law` |
| چک، سفته، مطالبات مالی، اعسار | `financial-claims` |
| املاک، رهن و اجاره، تنظیم قرارداد | `property-law` یا `contract-law` |
| کلاهبرداری، سرقت، ضرب و جرح، دیه، آسیب جسمانی، امور کیفری، روابط نامشروع | `criminal-law` |
| کارگر و کارفرما، کار و تامین اجتماعی | `labor-law` |
| ثبت اسناد | `procedure-law` |

---

### ۶.۴ فایل چهارم: `processed-legal-forms.json` ⭐ جدید

**منبع:** فایل‌های HTML از ۷ پوشه زیر:

| پوشه | تعداد | docType | فارسی |
|------|-------|---------|-------|
| `petition/` | 142 | `petition` | دادخواست |
| `complaint/` | 81 | `complaint` | شکواییه |
| `contract/` | 219 | `contract` | قرارداد |
| `power-of-attorney/` | 121 | `power-of-attorney` | وکالت‌نامه |
| `declaration/` | 38 | `declaration` | اظهارنامه |
| `confirmation/` | 46 | `confirmation` | گواهی/اقرارنامه |
| `company-statute/` | 42 | `company-statute` | اساسنامه/صورتجلسه |

**مسیر پایه:** `C:\My Web Sites\solh\oragh- solh\www.solh.ir\`

هر فایل HTML یک صفحه کامل HTTrack است. برای استخراج محتوا:

#### نحوه parse هر فایل HTML:

1. **عنوان:** از `<h1 class="article-title">` استخراج کن
2. **محتوای HTML:** از `<div class="article-body paragraph">` استخراج کن — این شامل متن کامل سند حقوقی با جداول و فرمت رسمی است
3. **sourceId:** از نام فایل (مثلاً `193.html` → `"193"`)
4. **توضیح (descFA):** از `<meta name="description" content="...">` استخراج کن

#### ساختار خروجی هر رکورد:

```json
{
  "sourceId": "193",
  "docType": "petition",
  "titleFA": "نمونه دادخواست دستور منع موقت انتقال، الزام به تنظیم سندرسمی ...",
  "slug": "نمونه-دادخواست-دستور-منع-موقت-انتقال-الزام-193",
  "descFA": "توضیح کوتاه از meta description",
  "content": "<div>... متن کامل HTML سند ...</div>",
  "categorySlug": "property-law",
  "suggestedFormCategory": "الزام به تنظیم سند",
  "tags": ["الزام به تنظیم سند", "دادخواست", "ملک"]
}
```

#### الگوریتم تولید slug برای اسناد:

```
titleFA.trim()
  .replace(/[()«»؟?.,،:؛"'!\/\\]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 80) + "-" + sourceId
```

#### نکات مهم استخراج HTML:

1. **محتوا را عیناً نگهدار** — جداول رسمی فرم دادخواست/شکواییه باید HTML خود را حفظ کنند (جدول‌های `<table>` با سطرهای خواهان/خوانده/تعیین خواسته/دلائل/شرح)
2. **HTML cleanup:** فقط این تغییرات مجاز:
   - حذف تگ‌های `<script>` و `<style>` از داخل محتوا
   - حذف inline style‌های مربوط به font-family (چون سایت از فونت خودش استفاده می‌کند)
   - حذف کلاس‌های CSS خارجی (مثل `MsoTableGrid` و `MsoNormalTable`)
   - تبدیل مسیرهای نسبی تصاویر (`../assets/img/...`) به مسیر کامل (`https://www.solh.ir/assets/img/...`)
3. **متن خام (plainText):** علاوه بر HTML، یک نسخه plainText هم تولید کن (بدون تگ) برای جستجو و سئو

#### تشخیص categorySlug از عنوان سند:

همان الگوریتم بخش ۶.۱ — از کلمات کلیدی عنوان برای تشخیص دسته استفاده کن.

#### تشخیص suggestedFormCategory (دسته‌بندی فرعی اسناد):

از عنوان هر سند، یک دسته‌بندی موضوعی پیشنهاد بده:

| کلمات کلیدی در عنوان | suggestedFormCategory |
|----------------------|----------------------|
| الزام به تنظیم سند | الزام به تنظیم سند |
| مطالبه وجه، مطالبه خسارت | مطالبات مالی |
| طلاق، مهریه، نفقه، حضانت | خانواده |
| تخلیه، اجاره | تخلیه و اجاره |
| چک، سفته | اسناد تجاری |
| خلع ید، تصرف عدوانی | امور ملکی |
| کلاهبرداری، سرقت، خیانت در امانت | کیفری |
| فسخ، ابطال | فسخ و ابطال |
| ثبت شرکت، تغییرات | ثبت شرکت |
| وکالت | وکالت |
| (سایر) | عمومی |

---

### ۶.۵ فایل پنجم: `form-categories.json` ⭐ جدید

از مجموع اسناد استخراج‌شده، دسته‌بندی‌های پیشنهادی را تولید کن:

```json
[
  {
    "nameFA": "دادخواست",
    "nameEN": "Petitions",
    "slug": "petitions",
    "icon": "FileText",
    "order": 1,
    "children": [
      {
        "nameFA": "الزام به تنظیم سند",
        "nameEN": "Obligation to Register",
        "slug": "petition-obligation-register",
        "descFA": "نمونه دادخواست‌های الزام به تنظیم سند رسمی",
        "order": 1,
        "templateCount": 12
      },
      {
        "nameFA": "مطالبات مالی",
        "nameEN": "Financial Claims",
        "slug": "petition-financial-claims",
        "descFA": "نمونه دادخواست‌های مطالبه وجه و خسارت",
        "order": 2,
        "templateCount": 8
      }
    ]
  },
  {
    "nameFA": "شکواییه",
    "nameEN": "Complaints",
    "slug": "complaints",
    "icon": "AlertTriangle",
    "order": 2,
    "children": [...]
  },
  {
    "nameFA": "قرارداد",
    "nameEN": "Contracts",
    "slug": "contracts",
    "icon": "FileSignature",
    "order": 3,
    "children": [...]
  },
  {
    "nameFA": "وکالت‌نامه",
    "nameEN": "Power of Attorney",
    "slug": "power-of-attorney",
    "icon": "UserCheck",
    "order": 4,
    "children": [...]
  },
  {
    "nameFA": "اظهارنامه",
    "nameEN": "Declarations",
    "slug": "declarations",
    "icon": "FileWarning",
    "order": 5,
    "children": [...]
  },
  {
    "nameFA": "گواهی و اقرارنامه",
    "nameEN": "Confirmations",
    "slug": "confirmations",
    "icon": "CheckCircle",
    "order": 6,
    "children": [...]
  },
  {
    "nameFA": "اساسنامه و صورتجلسات",
    "nameEN": "Company Statutes",
    "slug": "company-statutes",
    "icon": "Building",
    "order": 7,
    "children": [...]
  }
]
```

**نحوه ساخت:** بعد از پردازش تمام اسناد، `suggestedFormCategory` هر سند را جمع‌آوری کن و دسته‌بندی‌های فرعی را تولید کن. هر زیردسته‌ باید حداقل ۲ سند داشته باشد.

---

## ۷. ساختار نهایی فایل‌ها

همه فایل‌های خروجی را در این پوشه قرار بده:

```
C:\My Web Sites\solh\extracted\processed\
├── processed-articles.json      ← ~169 مقاله آموزشی (بدون اخبار)
├── processed-qa-articles.json   ← مقالات LEGAL_QA گروه‌بندی‌شده
├── extracted-tags.json          ← تگ‌های یکتا با ترجمه
├── processed-legal-forms.json   ← ~689 سند حقوقی (دادخواست+شکواییه+قرارداد+...)
├── form-categories.json         ← دسته‌بندی درختی اسناد
└── stats.json                   ← آمار کلی
```

### فایل `stats.json`

```json
{
  "generatedAt": "2026-07-15T...",
  "sources": {
    "articles": { "total": 659, "educational": 169, "newsSkipped": 490 },
    "questions": { "total": 10779, "withAnswer": "...", "uniqueTags": "..." },
    "legalForms": {
      "petition": 142,
      "complaint": 81,
      "contract": 219,
      "powerOfAttorney": 121,
      "declaration": 38,
      "confirmation": 46,
      "companyStatute": 42,
      "total": 689
    }
  },
  "outputs": {
    "processedArticles": "تعداد",
    "qaArticles": "تعداد گروه",
    "totalQaQuestions": "تعداد سؤالات استفاده‌شده",
    "tags": "تعداد تگ یکتا",
    "legalForms": "تعداد اسناد پردازش‌شده",
    "formCategories": "تعداد دسته‌بندی (والد+فرزند)"
  },
  "categoryDistribution": {
    "family-law": "تعداد",
    "criminal-law": "تعداد"
  },
  "formTypeDistribution": {
    "petition": "تعداد موفق",
    "complaint": "تعداد موفق",
    "contract": "تعداد موفق"
  },
  "errors": []
}
```

---

## ۸. کنترل کیفیت

### قوانین اجباری:
1. **داده‌ها را تغییر نده** — متن مقالات، پاسخ‌ها، و محتوای اسناد حقوقی را عیناً نگهدار. فقط ساختار (بلوک‌بندی، دسته‌بندی، slug) اضافه کن.
2. **slug باید unique باشد** — قبل از تولید، تکراری نبودن slug را چک کن.
3. **JSON معتبر** — خروجی باید valid JSON باشد.
4. **حذف رکوردهای بی‌کیفیت:**
   - مقالاتی با محتوای کمتر از ۶۰۰ کاراکتر
   - مقالاتی با عنوان کمتر از ۸ کاراکتر
   - سؤالاتی با جواب کمتر از ۲۰ کاراکتر
   - اسناد HTML که `<h1 class="article-title">` ندارند یا `<div class="article-body">` خالی است
5. **حفظ استنادات قانونی** — هر اشاره به ماده قانون، تبصره، یا بند را دست‌نخورده نگهدار.
6. **encoding:** فایل‌ها UTF-8 بدون BOM ذخیره شوند.
7. **HTML اسناد:** ساختار جدولی فرم‌های رسمی (خواهان/خوانده/خواسته) باید حفظ شود.

### بررسی نهایی:
- هر فایل JSON را parse کن و مطمئن شو error ندارد
- تعداد رکوردهای ورودی و خروجی را در `stats.json` مقایسه کن
- توزیع دسته‌بندی‌ها را بررسی کن (نباید همه در `civil-law` بیفتند)
- اسنادی که parse نشدند را در `stats.errors` گزارش بده

---

## ۹. نحوه اجرا

1. **فایل‌های منبع JSON را بخوان** از `C:\My Web Sites\solh\extracted\`
2. **فایل‌های HTML اسناد را بخوان** از `C:\My Web Sites\solh\oragh- solh\www.solh.ir\{petition,complaint,contract,...}\`
3. **پردازش کن** طبق الگوریتم‌های بالا
4. **فایل‌های خروجی را بنویس** در `C:\My Web Sites\solh\extracted\processed\`
5. **stats.json تولید کن** با آمار کامل
6. **گزارش بده** چه تعداد رکورد پردازش شد، چه تعداد فیلتر شد، و توزیع دسته‌بندی

### اسکریپت پیشنهادی

یک اسکریپت Node.js بنویس که:
- فایل `articles.json` و `questions.json` را می‌خواند
- فایل‌های HTML هر ۷ پوشه اسناد حقوقی را parse می‌کند (با cheerio یا JSDOM)
- پردازش و دسته‌بندی انجام می‌دهد
- فایل‌های خروجی JSON تولید می‌کند
- در پایان آمار نهایی چاپ می‌کند

نام فایل: `C:\My Web Sites\solh\extracted\process-solh-data.mjs`

**وابستگی‌ها:** `npm install cheerio` (برای parse کردن HTML اسناد)

---

## ۱۰. سیستم import موجود

سایت دادپروران از قبل یک سیستم import مقالات دارد در:
`dadparvaran/src/app/api/admin/solh-import/route.ts`

این API فقط `articles.json` اصلی را می‌خواند. بعد از تولید فایل‌های پردازش‌شده، من خودم API‌های import جدید برای Q&A، اسناد حقوقی، و tags خواهم ساخت. تو فقط فایل‌های JSON را تولید کن.
