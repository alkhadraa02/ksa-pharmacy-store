# صيدلية الشفاء — متجر صيدلية إلكترونية ولوحة تحكم

# Al-Shifa Pharmacy — Online pharmacy store + dashboard

[العربية](#العربية) · [English](#english)

---

## العربية

متجر صيدلية إلكترونية متكامل بواجهة عربية من اليمين إلى اليسار (RTL) مع لوحة تحكم للصيدلاني والمدير، مبني بـ Next.js 16 وPrisma وSQLite. لا يحتاج أي خدمة مدفوعة أو مفاتيح خارجية.

### المميزات

- أقسام: الأدوية، الفيتامينات والمكملات، الأم والطفل، العناية بالبشرة، الأجهزة الطبية.
- صفحة منتج فيها المادة الفعالة والشكل الدوائي والتركيز وشارة «بدون وصفة» أو «بوصفة طبية فقط».
- بحث وتصفية (القسم، الشكل الدوائي، الوصفة، التوفر) وترتيب.
- سلة وإتمام طلب: مواعيد التوصيل، الدفع عند الاستلام، وواجهة `PaymentProvider` مع تنفيذ تجريبي (Mock).
- رفع الوصفة الطبية قبل إتمام الطلب للأصناف التي تتطلبها، مع تخزين محلي وفحص نوع الملف الحقيقي.
- تتبع الطلب برقم الطلب والجوال.
- نموذج طلب استشارة صيدلاني.
- لوحة التحكم: إدارة المنتجات (مخزون وتواريخ صلاحية)، تنبيهات انخفاض المخزون وقرب الانتهاء، طابور مراجعة الوصفات (قبول/رفض مع ملاحظة)، لوحة الطلبات، العملاء، الاستشارات، وتقرير المبيعات مع ضريبة القيمة المضافة 15%.
- أمان: كلمات مرور مُجزّأة (bcrypt)، جلسة بكوكي httpOnly، التحقق من المدخلات بـ zod، تحديد معدل الطلبات، رؤوس أمان (CSP وغيرها).
- SEO: بيانات وصفية، `sitemap.xml`، `robots.txt`، `llms.txt`، وJSON-LD.

### لقطات الشاشة

> أضف لقطاتك في مجلد `docs/screenshots/` ثم اربطها هنا.

### التقنيات

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite · zod · bcryptjs · Vitest.

### التشغيل في 5 أوامر

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

ثم افتح `http://localhost:3113`. للإنتاج: `npm run build` ثم `npm run start`.

### دخول المدير الافتراضي

القيم تأتي من `.env` (انظر `.env.example`):

- البريد: `admin@pharmacy.local` (المتغير `ADMIN_EMAIL`)
- كلمة المرور: `change-me-now` (المتغير `ADMIN_PASSWORD`) — **غيّرها قبل أي استخدام حقيقي**.

الدخول من `/login`، ثم لوحة التحكم على `/dashboard`.

### الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير على المنفذ 3113 |
| `npm run build` | بناء الإنتاج |
| `npm run start` | تشغيل نسخة الإنتاج على 3113 |
| `npm test` | اختبارات Vitest |
| `npm run db:push` | إنشاء الجداول |
| `npm run db:seed` | بيانات تجريبية سعودية + حساب المدير |

### هيكل المشروع

```
prisma/        schema.prisma و seed.ts (قاعدة SQLite محلية غير مرفوعة)
src/app/       صفحات المتجر ولوحة التحكم ومسارات API
src/components/ مكوّنات الواجهة
src/lib/       الأسعار والطلبات والتحقق والرفع والمصادقة
tests/         اختبارات Vitest
public/        llms.txt
```

---

## English

A complete online pharmacy store with an Arabic RTL interface and an admin dashboard, built with Next.js 16, Prisma and SQLite. No paid services or external API keys required.

### Features

- Categories: medicines, vitamins & supplements, mother & baby, skin care, medical devices.
- Product pages with active ingredient, dosage form, strength and an OTC / prescription-only badge.
- Search with filters (category, dosage form, prescription, availability) and sorting.
- Cart and checkout: delivery slots, cash on delivery, and a `PaymentProvider` interface with a mock implementation.
- Prescription upload required before checkout for prescription-only items, stored locally with magic-byte file-type detection.
- Order tracking by order number and phone.
- Pharmacist consultation request form.
- Dashboard: products CRUD (stock, expiry dates), low-stock and near-expiry alerts, prescription review queue (approve/reject with a note), orders board, customers, consultations, and a sales report with 15% VAT.
- Security: bcrypt-hashed passwords, httpOnly session cookie, zod validation, rate limiting, security headers (CSP etc.).
- SEO: metadata, `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD.

### Screenshots

> Add your screenshots to `docs/screenshots/` and link them here.

### Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite · zod · bcryptjs · Vitest.

### Setup in 5 commands

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Then open `http://localhost:3113`. For production: `npm run build` then `npm run start`.

### Default admin login

Values come from `.env` (see `.env.example`):

- Email: `admin@pharmacy.local` (`ADMIN_EMAIL`)
- Password: `change-me-now` (`ADMIN_PASSWORD`) — **change it before any real use**.

Sign in at `/login`, then use the dashboard at `/dashboard`.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3113 |
| `npm run build` | Production build |
| `npm run start` | Production server on 3113 |
| `npm test` | Vitest suite |
| `npm run db:push` | Create the tables |
| `npm run db:seed` | Saudi sample data + admin account |

### Project structure

```
prisma/         schema.prisma and seed.ts (local SQLite file is gitignored)
src/app/        storefront, dashboard and API routes
src/components/ UI components
src/lib/        pricing, orders, validation, uploads, auth
tests/          Vitest tests
public/         llms.txt
```

## License

MIT — Copyright (c) 2026 TechnologyKSA
