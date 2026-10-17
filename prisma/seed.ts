import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeTotals } from "../src/lib/pricing";

const db = new PrismaClient();

const day = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * day);

const categories = [
  { slug: "medicines", name: "الأدوية", icon: "💊", description: "مسكنات وأدوية البرد والمعدة والحساسية والأمراض المزمنة", sortOrder: 1 },
  { slug: "vitamins", name: "الفيتامينات والمكملات", icon: "🍊", description: "فيتامينات ومعادن ومكملات غذائية يومية", sortOrder: 2 },
  { slug: "mother-baby", name: "الأم والطفل", icon: "🍼", description: "حليب أطفال وحفاضات ومستلزمات العناية بالرضّع", sortOrder: 3 },
  { slug: "skin-care", name: "العناية بالبشرة", icon: "🧴", description: "مرطبات وواقيات شمس وغسولات للبشرة الحساسة", sortOrder: 4 },
  { slug: "devices", name: "الأجهزة الطبية", icon: "🩺", description: "أجهزة قياس الضغط والسكر والحرارة ومستلزمات الإسعاف", sortOrder: 5 },
];

type P = {
  slug: string;
  name: string;
  brand: string;
  cat: string;
  ingredient: string;
  form: string;
  strength: string;
  rx: boolean;
  price: number;
  stock: number;
  low?: number;
  expiry: number | null;
  desc: string;
};

const products: P[] = [
  { slug: "paracetamol-500", name: "باراسيتامول 500 مجم أقراص", brand: "بنادول", cat: "medicines", ingredient: "باراسيتامول", form: "أقراص", strength: "500 مجم", rx: false, price: 12.5, stock: 140, expiry: 520, desc: "مسكن للآلام وخافض للحرارة. لا تتجاوز 8 أقراص خلال 24 ساعة." },
  { slug: "ibuprofen-400", name: "إيبوبروفين 400 مجم أقراص", brand: "بروفين", cat: "medicines", ingredient: "إيبوبروفين", form: "أقراص", strength: "400 مجم", rx: false, price: 16, stock: 95, expiry: 430, desc: "مضاد للالتهاب ومسكن للآلام. يؤخذ بعد الأكل." },
  { slug: "cetirizine-10", name: "سيتريزين 10 مجم أقراص", brand: "زيرتك", cat: "medicines", ingredient: "سيتريزين", form: "أقراص", strength: "10 مجم", rx: false, price: 21, stock: 60, expiry: 380, desc: "لعلاج أعراض الحساسية الموسمية والرشح التحسسي." },
  { slug: "omeprazole-20", name: "أوميبرازول 20 مجم كبسولات", brand: "لوسك", cat: "medicines", ingredient: "أوميبرازول", form: "كبسولات", strength: "20 مجم", rx: false, price: 29, stock: 8, low: 12, expiry: 300, desc: "لعلاج حموضة المعدة والارتجاع. يؤخذ قبل الفطور." },
  { slug: "oral-rehydration", name: "أملاح الإرواء الفموية", brand: "رهيدران", cat: "medicines", ingredient: "أملاح معالجة الجفاف", form: "أكياس", strength: "20.5 جم", rx: false, price: 14, stock: 75, expiry: 40, desc: "تعويض السوائل والأملاح عند الإسهال والإجهاد الحراري." },
  { slug: "amoxicillin-500", name: "أموكسيسيلين 500 مجم كبسولات", brand: "أموكسيل", cat: "medicines", ingredient: "أموكسيسيلين", form: "كبسولات", strength: "500 مجم", rx: true, price: 24, stock: 50, expiry: 400, desc: "مضاد حيوي. يصرف بوصفة طبية فقط ويُستكمل كامل الكورس." },
  { slug: "azithromycin-250", name: "أزيثروميسين 250 مجم أقراص", brand: "زيثروماكس", cat: "medicines", ingredient: "أزيثروميسين", form: "أقراص", strength: "250 مجم", rx: true, price: 38, stock: 30, expiry: 350, desc: "مضاد حيوي لالتهابات الجهاز التنفسي. بوصفة طبية فقط." },
  { slug: "metformin-850", name: "ميتفورمين 850 مجم أقراص", brand: "جلوكوفاج", cat: "medicines", ingredient: "ميتفورمين", form: "أقراص", strength: "850 مجم", rx: true, price: 19, stock: 120, expiry: 600, desc: "لعلاج السكري من النوع الثاني. بوصفة طبية فقط." },
  { slug: "amlodipine-5", name: "أملوديبين 5 مجم أقراص", brand: "نورفاسك", cat: "medicines", ingredient: "أملوديبين", form: "أقراص", strength: "5 مجم", rx: true, price: 27, stock: 6, low: 10, expiry: 25, desc: "لعلاج ارتفاع ضغط الدم. بوصفة طبية فقط." },
  { slug: "vitamin-d3-5000", name: "فيتامين د3 5000 وحدة", brand: "ناتشرز واي", cat: "vitamins", ingredient: "كوليكالسيفيرول", form: "كبسولات", strength: "5000 وحدة", rx: false, price: 59, stock: 80, expiry: 700, desc: "يدعم صحة العظام والمناعة. كبسولة يوميًا مع وجبة." },
  { slug: "vitamin-c-1000", name: "فيتامين ج 1000 مجم فوّار", brand: "سيديفيتا", cat: "vitamins", ingredient: "حمض الأسكوربيك", form: "أقراص فوارة", strength: "1000 مجم", rx: false, price: 32, stock: 110, expiry: 550, desc: "مضاد أكسدة يدعم المناعة. بنكهة البرتقال." },
  { slug: "omega-3", name: "أوميغا 3 زيت السمك", brand: "نوردك ناتشرالز", cat: "vitamins", ingredient: "EPA / DHA", form: "كبسولات هلامية", strength: "1000 مجم", rx: false, price: 89, stock: 45, expiry: 480, desc: "يدعم صحة القلب والدماغ. 60 كبسولة." },
  { slug: "iron-ferrous", name: "حديد فيروس فومارات", brand: "فيروغلوبين", cat: "vitamins", ingredient: "حديد", form: "كبسولات", strength: "305 مجم", rx: false, price: 26, stock: 9, low: 15, expiry: 210, desc: "لعلاج ووقاية نقص الحديد وفقر الدم." },
  { slug: "multivitamin-women", name: "فيتامينات متعددة للنساء", brand: "سنتروم", cat: "vitamins", ingredient: "فيتامينات ومعادن متعددة", form: "أقراص", strength: "—", rx: false, price: 74, stock: 52, expiry: 640, desc: "تركيبة يومية متكاملة تناسب النساء." },
  { slug: "baby-formula-1", name: "حليب أطفال المرحلة الأولى 400 جم", brand: "أبتاميل", cat: "mother-baby", ingredient: "—", form: "مسحوق", strength: "400 جم", rx: false, price: 69, stock: 65, expiry: 330, desc: "حليب صناعي للرضّع من الولادة حتى 6 أشهر." },
  { slug: "diapers-size-3", name: "حفاضات أطفال مقاس 3 (60 حفاضة)", brand: "بامبرز", cat: "mother-baby", ingredient: "—", form: "حفاضات", strength: "مقاس 3", rx: false, price: 79, stock: 90, expiry: null, desc: "حماية تصل إلى 12 ساعة مع بطانة ناعمة." },
  { slug: "baby-wipes", name: "مناديل مبللة للأطفال", brand: "جونسون", cat: "mother-baby", ingredient: "—", form: "مناديل", strength: "80 منديل", rx: false, price: 15, stock: 150, expiry: null, desc: "خالية من الكحول ولطيفة على بشرة الرضّع." },
  { slug: "nipple-cream", name: "كريم حلمات للأم المرضعة", brand: "لانوسان", cat: "mother-baby", ingredient: "لانولين", form: "كريم", strength: "30 جم", rx: false, price: 54, stock: 34, expiry: 460, desc: "يرطب ويحمي ويُسكّن تشققات الحلمة أثناء الرضاعة." },
  { slug: "sunscreen-spf50", name: "واقي شمس SPF 50+", brand: "لاروش بوزيه", cat: "skin-care", ingredient: "فلاتر UVA/UVB", form: "كريم", strength: "50 مل", rx: false, price: 92, stock: 58, expiry: 620, desc: "حماية عالية للبشرة الحساسة ضد أشعة الشمس." },
  { slug: "moisturizer-cerave", name: "مرطب بشرة يومي", brand: "سيرافي", cat: "skin-care", ingredient: "سيراميد، حمض الهيالورونيك", form: "كريم", strength: "340 جم", rx: false, price: 84, stock: 40, expiry: 560, desc: "ترطيب على مدار 24 ساعة للبشرة الجافة." },
  { slug: "face-wash", name: "غسول وجه للبشرة الدهنية", brand: "أفين", cat: "skin-care", ingredient: "زنك PCA", form: "جل", strength: "200 مل", rx: false, price: 48, stock: 72, expiry: 500, desc: "ينظف المسام ويقلل اللمعان دون جفاف." },
  { slug: "tretinoin-cream", name: "تريتينوين 0.05% كريم", brand: "ريتين-إيه", cat: "skin-care", ingredient: "تريتينوين", form: "كريم", strength: "0.05%", rx: true, price: 47, stock: 20, expiry: 280, desc: "علاج موضعي لحب الشباب. بوصفة طبية فقط." },
  { slug: "bp-monitor", name: "جهاز قياس ضغط الدم الرقمي", brand: "أومرون", cat: "devices", ingredient: "—", form: "جهاز", strength: "العضد", rx: false, price: 219, stock: 18, low: 5, expiry: null, desc: "شاشة كبيرة وذاكرة 60 قراءة مع كشف عدم انتظام النبض." },
  { slug: "glucometer", name: "جهاز قياس السكر مع 50 شريطًا", brand: "أكيو-تشيك", cat: "devices", ingredient: "—", form: "جهاز", strength: "—", rx: false, price: 169, stock: 22, low: 5, expiry: 240, desc: "نتيجة خلال 5 ثوانٍ بقطرة دم صغيرة." },
  { slug: "thermometer", name: "ميزان حرارة رقمي بالأشعة تحت الحمراء", brand: "بيورر", cat: "devices", ingredient: "—", form: "جهاز", strength: "—", rx: false, price: 99, stock: 36, low: 5, expiry: null, desc: "قياس سريع دون ملامسة، مناسب للأطفال." },
  { slug: "pulse-oximeter", name: "جهاز قياس الأكسجين والنبض", brand: "كونتك", cat: "devices", ingredient: "—", form: "جهاز", strength: "—", rx: false, price: 89, stock: 0, low: 5, expiry: null, desc: "قياس نسبة الأكسجين ومعدل النبض بالإصبع." },
];

const customers = [
  { name: "عبدالله القحطاني", phone: "0501234567", city: "الرياض" },
  { name: "نورة العتيبي", phone: "0559876543", city: "جدة" },
  { name: "فهد الدوسري", phone: "0533456789", city: "الدمام" },
  { name: "سارة الشمري", phone: "0544567890", city: "الرياض" },
  { name: "محمد الغامدي", phone: "0566789012", city: "مكة المكرمة" },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) in .env before seeding. See .env.example.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.upsert({
    where: { email },
    create: { email, name: "مشرف الصيدلية", passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN" },
  });

  const catIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await db.category.upsert({ where: { slug: c.slug }, create: c, update: c });
    catIds[c.slug] = row.id;
  }

  const productIds: Record<string, { id: string; name: string; price: number; rx: boolean }> = {};
  for (const p of products) {
    const data = {
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      description: p.desc,
      activeIngredient: p.ingredient,
      dosageForm: p.form,
      strength: p.strength,
      requiresPrescription: p.rx,
      priceHalala: Math.round(p.price * 100),
      stock: p.stock,
      lowStockThreshold: p.low ?? 10,
      expiryDate: p.expiry === null ? null : inDays(p.expiry),
      categoryId: catIds[p.cat],
    };
    const row = await db.product.upsert({ where: { slug: p.slug }, create: data, update: data });
    productIds[p.slug] = { id: row.id, name: p.name, price: data.priceHalala, rx: p.rx };
  }

  if ((await db.order.count()) === 0) {
    const custRows = [];
    for (const c of customers) custRows.push(await db.customer.upsert({ where: { phone: c.phone }, create: c, update: c }));

    const rxApproved = await db.prescription.create({
      data: {
        customerId: custRows[0].id,
        customerName: customers[0].name,
        phone: customers[0].phone,
        filePath: "",
        originalName: "وصفة-عينة.pdf",
        mimeType: "application/pdf",
        size: 0,
        status: "APPROVED",
        reviewNote: "تمت المراجعة والموافقة",
        reviewedAt: inDays(-3),
        reviewedBy: email,
      },
    });
    await db.prescription.create({
      data: {
        customerName: customers[3].name,
        phone: customers[3].phone,
        filePath: "",
        originalName: "وصفة-ضغط.jpg",
        mimeType: "image/jpeg",
        size: 0,
        status: "PENDING",
      },
    });

    const samples: { cust: number; status: string; ago: number; lines: [string, number][]; method: string; rx?: string }[] = [
      { cust: 0, status: "DELIVERED", ago: 6, lines: [["paracetamol-500", 2], ["vitamin-d3-5000", 1]], method: "COD" },
      { cust: 1, status: "DELIVERED", ago: 5, lines: [["sunscreen-spf50", 1], ["moisturizer-cerave", 1]], method: "MOCK" },
      { cust: 2, status: "OUT_FOR_DELIVERY", ago: 1, lines: [["bp-monitor", 1]], method: "COD" },
      { cust: 3, status: "PREPARING", ago: 1, lines: [["baby-formula-1", 2], ["diapers-size-3", 1]], method: "COD" },
      { cust: 4, status: "NEW", ago: 0, lines: [["omega-3", 1], ["vitamin-c-1000", 2]], method: "COD" },
      { cust: 0, status: "NEW", ago: 0, lines: [["metformin-850", 2]], method: "COD", rx: rxApproved.id },
      { cust: 1, status: "CANCELLED", ago: 4, lines: [["face-wash", 1]], method: "COD" },
    ];

    let seq = 1;
    for (const s of samples) {
      const lines = s.lines.map(([slug, qty]) => ({ p: productIds[slug], qty }));
      const totals = computeTotals(lines.map((l) => ({ priceHalala: l.p.price, quantity: l.qty })));
      const created = inDays(-s.ago);
      const cust = custRows[s.cust];
      const delivered = s.status === "DELIVERED";
      await db.order.create({
        data: {
          number: `PH-SEED-${String(seq++).padStart(4, "0")}`,
          customerId: cust.id,
          status: s.status,
          paymentMethod: s.method,
          paymentStatus: s.method === "MOCK" || delivered ? "PAID" : "UNPAID",
          paymentRef: s.method === "MOCK" ? `MOCK-SEED${seq}` : `COD-SEED${seq}`,
          address: `حي النخيل، شارع الأمير سلطان، مبنى ${10 + seq}`,
          city: cust.city,
          deliveryDate: created.toISOString().slice(0, 10),
          deliverySlot: "afternoon",
          subtotalHalala: totals.subtotalHalala,
          deliveryFeeHalala: totals.deliveryFeeHalala,
          totalHalala: totals.totalHalala,
          vatHalala: totals.vatHalala,
          prescriptionId: s.rx ?? null,
          createdAt: created,
          items: {
            create: lines.map((l) => ({
              productId: l.p.id,
              name: l.p.name,
              unitPriceHalala: l.p.price,
              quantity: l.qty,
              requiresPrescription: l.p.rx,
            })),
          },
        },
      });
    }

    await db.consultation.createMany({
      data: [
        { name: "ريم الحربي", phone: "0507001122", topic: "الحمل والرضاعة", message: "هل يمكن استخدام الباراسيتامول أثناء الرضاعة وما الجرعة المناسبة؟" },
        { name: "خالد السبيعي", phone: "0558003344", topic: "التداخلات الدوائية", message: "أتناول دواء الضغط وأريد معرفة هل يتداخل مع مسكنات الإيبوبروفين." },
      ],
    });
  }

  console.log(`Seeded: ${categories.length} categories, ${products.length} products, admin ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
