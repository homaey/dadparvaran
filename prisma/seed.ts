import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Admin ──────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash("Admin@1234", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@legalfirm.ir" },
    update: {},
    create: {
      name: "مدیر سیستم",
      email: "admin@legalfirm.ir",
      phone: "09100000000",
      password: adminPass,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // ── Categories ─────────────────────────────────────────────────────────
  const categories = [
    { nameFA: "حقوق مدنی", nameEN: "Civil Law", slug: "civil-law" },
    { nameFA: "حقوق کیفری", nameEN: "Criminal Law", slug: "criminal-law" },
    { nameFA: "حقوق تجاری", nameEN: "Commercial Law", slug: "commercial-law" },
    { nameFA: "حقوق خانواده", nameEN: "Family Law", slug: "family-law" },
    { nameFA: "امور ملکی", nameEN: "Property Law", slug: "property-law" },
  ];

  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories seeded");

  // ── Team Members ─────────────────────────────────────────────────────
  const lawyerPass = await bcrypt.hash("Lawyer@1234", 12);
  const lawyerUser = await db.user.upsert({
    where: { email: "lawyer@legalfirm.ir" },
    update: {},
    create: {
      name: "محمد همائی‌فر",
      email: "lawyer@legalfirm.ir",
      phone: "09111111111",
      password: lawyerPass,
      role: "LAWYER",
    },
  });

  let teamMember = await db.teamMember.findUnique({ where: { slug: "محمد-همایی‌فر" } });
  if (!teamMember) {
    teamMember = await db.teamMember.create({
      data: {
        userId: lawyerUser.id,
        nameFA: "محمد همائی‌فر",
        nameEN: "Mohammad Homaifar",
        slug: "محمد-همایی‌فر",
        roleFA: "وکیل پایه یک دادگستری",
        roleEN: "Licensed Bar Attorney",
        bioFA: "وکیل پایه یک دادگستری با تخصص در حقوق مدنی و خانواده. عضو کانون وکلای دادگستری مرکز.",
        bioEN: "Licensed bar attorney specializing in civil and family law. Member of the Central Bar Association.",
        experience: 20,
        isAvailable: true,
        isActive: true,
        status: "APPROVED",
        order: 1,
      },
    });
  }
  console.log("Team member 1 seeded:", teamMember.nameFA);

  // ── محسن عاقل میر رضایی ──
  let teamMember2 = await db.teamMember.findUnique({ where: { slug: "محسن-عاقل-میر-رضایی" } });
  if (!teamMember2) {
    teamMember2 = await db.teamMember.create({
      data: {
        nameFA: "محسن عاقل میر رضایی",
        nameEN: "Mohsen Aghel Mir Rezaei",
        slug: "محسن-عاقل-میر-رضایی",
        roleFA: "وکیل پایه یک دادگستری",
        roleEN: "Licensed Bar Attorney",
        bioFA: "وکیل پایه یک دادگستری با تجربه در حقوق کیفری و امور تجاری.",
        bioEN: "Licensed bar attorney with experience in criminal and commercial law.",
        isActive: true,
        status: "APPROVED",
        order: 2,
      },
    });
  }
  console.log("Team member 2 seeded:", teamMember2.nameFA);

  // ── عارف حسین شهاوندی ──
  let teamMember3 = await db.teamMember.findUnique({ where: { slug: "عارف-حسین-شهاوندی" } });
  if (!teamMember3) {
    teamMember3 = await db.teamMember.create({
      data: {
        nameFA: "عارف حسین شهاوندی",
        nameEN: "Aref Hossein Shahavandi",
        slug: "عارف-حسین-شهاوندی",
        roleFA: "وکیل پایه یک دادگستری",
        roleEN: "Licensed Bar Attorney",
        bioFA: "وکیل پایه یک دادگستری با تخصص در امور ملکی، ثبتی و قراردادها.",
        bioEN: "Licensed bar attorney specializing in property, registration and contract matters.",
        isActive: true,
        status: "APPROVED",
        order: 3,
      },
    });
  }
  console.log("Team member 3 seeded:", teamMember3.nameFA);

  // ── عرفان شهاوندی ──
  let teamMember4 = await db.teamMember.findUnique({ where: { slug: "عرفان-شهاوندی" } });
  if (!teamMember4) {
    teamMember4 = await db.teamMember.create({
      data: {
        nameFA: "عرفان شهاوندی",
        nameEN: "Erfan Shahavandi",
        slug: "عرفان-شهاوندی",
        roleFA: "وکیل پایه یک دادگستری",
        roleEN: "Licensed Bar Attorney",
        bioFA: "وکیل پایه یک دادگستری با تمرکز بر دعاوی خانوادگی و حقوق خانواده.",
        bioEN: "Licensed bar attorney focused on family disputes and family law.",
        isActive: true,
        status: "APPROVED",
        order: 4,
      },
    });
  }
  console.log("Team member 4 seeded:", teamMember4.nameFA);

  // ── Tags ───────────────────────────────────────────────────────────────
  const tagCivil = await db.tag.upsert({
    where: { slug: "حقوق-مدنی" },
    update: {},
    create: {
      category: "TOPIC",
      nameFA: "حقوق مدنی",
      nameEN: "Civil Law",
      slug: "حقوق-مدنی",
    },
  });

  const tagAuthority = await db.tag.upsert({
    where: { slug: "مجلس-شورای-اسلامی" },
    update: {},
    create: {
      category: "AUTHORITY",
      nameFA: "مجلس شورای اسلامی",
      nameEN: "Islamic Consultative Assembly",
      slug: "مجلس-شورای-اسلامی",
    },
  });

  await db.tag.upsert({
    where: { slug: "اجاره-و-ملک" },
    update: {},
    create: {
      category: "TOPIC",
      nameFA: "اجاره و ملک",
      nameEN: "Rental & Property",
      slug: "اجاره-و-ملک",
    },
  });

  const appliedTags = [
    { nameFA: "دعاوی حقوقی", nameEN: "Civil Litigation", slug: "civil-litigation" },
    { nameFA: "تنظیم قراردادها", nameEN: "Contract Drafting", slug: "contract-drafting" },
    { nameFA: "امور پیمان", nameEN: "Contract & Procurement Affairs", slug: "contract-procurement" },
    { nameFA: "داوری", nameEN: "Arbitration", slug: "arbitration" },
  ];
  for (const t of appliedTags) {
    await db.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: { category: "APPLIED", ...t },
    });
  }
  console.log("Tags seeded");

  // ── LegalNode: قانون مدنی ──────────────────────────────────────────────
  let civilCode = await db.legalNode.findFirst({
    where: { type: "LAW", slug: "قانون-مدنی" },
  });
  if (!civilCode) {
    civilCode = await db.legalNode.create({
      data: {
        type: "LAW",
        title: "قانون مدنی",
        slug: "قانون-مدنی",
        lawKey: "civil-code",
        adoptionDate: "۱۳۰۷/۰۲/۱۸",
        adoptionAuthority: "مجلس شورای ملی",
        orderIndex: 1,
      },
    });
    await db.legalNode.update({ where: { id: civilCode.id }, data: { lawId: civilCode.id } });
  }

  const intro = await db.legalNode.upsert({
    where: { parentId_slug: { parentId: civilCode.id, slug: "مقدمه" } },
    update: {},
    create: {
      parentId: civilCode.id,
      lawId: civilCode.id,
      type: "SECTION",
      title: "مقدمه - در انتشار و آثار و اجرای قوانین به طور عموم",
      slug: "مقدمه",
      orderIndex: 1,
    },
  });

  const article1 = await db.legalNode.upsert({
    where: { parentId_slug: { parentId: intro.id, slug: "ماده-۱" } },
    update: {},
    create: {
      parentId: intro.id,
      lawId: civilCode.id,
      type: "ARTICLE",
      title: "انتشار و ابلاغ قوانین",
      slug: "ماده-۱",
      articleNumber: "۱",
      content: "مصوبات مجلس شورای اسلامی و نتیجه همه پرسی پس از طی مراحل قانونی به رئیس جمهور ابلاغ می شود. رئیس جمهور باید ظرف مدت پنج روز آن را امضا و به مجریان ابلاغ نماید و دستور انتشار آن را صادر کند و روزنامه رسمی موظف است ظرف مدت ۷۲ ساعت پس از ابلاغ منتشر نماید.",
      orderIndex: 1,
    },
  });

  await db.legalNode.upsert({
    where: { parentId_slug: { parentId: intro.id, slug: "ماده-۲" } },
    update: {},
    create: {
      parentId: intro.id,
      lawId: civilCode.id,
      type: "ARTICLE",
      title: "لازم‌الاجرا شدن قوانین",
      slug: "ماده-۲",
      articleNumber: "۲",
      content: "قوانین ۱۵ روز پس از انتشار در سراسر کشور لازم الاجراء است مگر آن که در خود قانون، ترتیب خاصی برای موقع اجرا مقرر شده باشد.",
      orderIndex: 2,
    },
  });

  await db.legalNode.upsert({
    where: { parentId_slug: { parentId: intro.id, slug: "ماده-۳" } },
    update: {},
    create: {
      parentId: intro.id,
      lawId: civilCode.id,
      type: "ARTICLE",
      title: "عطف به ماسبق نشدن قوانین",
      slug: "ماده-۳",
      articleNumber: "۳",
      content: "اثر قانون نسبت به آتیه است و قانون نسبت به ما قبل خود اثر ندارد مگر اینکه در خود قانون مقررات خاصی نسبت به این موضوع اتخاذ شده باشد.",
      orderIndex: 3,
    },
  });
  console.log("Legal nodes seeded (قانون مدنی + 3 articles)");

  // ── Taggable links ─────────────────────────────────────────────────────
  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagCivil.id, taggableType: "LEGAL_NODE", taggableId: civilCode.id } },
    update: {},
    create: { tagId: tagCivil.id, taggableType: "LEGAL_NODE", taggableId: civilCode.id },
  });

  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagAuthority.id, taggableType: "LEGAL_NODE", taggableId: civilCode.id } },
    update: {},
    create: { tagId: tagAuthority.id, taggableType: "LEGAL_NODE", taggableId: civilCode.id },
  });

  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagCivil.id, taggableType: "LEGAL_NODE", taggableId: article1.id } },
    update: {},
    create: { tagId: tagCivil.id, taggableType: "LEGAL_NODE", taggableId: article1.id },
  });

  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagCivil.id, taggableType: "TEAM_MEMBER", taggableId: teamMember.id } },
    update: {},
    create: { tagId: tagCivil.id, taggableType: "TEAM_MEMBER", taggableId: teamMember.id },
  });

  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagCivil.id, taggableType: "TEAM_MEMBER", taggableId: teamMember2.id } },
    update: {},
    create: { tagId: tagCivil.id, taggableType: "TEAM_MEMBER", taggableId: teamMember2.id },
  });
  console.log("Tags linked");

  // ── Sample Article with blocks ─────────────────────────────────────────
  const civilCategory = await db.category.findUnique({ where: { slug: "civil-law" } });

  const sampleBlocks = [
    { type: "paragraph", content: "ماده ۱ قانون مدنی یکی از مهم‌ترین مواد این قانون است که فرآیند انتشار و ابلاغ قوانین را مشخص می‌کند. بر اساس این ماده، مصوبات مجلس شورای اسلامی پس از طی مراحل قانونی به رئیس جمهور ابلاغ می‌شود." },
    { type: "callout", variant: "info", title: "نکته مهم", content: "رئیس جمهور موظف است ظرف ۵ روز مصوبه را امضا و دستور انتشار صادر کند." },
    { type: "paragraph", content: "اهمیت این ماده در تعیین لحظه دقیق لازم‌الاجرا شدن قوانین است. روزنامه رسمی موظف است ظرف ۷۲ ساعت پس از ابلاغ، مصوبه را منتشر نماید." },
    { type: "legal_ref", lawSlug: "قانون-مدنی", articleSlug: "ماده-۱", text: "مشاهده متن کامل ماده ۱ قانون مدنی" },
  ];

  let sampleArticle = await db.article.findFirst({ where: { slug: "بررسی-ماده-یک-قانون-مدنی" } });
  if (!sampleArticle) {
    sampleArticle = await db.article.create({
      data: {
        authorId: teamMember.id,
        categoryId: civilCategory?.id,
        title: "بررسی ماده یک قانون مدنی و فرآیند ابلاغ قوانین",
        slug: "بررسی-ماده-یک-قانون-مدنی",
        excerpt: "در این مقاله به بررسی تفصیلی ماده یک قانون مدنی و نحوه انتشار و ابلاغ قوانین می‌پردازیم.",
        blocks: JSON.stringify(sampleBlocks),
        status: "PUBLISHED",
        readTimeMin: 8,
        publishedAt: new Date(),
      },
    });
  }

  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagCivil.id, taggableType: "ARTICLE", taggableId: sampleArticle.id } },
    update: {},
    create: { tagId: tagCivil.id, taggableType: "ARTICLE", taggableId: sampleArticle.id },
  });
  console.log("Sample article seeded with blocks and tags");

  // ── B-6: Full sample article with ALL block types ──────────────────────
  const propertyCategory = await db.category.findUnique({ where: { slug: "property-law" } });
  const tagRental = await db.tag.findUnique({ where: { slug: "اجاره-و-ملک" } });

  const fullBlocks = [
    { type: "paragraph", content: "یکی از رایج‌ترین مشکلات حقوقی در حوزه اجاره، عدم استرداد ودیعه (رهن) توسط صاحبخانه پس از پایان مدت اجاره است. بسیاری از مستأجران نمی‌دانند که قانون در این خصوص حمایت‌های مشخصی از آنها به عمل آورده و راه‌های قانونی مؤثری برای مطالبه ودیعه وجود دارد." },
    { type: "heading", content: "ودیعه (رهن) از نظر قانونی چیست؟" },
    { type: "paragraph", content: "ودیعه یا رهن مبلغی است که مستأجر در ابتدای قرارداد اجاره به موجر (صاحبخانه) می‌پردازد تا ضمانت حسن انجام تعهدات قراردادی باشد. این مبلغ باید پس از پایان قرارداد و تخلیه ملک، به مستأجر بازگردانده شود." },
    { type: "callout", variant: "warning", title: "نکته مهم", content: "صاحبخانه حق ندارد ودیعه را بابت اجاره‌بهای معوقه، خسارت یا هر عنوان دیگری بدون رضایت مستأجر یا حکم دادگاه کسر کند." },
    { type: "heading", content: "مراحل قانونی مطالبه ودیعه" },
    { type: "steps", items: [
      "ارسال اظهارنامه رسمی از طریق دفتر خدمات الکترونیک قضایی و درخواست استرداد ودیعه ظرف ۱۰ روز",
      "در صورت عدم پاسخ، مراجعه به شورای حل اختلاف (برای مبالغ زیر ۲ میلیارد ریال) یا دادگاه حقوقی",
      "تنظیم دادخواست «مطالبه وجه» با ذکر مبلغ ودیعه، شماره قرارداد و مشخصات موجر",
      "درخواست تأمین خواسته برای توقیف اموال موجر به میزان مبلغ ودیعه (اختیاری ولی توصیه می‌شود)",
      "حضور در جلسه دادرسی و ارائه مدارک (قرارداد اجاره، رسید ودیعه، اظهارنامه)",
    ]},
    { type: "callout", variant: "tip", title: "توصیه وکیل", content: "حتماً قبل از تخلیه، صورت‌جلسه تحویل ملک تنظیم کنید و وضعیت ملک را با عکس و فیلم مستند سازید. این مدارک در صورت ادعای خسارت توسط صاحبخانه بسیار ارزشمند خواهند بود." },
    { type: "faq", items: [
      { q: "آیا صاحبخانه می‌تواند ودیعه را بابت خسارت کسر کند؟", a: "خیر، بدون رضایت مستأجر یا حکم دادگاه، صاحبخانه حق کسر هیچ مبلغی از ودیعه را ندارد. حتی اگر خسارتی وارد شده باشد، باید از طریق مراجع قضایی اثبات و مطالبه شود." },
      { q: "اگر قرارداد شفاهی باشد چطور؟", a: "حتی بدون قرارداد کتبی، اگر شهود یا مدارک دیگری (رسید بانکی، پیامک تأیید) وجود داشته باشد، می‌توانید ودیعه را مطالبه کنید." },
      { q: "مدت زمان رسیدگی چقدر است؟", a: "معمولاً در شورای حل اختلاف ۱ تا ۳ ماه و در دادگاه حقوقی ۳ تا ۶ ماه طول می‌کشد. با درخواست تأمین خواسته، فشار مؤثری بر موجر وارد می‌شود." },
      { q: "هزینه دادرسی چقدر است؟", a: "هزینه دادرسی بر اساس مبلغ خواسته محاسبه می‌شود. برای مبالغ تا ۲ میلیارد ریال حدود ۲.۵ درصد و بالاتر از آن ۳.۵ درصد مبلغ خواسته است." },
    ]},
    { type: "figure", src: "/images/rental-contract-sample.jpg", alt: "نمونه قرارداد اجاره", caption: "نمونه قرارداد اجاره رسمی — توجه به بند استرداد ودیعه ضروری است" },
    { type: "heading", content: "مستندات قانونی" },
    { type: "paragraph", content: "بر اساس ماده ۴ قانون روابط موجر و مستأجر مصوب ۱۳۷۶ و مواد ۶۱۹ تا ۶۳۴ قانون مدنی (باب ودیعه)، موجر مکلف است پس از انقضای مدت اجاره و تخلیه ملک، ودیعه را مسترد نماید. در صورت استنکاف، مستأجر حق مراجعه به مراجع قضایی را دارد." },
    { type: "legal_ref", lawSlug: "قانون-مدنی", articleSlug: "ماده-۱", text: "مشاهده قانون مدنی — مبنای حقوقی ودیعه" },
    { type: "callout", variant: "danger", title: "هشدار", content: "هرگز بدون دریافت ودیعه، ملک را تخلیه نکنید. پس از تخلیه، قدرت چانه‌زنی شما به‌شدت کاهش می‌یابد." },
  ];

  let fullArticle = await db.article.findFirst({ where: { slug: "صاحبخانه-ودیعه-را-پس-نمی‌دهد" } });
  if (!fullArticle) {
    fullArticle = await db.article.create({
      data: {
        authorId: teamMember2.id,
        categoryId: propertyCategory?.id,
        title: "صاحبخانه ودیعه (رهن) را پس نمی‌دهد — راهنمای حقوقی کامل",
        slug: "صاحبخانه-ودیعه-را-پس-نمی‌دهد",
        excerpt: "اگر صاحبخانه ودیعه یا رهن شما را پس نمی‌دهد، این راهنمای جامع مراحل قانونی مطالبه ودیعه را قدم‌به‌قدم توضیح می‌دهد.",
        blocks: JSON.stringify(fullBlocks),
        status: "PUBLISHED",
        readTimeMin: 12,
        publishedAt: new Date(),
      },
    });
  }

  if (tagRental) {
    await db.taggable.upsert({
      where: { tagId_taggableType_taggableId: { tagId: tagRental.id, taggableType: "ARTICLE", taggableId: fullArticle.id } },
      update: {},
      create: { tagId: tagRental.id, taggableType: "ARTICLE", taggableId: fullArticle.id },
    });
  }
  await db.taggable.upsert({
    where: { tagId_taggableType_taggableId: { tagId: tagCivil.id, taggableType: "ARTICLE", taggableId: fullArticle.id } },
    update: {},
    create: { tagId: tagCivil.id, taggableType: "ARTICLE", taggableId: fullArticle.id },
  });
  console.log("Full sample article (B-6) seeded with all block types");

  // ── SEO Articles — service-related content ──────────────────────────────
  const criminalCategory = await db.category.findUnique({ where: { slug: "criminal-law" } });
  const familyCategory = await db.category.findUnique({ where: { slug: "family-law" } });
  const commercialCategory = await db.category.findUnique({ where: { slug: "commercial-law" } });

  const seoArticles = [
    {
      slug: "طلاق-توافقی-شرایط-و-مراحل",
      title: "طلاق توافقی: شرایط، مراحل و نکات حقوقی مهم",
      excerpt: "راهنمای کامل طلاق توافقی در ایران — شرایط لازم، مراحل قانونی، مدارک مورد نیاز و نکاتی که باید قبل از اقدام بدانید.",
      categorySlug: "family-law",
      authorRef: "teamMember4",
      readTime: 10,
      blocks: [
        { type: "paragraph", content: "طلاق توافقی ساده‌ترین و سریع‌ترین روش جدایی قانونی است. در این نوع طلاق، زوجین در مورد تمام شرایط — شامل مهریه، حضانت فرزندان، نفقه و تقسیم اموال مشترک — به توافق رسیده‌اند و نیازی به اثبات تقصیر نیست." },
        { type: "heading", content: "شرایط لازم برای طلاق توافقی" },
        { type: "paragraph", content: "برای طلاق توافقی، هر دو طرف باید راضی به جدایی باشند و در مورد تمام مسائل مالی و حضانت به توافق رسیده باشند. حضور هر دو نفر در دادگاه الزامی است، مگر اینکه وکیل داشته باشند." },
        { type: "steps", items: [
          "مراجعه به مرکز مشاوره خانواده و گذراندن جلسات مشاوره الزامی",
          "تنظیم توافق‌نامه مشخص شامل تکلیف مهریه، حضانت، نفقه و اموال",
          "ثبت دادخواست طلاق توافقی در دادگاه خانواده",
          "حضور در جلسه دادگاه و تأیید توافقات",
          "صدور گواهی عدم سازش و مراجعه به دفترخانه برای ثبت طلاق",
        ]},
        { type: "callout", variant: "info", title: "مدت زمان", content: "از زمان تقدیم دادخواست تا ثبت نهایی طلاق، معمولاً ۲ تا ۴ ماه زمان لازم است. مرحله مشاوره خانواده بخش عمده‌ای از این مدت را شامل می‌شود." },
        { type: "heading", content: "نکات مهم حقوقی" },
        { type: "paragraph", content: "در طلاق توافقی توجه به جزئیات توافق‌نامه بسیار مهم است. بسیاری از اختلافات بعدی ناشی از ابهام در توافق‌نامه اولیه است. داشتن وکیل متخصص خانواده تضمین می‌کند که حقوق شما به طور کامل محفوظ بماند." },
        { type: "callout", variant: "warning", title: "توجه", content: "اکثر طلاق‌های توافقی از نوع بائن هستند و رجوع امکان‌پذیر نیست. قبل از تصمیم نهایی، حتماً با وکیل مشورت کنید." },
        { type: "faq", items: [
          { q: "آیا طلاق توافقی قابل رجوع است؟", a: "در بیشتر موارد خیر. طلاق توافقی معمولاً خلعی یا مبارات است که هر دو از انواع طلاق بائن هستند و رجوع ندارند." },
          { q: "هزینه طلاق توافقی چقدر است؟", a: "هزینه دادرسی حدود ۱ تا ۲ میلیون تومان، هزینه مشاوره خانواده حدود ۵۰۰ هزار تومان و حق‌الوکاله وکیل بسته به توافق تعیین می‌شود." },
          { q: "آیا زن می‌تواند بدون رضایت شوهر طلاق بگیرد؟", a: "در طلاق توافقی خیر، رضایت هر دو لازم است. اما اگر شرایط عسر و حرج اثبات شود، زن می‌تواند از طریق دادگاه درخواست طلاق کند." },
        ]},
      ],
    },
    {
      slug: "مطالبه-مهریه-به-نرخ-روز",
      title: "مطالبه مهریه به نرخ روز: روش‌ها و نکات کلیدی",
      excerpt: "نحوه محاسبه و مطالبه مهریه به نرخ روز از طریق دادگاه و اجرای ثبت — تفاوت‌ها، مزایا و نکاتی که باید بدانید.",
      categorySlug: "family-law",
      authorRef: "teamMember",
      readTime: 9,
      blocks: [
        { type: "paragraph", content: "مهریه حق مسلم زوجه است که به محض عقد نکاح به ملکیت او درمی‌آید و «عندالمطالبه» است — یعنی هر زمان که بخواهد می‌تواند آن را مطالبه کند. اگر مهریه وجه رایج (پول نقد) باشد، بر اساس شاخص بهای کالا و خدمات بانک مرکزی به نرخ روز محاسبه و پرداخت می‌شود." },
        { type: "heading", content: "دو مسیر مطالبه مهریه" },
        { type: "paragraph", content: "۱. اجرای ثبت اسناد رسمی: سریع‌تر و بدون نیاز به طی مراحل دادرسی. زوجه می‌تواند مستقیماً به دفترخانه محل ثبت ازدواج مراجعه کرده و تقاضای صدور اجراییه نماید. ۲. دادگاه خانواده: زمان‌برتر ولی امکان مطالبه خسارت تأخیر تأدیه و تأمین خواسته را فراهم می‌کند." },
        { type: "callout", variant: "tip", title: "توصیه وکیل", content: "اگر مهریه سکه طلا باشد، نیازی به محاسبه شاخص نیست — به نرخ روز سکه محاسبه می‌شود. اما اگر مبلغ ریالی باشد، شاخص بانک مرکزی ملاک است." },
        { type: "heading", content: "نحوه محاسبه مهریه به نرخ روز" },
        { type: "paragraph", content: "فرمول محاسبه: مبلغ مهریه × (شاخص سال مطالبه ÷ شاخص سال عقد). از ماشین‌حساب مهریه در وب‌سایت ما می‌توانید محاسبه دقیق انجام دهید." },
        { type: "faq", items: [
          { q: "آیا بعد از طلاق هم می‌توان مهریه مطالبه کرد؟", a: "بله. حق مطالبه مهریه با طلاق از بین نمی‌رود." },
          { q: "اگر مرد توانایی پرداخت یکجا نداشته باشد چه می‌شود؟", a: "مرد می‌تواند دادخواست اعسار و تقسیط مهریه بدهد. دادگاه بر اساس وضع مالی او، مهریه را تقسیط می‌کند." },
          { q: "ممنوع‌الخروجی بابت مهریه چگونه است؟", a: "با مطالبه مهریه از اجرای ثبت یا دادگاه، امکان ممنوع‌الخروجی زوج وجود دارد. اما اگر مهریه بیش از ۱۱۰ سکه باشد، ممنوع‌الخروجی فقط تا سقف ۱۱۰ سکه اعمال می‌شود." },
        ]},
      ],
    },
    {
      slug: "کلاهبرداری-اینترنتی-شکایت",
      title: "کلاهبرداری اینترنتی: نحوه شکایت و پیگیری قانونی",
      excerpt: "قربانی کلاهبرداری اینترنتی شده‌اید؟ مراحل شکایت، مدارک لازم و راه‌های بازگرداندن پول از طریق مراجع قضایی.",
      categorySlug: "criminal-law",
      authorRef: "teamMember2",
      readTime: 11,
      blocks: [
        { type: "paragraph", content: "با گسترش فضای مجازی و تراکنش‌های آنلاین، کلاهبرداری اینترنتی به یکی از شایع‌ترین جرایم سایبری تبدیل شده است. از فروشگاه‌های جعلی اینترنتی گرفته تا فیشینگ و سرمایه‌گذاری‌های هرمی، روش‌های کلاهبرداری روز به روز پیچیده‌تر می‌شوند." },
        { type: "heading", content: "انواع رایج کلاهبرداری اینترنتی" },
        { type: "paragraph", content: "فیشینگ (صفحات جعلی بانکی)، فروشگاه‌های آنلاین جعلی، کلاهبرداری در دیوار و شیپور، طرح‌های پانزی و هرمی، جعل هویت در شبکه‌های اجتماعی و درگاه‌های پرداخت جعلی از رایج‌ترین روش‌ها هستند." },
        { type: "heading", content: "مراحل شکایت" },
        { type: "steps", items: [
          "جمع‌آوری مدارک: اسکرین‌شات از مکالمات، رسید بانکی، آدرس سایت یا پروفایل کلاهبردار",
          "مراجعه به پلیس فتا: ثبت شکایت آنلاین از طریق سایت cyberpolice.ir یا حضوری",
          "یا مراجعه مستقیم به دادسرا: ثبت شکایت در دادسرای عمومی و انقلاب",
          "پیگیری پرونده و حضور در جلسات بازجویی و دادرسی",
        ]},
        { type: "callout", variant: "danger", title: "هشدار", content: "هرگز مبلغی را به عنوان «هزینه آزادسازی پول» یا «کارمزد برگشت» پرداخت نکنید. این خود یک روش کلاهبرداری مجدد است." },
        { type: "heading", content: "مجازات کلاهبرداری اینترنتی" },
        { type: "paragraph", content: "طبق ماده ۱ قانون تشدید مجازات مرتکبین ارتشا و اختلاس و کلاهبرداری، مجازات کلاهبرداری ۱ تا ۷ سال حبس و رد مال و جزای نقدی است. اگر مرتکب از کارکنان دولت باشد، مجازات تشدید می‌شود." },
        { type: "faq", items: [
          { q: "آیا پول از دست رفته قابل بازگشت است؟", a: "بله، اگر کلاهبردار شناسایی شود و اموالی داشته باشد، با حکم دادگاه اموال توقیف و پول برگشت داده می‌شود." },
          { q: "اگر کلاهبردار ناشناس باشد چه می‌شود؟", a: "پلیس فتا با ردیابی IP، شماره کارت و حساب بانکی معمولاً قادر به شناسایی هستند." },
        ]},
      ],
    },
    {
      slug: "خیانت-در-امانت-شرایط-و-مجازات",
      title: "خیانت در امانت: شرایط تحقق، مجازات و نحوه اثبات",
      excerpt: "بررسی جرم خیانت در امانت: عناصر تشکیل‌دهنده، تفاوت با سرقت و کلاهبرداری، مجازات قانونی و روش‌های اثبات.",
      categorySlug: "criminal-law",
      authorRef: "teamMember2",
      readTime: 8,
      blocks: [
        { type: "paragraph", content: "خیانت در امانت یکی از جرایم علیه اموال است که در ماده ۶۷۴ قانون مجازات اسلامی تعریف شده: هرکس مالی را که بر حسب امانت یا اجاره یا وکالت یا هر کار دیگری به او سپرده شده، تصاحب یا تلف یا مفقود کند، به حبس از شش ماه تا سه سال محکوم خواهد شد." },
        { type: "heading", content: "عناصر تشکیل‌دهنده جرم" },
        { type: "paragraph", content: "سه عنصر باید اثبات شود: ۱) سپردن مال به صورت امانت (نه به قصد تملیک)، ۲) تصاحب، استعمال، تلف یا مفقود کردن مال توسط امین، ۳) سوءنیت و قصد مجرمانه. اگر هر یک اثبات نشود، جرم محقق نمی‌شود." },
        { type: "callout", variant: "info", title: "تفاوت کلیدی", content: "تفاوت خیانت در امانت با سرقت: در سرقت، مال بدون رضایت صاحب ربوده می‌شود. در خیانت در امانت، صاحب مال، مال را با رضایت سپرده ولی امین از اعتماد سوءاستفاده کرده است." },
        { type: "heading", content: "مصادیق رایج" },
        { type: "paragraph", content: "خیانت شریک تجاری در اموال شرکت، سوءاستفاده مدیرعامل از اموال شرکت، خیانت وکیل یا نماینده در اموال موکل، عدم استرداد وسایل امانی پس از درخواست مالک." },
        { type: "faq", items: [
          { q: "اگر مال را مصرف کرده و الان پولش را بدهم، باز هم جرم است؟", a: "بله. استرداد مال بعد از تصاحب، جرم را منتفی نمی‌کند، ولی می‌تواند در تخفیف مجازات مؤثر باشد." },
          { q: "چه مدارکی برای شکایت لازم است؟", a: "هر مدرکی که سپردن مال را اثبات کند: قرارداد، رسید، شهادت شهود، مکاتبات پیامکی یا ایمیلی." },
        ]},
      ],
    },
    {
      slug: "الزام-به-تنظیم-سند-رسمی-راهنما",
      title: "دعوای الزام به تنظیم سند رسمی: راهنمای جامع حقوقی",
      excerpt: "فروشنده سند نمی‌زند؟ راهنمای قدم‌به‌قدم دعوای الزام به تنظیم سند رسمی، مدارک لازم و نکات کلیدی.",
      categorySlug: "property-law",
      authorRef: "teamMember3",
      readTime: 10,
      blocks: [
        { type: "paragraph", content: "یکی از رایج‌ترین دعاوی ملکی در محاکم ایران، دعوای «الزام به تنظیم سند رسمی» است. این دعوا زمانی مطرح می‌شود که فروشنده ملک، علیرغم دریافت ثمن (قیمت)، از حضور در دفترخانه و انتقال سند رسمی خودداری می‌کند." },
        { type: "heading", content: "شرایط طرح دعوا" },
        { type: "paragraph", content: "برای موفقیت در این دعوا، خریدار باید ثابت کند: ۱) معامله واقعی صورت گرفته، ۲) ثمن پرداخت شده یا تعهد پرداخت وجود دارد، ۳) فروشنده مالک رسمی ملک است (استعلام ثبتی)، ۴) ملک در رهن بانک یا بازداشت نیست." },
        { type: "steps", items: [
          "تهیه استعلام ثبتی از اداره ثبت اسناد و املاک",
          "ارسال اظهارنامه رسمی به فروشنده مبنی بر درخواست حضور در دفترخانه",
          "در صورت عدم پاسخ، تقدیم دادخواست «الزام به تنظیم سند رسمی» به دادگاه حقوقی",
          "درخواست دستور موقت (منع نقل و انتقال ملک) برای جلوگیری از فروش مجدد",
          "حضور در جلسات دادرسی و ارائه مدارک",
          "پس از صدور حکم قطعی، اجرای حکم از طریق واحد اجرای احکام",
        ]},
        { type: "callout", variant: "warning", title: "نکته حیاتی", content: "حتماً قبل از طرح دعوا، استعلام ثبتی بگیرید. اگر فروشنده مالک رسمی نباشد یا ملک در رهن باشد، استراتژی دعوا متفاوت خواهد بود." },
        { type: "faq", items: [
          { q: "اگر فروشنده فوت کند چه می‌شود؟", a: "دعوا علیه وراث فروشنده قابل طرح است. وراث ملزم به تنظیم سند هستند." },
          { q: "آیا ملک قولنامه‌ای قابل انتقال سند رسمی است؟", a: "بله، به شرط اینکه فروشنده مالک رسمی باشد و معامله واقعی اثبات شود." },
        ]},
      ],
    },
    {
      slug: "تخلیه-ملک-تجاری-و-مسکونی",
      title: "تخلیه ملک: تفاوت تخلیه مسکونی و تجاری و مراحل قانونی",
      excerpt: "راهنمای حقوقی تخلیه ملک مسکونی و تجاری — تفاوت قوانین، مراحل، دستور تخلیه فوری و دعوای تخلیه.",
      categorySlug: "property-law",
      authorRef: "teamMember3",
      readTime: 9,
      blocks: [
        { type: "paragraph", content: "تخلیه ملک از مستأجر از بحث‌های پرتکرار حقوقی است. قوانین تخلیه بسته به نوع ملک (مسکونی یا تجاری) و نوع قرارداد (رسمی یا عادی) متفاوت است." },
        { type: "heading", content: "تخلیه ملک مسکونی" },
        { type: "paragraph", content: "اگر قرارداد اجاره رسمی (دفترخانه‌ای) باشد و مدت آن منقضی شده باشد، مالک می‌تواند دستور تخلیه فوری از شورای حل اختلاف بگیرد. مستأجر ظرف یک هفته باید ملک را تخلیه کند. اگر قرارداد عادی باشد، مالک باید دعوای تخلیه در دادگاه مطرح کند." },
        { type: "heading", content: "تخلیه ملک تجاری" },
        { type: "paragraph", content: "تخلیه ملک تجاری پیچیده‌تر است. اگر قرارداد بعد از سال ۱۳۷۶ منعقد شده باشد، همان قواعد قانون ۱۳۷۶ اعمال می‌شود. اما قراردادهای قبل از ۱۳۷۶ مشمول حق کسب و پیشه و تجارت (سرقفلی) هستند و تخلیه فقط در موارد خاص امکان‌پذیر است." },
        { type: "callout", variant: "tip", title: "نکته عملی", content: "همیشه قرارداد اجاره را رسمی (در دفترخانه) تنظیم کنید. تخلیه با قرارداد رسمی بسیار سریع‌تر و ارزان‌تر از قرارداد عادی است." },
        { type: "faq", items: [
          { q: "اگر مستأجر اجاره نپردازد، تخلیه ممکن است؟", a: "بله. عدم پرداخت اجاره از موارد فسخ قرارداد و تخلیه است. با اثبات عدم پرداخت، دادگاه حکم تخلیه صادر می‌کند." },
          { q: "تکلیف ودیعه مستأجر در هنگام تخلیه چیست؟", a: "مالک موظف است همزمان با تخلیه، ودیعه مستأجر را مسترد کند." },
          { q: "آیا مالک می‌تواند خودش مستأجر را بیرون کند؟", a: "خیر. تخلیه خودسرانه جرم است. مالک باید از طریق مراجع قانونی (شورا یا دادگاه) اقدام کند." },
        ]},
      ],
    },
    {
      slug: "مطالبه-وجه-چک-برگشتی",
      title: "مطالبه وجه چک برگشتی: مسیر حقوقی و کیفری",
      excerpt: "راهنمای کامل وصول وجه چک برگشتی — تفاوت مسیر حقوقی و کیفری، مهلت‌ها و اقدامات اجرایی.",
      categorySlug: "commercial-law",
      authorRef: "teamMember2",
      readTime: 10,
      blocks: [
        { type: "paragraph", content: "چک برگشتی یکی از مشکلات رایج تجاری است. دارنده چک می‌تواند از دو مسیر حقوقی و کیفری اقدام کند. هر مسیر مزایا و محدودیت‌های خاص خود را دارد." },
        { type: "heading", content: "مسیر حقوقی (مطالبه وجه)" },
        { type: "paragraph", content: "از طریق دادخواست مطالبه وجه در دادگاه حقوقی یا اجرای ثبت. مزیت مسیر حقوقی: بدون محدودیت زمانی، امکان مطالبه خسارت تأخیر تأدیه، اقدام علیه ظهرنویس‌ها." },
        { type: "heading", content: "مسیر کیفری (صدور چک بلامحل)" },
        { type: "paragraph", content: "شکایت کیفری صدور چک بلامحل. مزیت: فشار بازدارنده حبس. محدودیت: باید ظرف ۶ ماه از تاریخ صدور چک، آن را به بانک ارائه و ظرف ۶ ماه از تاریخ برگشت شکایت کنید." },
        { type: "callout", variant: "tip", title: "توصیه", content: "اقدام همزمان از هر دو مسیر (حقوقی + کیفری) معمولاً مؤثرترین روش برای وصول وجه چک است." },
        { type: "faq", items: [
          { q: "اگر صادرکننده فرار کند چه می‌شود؟", a: "می‌توانید ممنوع‌الخروجی او را درخواست کنید و اموالش (ملک، خودرو، حساب بانکی) را توقیف نمایید." },
          { q: "آیا از ظهرنویس هم می‌شود مطالبه کرد؟", a: "بله، ولی باید چک را ظرف ۱۵ روز از تاریخ سررسید به بانک ارائه کرده باشید." },
        ]},
      ],
    },
    {
      slug: "تنظیم-قرارداد-تجاری-نکات-کلیدی",
      title: "نکات کلیدی تنظیم قراردادهای تجاری: راهنمای کسب‌وکارها",
      excerpt: "بندهای ضروری قراردادهای تجاری، اشتباهات رایج و نکاتی که باعث محافظت از منافع کسب‌وکار شما می‌شود.",
      categorySlug: "commercial-law",
      authorRef: "teamMember",
      readTime: 8,
      blocks: [
        { type: "paragraph", content: "قرارداد تجاری سنگ بنای هر رابطه کسب‌وکاری است. یک قرارداد خوب نه تنها حقوق و تعهدات طرفین را مشخص می‌کند، بلکه مکانیزم‌های حل اختلاف و جبران خسارت را از قبل تعیین می‌کند تا در صورت بروز مشکل، نیازی به مراجعه به دادگاه نباشد." },
        { type: "heading", content: "بندهای ضروری هر قرارداد تجاری" },
        { type: "paragraph", content: "مشخصات کامل طرفین، موضوع دقیق قرارداد، مدت زمان و تاریخ‌های کلیدی، مبلغ و شرایط پرداخت، شرایط فسخ، جریمه تخلف (وجه التزام)، بند فورس ماژور، بند حل اختلاف (داوری یا دادگاه) و بند محرمانگی." },
        { type: "heading", content: "اشتباهات رایج" },
        { type: "paragraph", content: "استفاده از نمونه‌های آماده بدون تطبیق با شرایط خاص، عدم ذکر جریمه تخلف، مبهم بودن موضوع قرارداد، نداشتن بند فورس ماژور و عدم تعیین مرجع حل اختلاف از شایع‌ترین اشتباهات هستند." },
        { type: "callout", variant: "warning", title: "اخطار", content: "هرگز قراردادی را بدون بررسی حقوقی امضا نکنید. هزینه بررسی قرارداد بسیار کمتر از هزینه دعوای قضایی ناشی از قرارداد معیوب است." },
        { type: "faq", items: [
          { q: "آیا قرارداد شفاهی اعتبار قانونی دارد؟", a: "بله، اما اثبات آن بسیار دشوار است. همیشه قرارداد را کتبی تنظیم کنید." },
          { q: "حداقل مدت زمان نگهداری قراردادها چقدر است؟", a: "حداقل ۱۰ سال پس از پایان قرارداد، قراردادها و مستندات مرتبط را نگه دارید." },
        ]},
      ],
    },
  ];

  const categoryMap: Record<string, typeof civilCategory> = {
    "civil-law": civilCategory,
    "criminal-law": criminalCategory,
    "family-law": familyCategory,
    "property-law": propertyCategory,
    "commercial-law": commercialCategory,
  };

  const authorMap: Record<string, typeof teamMember> = {
    teamMember,
    teamMember2,
    teamMember3,
    teamMember4,
  };

  for (const art of seoArticles) {
    const existing = await db.article.findFirst({ where: { slug: art.slug } });
    if (!existing) {
      const author = authorMap[art.authorRef];
      const cat = categoryMap[art.categorySlug];
      await db.article.create({
        data: {
          authorId: author?.id ?? teamMember.id,
          categoryId: cat?.id,
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          blocks: JSON.stringify(art.blocks),
          status: "PUBLISHED",
          readTimeMin: art.readTime,
          publishedAt: new Date(),
        },
      });
      console.log(`SEO article seeded: ${art.slug}`);
    }
  }
  console.log("All SEO articles seeded");

  // ── Calculators ─────────────────────────────────────────────────────────
  // Delete old slug calculators if they exist (from previous seed)
  for (const oldSlug of ["مهریه", "دیه", "خسارت-تأخیر", "سهم-الارث"]) {
    await db.calculator.deleteMany({ where: { slug: oldSlug } });
  }

  const calcItems = [
    { slug: "delay-damage", titleFA: "خسارت تأخیر تأدیه", titleEN: "Late Payment Damages", descriptionFA: "محاسبه خسارت تأخیر تأدیه بر اساس شاخص بهای بانک مرکزی (ماده ۵۲۲ ق.آ.د.م)", descriptionEN: "Calculate late payment damages based on CBI price index (Article 522)", order: 1, isPublished: true },
    { slug: "dowry", titleFA: "مهریه به نرخ روز", titleEN: "Dowry at Current Rate", descriptionFA: "محاسبه ارزش فعلی مهریه‌ی وجه نقد بر اساس شاخص بها", descriptionEN: "Calculate current value of cash dowry based on price index", order: 2, isPublished: true },
    { slug: "diye", titleFA: "محاسبه دیه", titleEN: "Diye (Blood Money) Calculator", descriptionFA: "محاسبه مبلغ دیه بر اساس نرخ سالانه اعلامی قوه قضاییه", descriptionEN: "Calculate diye based on annual judiciary-announced rates", order: 3, isPublished: true },
    { slug: "deadlines", titleFA: "محاسبه مواعد قضایی", titleEN: "Legal Deadline Calculator", descriptionFA: "محاسبه مهلت‌های قانونی با احتساب تعطیلات رسمی (باب مواعد ق.آ.د.م)", descriptionEN: "Calculate legal deadlines accounting for official holidays", order: 4, isPublished: true },
    { slug: "inheritance", titleFA: "محاسبه سهم‌الارث", titleEN: "Inheritance Calculator", descriptionFA: "محاسبه سهم وراث طبق قانون (به‌زودی)", descriptionEN: "Calculate inheritance shares (coming soon)", order: 5, isPublished: false },
  ];

  for (const calc of calcItems) {
    await db.calculator.upsert({
      where: { slug: calc.slug },
      update: { titleFA: calc.titleFA, titleEN: calc.titleEN, descriptionFA: calc.descriptionFA, descriptionEN: calc.descriptionEN, order: calc.order, isPublished: calc.isPublished },
      create: calc,
    });
  }
  console.log("Calculators seeded");

  // ── PriceIndex — imported from _reference/cbi-index.json via scripts/import-cbi-index.ts
  // Run: npx tsx scripts/import-cbi-index.ts
  const priceIndexCount = await db.priceIndex.count();
  if (priceIndexCount === 0) {
    console.log("PriceIndex is empty — run: npx tsx scripts/import-cbi-index.ts");
  } else {
    console.log(`PriceIndex already has ${priceIndexCount} records`);
  }

  // ── DiyeRate (sample data — clearly labeled as fake) ──────────────────
  const sampleDiyeRates = [
    { jalaliYear: 1402, amount: 9000000000n, sourceTitle: "داده نمونه (ساختگی — فقط تست)" },
    { jalaliYear: 1403, amount: 12000000000n, sourceTitle: "داده نمونه (ساختگی — فقط تست)" },
    { jalaliYear: 1404, amount: 18000000000n, sourceTitle: "داده نمونه (ساختگی — فقط تست)" },
  ];

  for (const rate of sampleDiyeRates) {
    await db.diyeRate.upsert({
      where: { jalaliYear: rate.jalaliYear },
      update: { amount: rate.amount, sourceTitle: rate.sourceTitle },
      create: rate,
    });
  }
  console.log("DiyeRate sample data seeded (labeled as fake)");

  // ── Legal Form Categories (Topic Tree) ──────────────────────────────────
  const formCategories = [
    { slug: "dadkhast", nameFA: "دادخواست", nameEN: "Petition", descFA: "نمونه دادخواست‌های حقوقی جهت طرح دعوا در دادگاه", icon: "FileText", order: 1 },
    { slug: "shekvaiye", nameFA: "شکواییه", nameEN: "Complaint", descFA: "نمونه شکواییه‌های کیفری جهت طرح شکایت در دادسرا", icon: "AlertTriangle", order: 2 },
    { slug: "ezharname", nameFA: "اظهارنامه", nameEN: "Declaration", descFA: "نمونه اظهارنامه‌های رسمی جهت ابلاغ قانونی", icon: "MessageSquare", order: 3 },
    { slug: "tajdidnazar", nameFA: "تجدیدنظرخواهی", nameEN: "Appeal", descFA: "نمونه دادخواست تجدیدنظرخواهی از آرای دادگاه", icon: "Scale", order: 4 },
  ];

  const catMap: Record<string, number> = {};
  for (const cat of formCategories) {
    const c = await db.legalFormCategory.upsert({
      where: { slug: cat.slug },
      update: { nameFA: cat.nameFA, nameEN: cat.nameEN, descFA: cat.descFA, icon: cat.icon, order: cat.order },
      create: cat,
    });
    catMap[cat.slug] = c.id;
  }
  console.log("Legal form categories seeded");

  const JUDICIARY_LOGO = "/judiciary-logo.png";

  // Helper: professional form HTML wrapper matching judiciary form layout
  function professionalForm(opts: {
    docTitle: string;
    docType: string;
    caseLabel?: string;
    parties: { role: string; fields: string[] }[];
    subjectLabel: string;
    subjectContent: string;
    evidenceContent: string;
    bodyCourtName: string;
    bodyText: string;
    signerLabel: string;
  }): string {
    const partyRows = opts.parties.map(p =>
      `<tr><td class="role-cell">${p.role}</td>${p.fields.map(f => `<td class="value">${f}</td>`).join("")}</tr>`
    ).join("\n");

    return `<div class="page" dir="rtl">
<div class="frame">
<!-- Brand Header -->
<div class="brand-head">
<div class="brand-logo"><img src="${JUDICIARY_LOGO}" alt="نشان قوه قضاییه"/></div>
<div class="brand-text">قوه قضاییه جمهوری اسلامی ایران</div>
<div class="brand-sub">اوراق قضایی و خدمات الکترونیک قضایی</div>
</div>

<!-- Title -->
<div class="p-title">${opts.docTitle}</div>

<!-- Top Meta -->
<div class="top-meta">
<div>نوع اوراق</div><div class="val">${opts.docType}</div>
<div>${opts.caseLabel || "شماره پرونده"}</div><div class="val">..................</div>
<div>تاریخ</div><div class="val">......../......../........</div>
<div>کد رهگیری</div><div class="val">..................</div>
</div>

<!-- Parties Table -->
<table class="print-table">
<colgroup><col style="width:22mm"><col style="width:34mm"><col style="width:22mm"><col style="width:18mm"><col style="width:22mm"><col style="width:22mm"><col style="width:22mm"><col></colgroup>
<tr><th class="caption" colspan="8">مشخصات اشخاص پرونده</th></tr>
<tr><th>سمت</th><th>نام/عنوان</th><th>نام پدر/شناسه</th><th>سن/ثبت</th><th>شغل/واحد</th><th>کد ملی/مجوز</th><th>تماس/نماینده</th><th class="address-head">نشانی و اقامتگاه</th></tr>
${partyRows}
</table>

<!-- Subject & Evidence -->
<table class="print-table">
<tr class="section-row"><td class="label-cell">${opts.subjectLabel}</td><td class="value">${opts.subjectContent}</td></tr>
<tr class="section-row"><td class="label-cell">دلایل و منضمات</td><td class="value">${opts.evidenceContent}</td></tr>
</table>

<!-- Body -->
<div class="body-box">
<div class="body-head">${opts.bodyCourtName}</div>
<div class="body-preview">${opts.bodyText}</div>
</div>

<!-- Signature -->
<div class="signature-line">محل امضاء / مهر / اثر انگشت ـ ${opts.signerLabel}</div>

<!-- Footer -->
<div class="footer-grid">
<div>ارجاع / اقدام اداری:<br>جهت ثبت، ارجاع و اقدام مقتضی.<br>نام: ............... ـ تاریخ: ...............</div>
<div>هزینه‌ها و پرداخت:<br>هزینه/تمبر: ...............<br>مرجع بانک: ............... ـ پیگیری: ...............<br>جمع پرداختی: ...............</div>
</div>
</div>
</div>`;
  }

  // ── Legal Form Templates ────────────────────────────────────────────────
  const formTemplates = [
    {
      slug: "dadkhast-motalebe-vajh",
      categoryId: catMap["dadkhast"],
      docType: "petition",
      titleFA: "دادخواست مطالبه وجه",
      titleEN: "Petition for Claim of Debt",
      descFA: "نمونه دادخواست مطالبه وجه (طلب) با ذکر دلایل و مستندات قانونی. مناسب برای مطالبه وجه چک، سفته، قرارداد یا هر نوع بدهی.",
      descEN: "Sample petition for debt collection with legal grounds and evidence.",
      order: 1,
      content: professionalForm({
        docTitle: "دادخواست",
        docType: "دادخواست حقوقی",
        caseLabel: "شماره پرونده",
        parties: [
          { role: "خواهان", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "خوانده", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "خواسته و بهای آن",
        subjectContent: "مطالبه وجه به مبلغ ............... ریال به انضمام خسارت تأخیر تأدیه و کلیه خسارات دادرسی",
        evidenceContent: "۱. تصویر مصدق چک / سفته / قرارداد\n۲. تصویر کارت ملی خواهان\n۳. گواهینامه عدم پرداخت بانک\n۴. سایر مدارک",
        bodyCourtName: "ریاست محترم دادگاه عمومی حقوقی",
        bodyText: `با سلام و احترام
اینجانب ............... (خواهان) به استحضار می‌رساند:
خوانده محترم آقا/خانم ............... به موجب ............... (چک شماره ... / سفته شماره ... / قرارداد مورخ ...) مبلغ ............... ریال به اینجانب بدهکار می‌باشد که علیرغم مراجعات مکرر و ارسال اظهارنامه شماره ............... مورخ ............... از پرداخت آن استنکاف می‌نماید.

لذا با تقدیم این دادخواست، مستنداً به مواد ۱۹۸ و ۵۱۹ قانون آیین دادرسی مدنی و ماده ۵۲۲ همان قانون، تقاضای صدور حکم بر محکومیت خوانده به پرداخت:
۱. اصل خواسته به مبلغ ............... ریال
۲. خسارت تأخیر تأدیه از تاریخ ............... لغایت اجرای حکم
۳. کلیه خسارات دادرسی (هزینه دادرسی، حق‌الوکاله وکیل)
را از محضر دادگاه محترم استدعا دارم.`,
        signerLabel: "خواهان",
      }),
    },
    {
      slug: "dadkhast-takliye-molk",
      categoryId: catMap["dadkhast"],
      docType: "petition",
      titleFA: "دادخواست تخلیه ملک",
      titleEN: "Petition for Property Eviction",
      descFA: "نمونه دادخواست تخلیه ملک مسکونی یا تجاری پس از انقضای مدت اجاره. شامل مستندات و دلایل قانونی.",
      descEN: "Sample petition for eviction of residential or commercial property after lease expiry.",
      order: 2,
      content: professionalForm({
        docTitle: "دادخواست",
        docType: "دادخواست حقوقی",
        parties: [
          { role: "خواهان (موجر)", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "خوانده (مستأجر)", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "خواسته و بهای آن",
        subjectContent: "تخلیه عین مستأجره واقع در ............... و مطالبه اجرت‌المثل ایام تصرف",
        evidenceContent: "۱. تصویر مصدق قرارداد اجاره\n۲. تصویر سند مالکیت\n۳. تصویر کارت ملی خواهان\n۴. اظهارنامه رسمی",
        bodyCourtName: "ریاست محترم شورای حل اختلاف",
        bodyText: `با سلام و احترام
اینجانب ............... (موجر/مالک) به استحضار می‌رساند:
به موجب قرارداد اجاره شماره ............... مورخ ...............، ملک واقع در نشانی ............... را به خوانده محترم آقا/خانم ............... به اجاره واگذار نموده‌ام. مدت قرارداد اجاره در تاریخ ............... منقضی شده و خوانده علیرغم ارسال اظهارنامه رسمی شماره ............... مورخ ............... از تخلیه ملک خودداری می‌نماید.

لذا مستنداً به ماده ۳ قانون روابط موجر و مستأجر مصوب ۱۳۷۶ و مواد ۴۶۸ و ۴۹۴ قانون مدنی، تقاضای صدور دستور تخلیه ملک مذکور و محکومیت خوانده به پرداخت اجرت‌المثل ایام تصرف را از محضر دادگاه محترم استدعا دارم.`,
        signerLabel: "خواهان (موجر)",
      }),
    },
    {
      slug: "shekvaiye-kelahbardari",
      categoryId: catMap["shekvaiye"],
      docType: "complaint",
      titleFA: "شکواییه کلاهبرداری",
      titleEN: "Criminal Complaint for Fraud",
      descFA: "نمونه شکواییه کلاهبرداری با ذکر عناصر تشکیل‌دهنده جرم. مناسب برای کلاهبرداری حضوری و اینترنتی.",
      descEN: "Sample criminal complaint for fraud.",
      order: 3,
      content: professionalForm({
        docTitle: "شکواییه",
        docType: "شکواییه کیفری",
        caseLabel: "شماره پرونده",
        parties: [
          { role: "شاکی", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "مشتکی‌عنه", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "موضوع شکایت",
        subjectContent: "کلاهبرداری موضوع ماده ۱ قانون تشدید مجازات مرتکبین ارتشا و اختلاس و کلاهبرداری",
        evidenceContent: "۱. تصویر مدارک هویتی\n۲. رسید بانکی / فیش واریزی\n۳. تصویر مکالمات و پیام‌ها\n۴. سایر مستندات",
        bodyCourtName: "دادستان محترم دادسرای عمومی و انقلاب",
        bodyText: `با سلام و احترام
اینجانب ............... (شاکی) شکایت خود را علیه آقا/خانم ............... (مشتکی‌عنه) به شرح ذیل به استحضار می‌رسانم:
مشتکی‌عنه در تاریخ ............... با توسل به وسایل متقلبانه و اغفال اینجانب از طریق ............... (شرح عمل متقلبانه) مبلغ ............... ریال از اینجانب کلاهبرداری نموده است.

توضیح اینکه مشتکی‌عنه با ارائه ............... (وعده‌های دروغین / مدارک جعلی / ...) اینجانب را فریب داده و مبلغ مذکور را از طریق ............... (واریز بانکی / نقدی / ...) دریافت نموده و پس از آن از استرداد وجه و انجام تعهدات خود استنکاف نموده است.

لذا مستنداً به ماده ۱ قانون تشدید مجازات مرتکبین ارتشا و اختلاس و کلاهبرداری، تقاضای تعقیب و مجازات مشتکی‌عنه و رد مال (استرداد مبلغ ............... ریال) را دارم.`,
        signerLabel: "شاکی",
      }),
    },
    {
      slug: "shekvaiye-khiyanat-dar-amanat",
      categoryId: catMap["shekvaiye"],
      docType: "complaint",
      titleFA: "شکواییه خیانت در امانت",
      titleEN: "Criminal Complaint for Breach of Trust",
      descFA: "نمونه شکواییه خیانت در امانت طبق ماده ۶۷۴ قانون مجازات اسلامی.",
      descEN: "Sample criminal complaint for breach of trust under Article 674 of Islamic Penal Code.",
      order: 4,
      content: professionalForm({
        docTitle: "شکواییه",
        docType: "شکواییه کیفری",
        parties: [
          { role: "شاکی", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "مشتکی‌عنه", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "موضوع شکایت",
        subjectContent: "خیانت در امانت موضوع ماده ۶۷۴ قانون مجازات اسلامی",
        evidenceContent: "۱. تصویر مدارک هویتی\n۲. رسید تحویل مال امانی / قرارداد\n۳. مکاتبات\n۴. شهادت شهود",
        bodyCourtName: "دادستان محترم دادسرای عمومی و انقلاب",
        bodyText: `با سلام و احترام
اینجانب ............... (شاکی) شکایت خود را علیه آقا/خانم ............... (مشتکی‌عنه) به شرح ذیل اعلام می‌دارم:
اینجانب در تاریخ ............... به موجب ............... (قرارداد / رسید / توافق شفاهی) مال موضوع امانت شامل ............... را به مشتکی‌عنه سپرده‌ام. نامبرده علیرغم مراجعات مکرر و درخواست استرداد مال امانی، از بازگرداندن آن خودداری و آن را تصاحب / تلف / مفقود نموده است.

لذا مستنداً به ماده ۶۷۴ قانون مجازات اسلامی (تعزیرات)، تقاضای تعقیب و مجازات مشتکی‌عنه و رد مال را دارم.`,
        signerLabel: "شاکی",
      }),
    },
    {
      slug: "ezharname-esterdad-vadie",
      categoryId: catMap["ezharname"],
      docType: "declaration",
      titleFA: "اظهارنامه استرداد ودیعه (رهن)",
      titleEN: "Declaration for Return of Deposit",
      descFA: "نمونه اظهارنامه رسمی جهت مطالبه ودیعه (رهن) از موجر پس از اتمام قرارداد اجاره و تخلیه ملک.",
      descEN: "Sample official declaration for demanding return of rental deposit.",
      order: 5,
      content: professionalForm({
        docTitle: "اظهارنامه",
        docType: "اظهارنامه رسمی",
        parties: [
          { role: "اظهارکننده", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "مخاطب", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "موضوع اظهارنامه",
        subjectContent: "مطالبه استرداد ودیعه (رهن) اجاره",
        evidenceContent: "۱. قرارداد اجاره\n۲. رسید پرداخت ودیعه\n۳. صورت‌جلسه تحویل ملک",
        bodyCourtName: "مخاطب محترم",
        bodyText: `با سلام و احترام
همانگونه که مستحضرید، اینجانب ............... به موجب قرارداد اجاره شماره ............... مورخ ............... مبلغ ............... ریال بابت ودیعه (رهن) ملک واقع در نشانی ............... به جنابعالی پرداخت نموده‌ام.

نظر به اینکه مدت قرارداد اجاره در تاریخ ............... منقضی شده و ملک مذکور در تاریخ ............... تخلیه و تحویل گردیده است، بدینوسیله رسماً از جنابعالی درخواست می‌نمایم ظرف مدت ده (۱۰) روز از تاریخ ابلاغ این اظهارنامه نسبت به استرداد مبلغ ودیعه اقدام فرمایید.

بدیهی است در صورت عدم استرداد در مهلت مقرر، اینجانب ناگزیر از پیگیری موضوع از طریق مراجع قضایی و مطالبه خسارت تأخیر تأدیه خواهم بود.`,
        signerLabel: "اظهارکننده",
      }),
    },
    {
      slug: "ezharname-faskh-gharardad",
      categoryId: catMap["ezharname"],
      docType: "declaration",
      titleFA: "اظهارنامه فسخ قرارداد",
      titleEN: "Declaration for Contract Termination",
      descFA: "نمونه اظهارنامه اعلام فسخ قرارداد به طرف مقابل. مناسب برای فسخ قراردادهای اجاره، تجاری و خدماتی.",
      descEN: "Sample declaration for notifying contract termination.",
      order: 6,
      content: professionalForm({
        docTitle: "اظهارنامه",
        docType: "اظهارنامه رسمی",
        parties: [
          { role: "اظهارکننده", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "مخاطب", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "موضوع اظهارنامه",
        subjectContent: "اعلام فسخ قرارداد شماره ............... مورخ ...............",
        evidenceContent: "۱. قرارداد اصلی\n۲. مدارک مثبته تخلف طرف مقابل\n۳. مکاتبات قبلی",
        bodyCourtName: "مخاطب محترم",
        bodyText: `با سلام و احترام
بدینوسیله رسماً به استحضار می‌رساند که اینجانب ............... به موجب حق فسخ ناشی از ............... (شرط فسخ مندرج در بند ... قرارداد / خیار تخلف از شرط / خیار عیب / ...) مراتب فسخ قرارداد شماره ............... مورخ ............... فیمابین را اعلام می‌دارم.

دلایل فسخ:
............... (شرح موجبات فسخ مانند: عدم ایفای تعهدات، تخلف از شروط قرارداد، عیب در مورد معامله و ...)

لذا خواهشمند است ظرف مدت ............... روز از تاریخ ابلاغ این اظهارنامه نسبت به ............... (تسویه حساب / استرداد مال / تحویل ملک / ...) اقدام فرمایید.`,
        signerLabel: "اظهارکننده",
      }),
    },
    {
      slug: "tajdidnazar-hokm-hoghooghi",
      categoryId: catMap["tajdidnazar"],
      docType: "appeal",
      titleFA: "تجدیدنظرخواهی از حکم حقوقی",
      titleEN: "Appeal of Civil Court Judgment",
      descFA: "نمونه دادخواست تجدیدنظرخواهی از آرای دادگاه حقوقی. شامل جهات قانونی تجدیدنظرخواهی.",
      descEN: "Sample appeal petition against civil court judgments.",
      order: 7,
      content: professionalForm({
        docTitle: "دادخواست تجدیدنظرخواهی",
        docType: "تجدیدنظرخواهی",
        caseLabel: "شماره دادنامه",
        parties: [
          { role: "تجدیدنظرخواه", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
          { role: "تجدیدنظرخوانده", fields: ["...............", "...............", "......", "...............", "...............", "...............", "..............."] },
        ],
        subjectLabel: "موضوع تجدیدنظرخواهی",
        subjectContent: "تجدیدنظرخواهی از دادنامه شماره ............... مورخ ............... صادره از شعبه ...............",
        evidenceContent: "۱. تصویر دادنامه بدوی\n۲. تصویر ابلاغیه\n۳. مدارک و مستندات جدید\n۴. تصویر مدارک هویتی",
        bodyCourtName: "ریاست و قضات محترم دادگاه تجدیدنظر استان",
        bodyText: `با سلام و احترام
اینجانب ............... (تجدیدنظرخواه) نسبت به دادنامه شماره ............... مورخ ............... صادره از شعبه ............... دادگاه عمومی حقوقی ............... که در تاریخ ............... به اینجانب ابلاغ شده، در مهلت قانونی معترض بوده و تقاضای تجدیدنظر دارم.

جهات تجدیدنظرخواهی (به استناد ماده ۳۴۸ قانون آیین دادرسی مدنی):
۱. ادعای عدم اعتبار مستندات دادگاه: ...............
۲. ادعای فقدان شرایط قانونی شهادت شهود: ...............
۳. ادعای عدم توجه قاضی به دلایل ابرازی: ...............

لذا با تقدیم این دادخواست، تقاضای نقض دادنامه بدوی و صدور حکم شایسته را از محضر دادگاه محترم تجدیدنظر استدعا دارم.`,
        signerLabel: "تجدیدنظرخواه",
      }),
    },
  ];

  for (const tmpl of formTemplates) {
    await db.legalFormTemplate.upsert({
      where: { slug: tmpl.slug },
      update: { titleFA: tmpl.titleFA, titleEN: tmpl.titleEN, descFA: tmpl.descFA, descEN: tmpl.descEN, content: tmpl.content, order: tmpl.order, categoryId: tmpl.categoryId },
      create: tmpl,
    });
  }
  console.log("Legal form templates seeded");

  // ── SiteSettings ───────────────────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", data: "{}" },
  });

  console.log("\nSeed complete!");
  console.log("Login credentials:");
  console.log("  Admin:  admin@legalfirm.ir  /  Admin@1234");
  console.log("  Lawyer: lawyer@legalfirm.ir /  Lawyer@1234");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
