import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const PALETTE = [
  ["#6366f1", "#a5b4fc"],
  ["#0ea5e9", "#7dd3fc"],
  ["#10b981", "#6ee7b7"],
  ["#f59e0b", "#fcd34d"],
  ["#ef4444", "#fca5a5"],
  ["#8b5cf6", "#c4b5fd"],
  ["#ec4899", "#f9a8d4"],
  ["#14b8a6", "#5eead4"],
];

function makeSvg(label: string, idx: number): string {
  const [c1, c2] = PALETTE[idx % PALETTE.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
</linearGradient></defs>
<rect width="600" height="600" fill="url(#g)"/>
<circle cx="300" cy="260" r="90" fill="rgba(255,255,255,0.25)"/>
<text x="300" y="430" font-family="sans-serif" font-size="34" font-weight="bold" fill="#fff" text-anchor="middle">${label}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const adminPass = await bcrypt.hash("admin1234", 10);
  const custPass = await bcrypt.hash("customer1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ezshop.com" },
    update: {},
    create: {
      email: "admin@ezshop.com",
      password: adminPass,
      name: "Super Admin",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      password: custPass,
      name: "สมชาย ใจดี",
      phone: "0812345678",
      address: "99/1 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      role: "CUSTOMER",
    },
  });

  const categoriesData = [
    { name: "อิเล็กทรอนิกส์", slug: "electronics" },
    { name: "แฟชั่น", slug: "fashion" },
    { name: "ของใช้ในบ้าน", slug: "home" },
    { name: "ความงาม", slug: "beauty" },
    { name: "กีฬาและกิจกรรม", slug: "sports" },
    { name: "อาหารและเครื่องดื่ม", slug: "food" },
  ];

  const categories: Record<string, number> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categories[c.slug] = cat.id;
  }

  const productsData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    slug: string;
    label: string;
  }[] = [
    { name: "หูฟังไร้สาย Pro Max", description: "หูฟังบลูทูธ 5.3 ตัดเสียงรบกวน ANC แบตอึด 30 ชั่วโมง เสียงคมชัดระดับสตูดิโอ", price: 1590, stock: 50, slug: "electronics", label: "Headphones" },
    { name: "สมาร์ทวอทช์ Fit S9", description: "นาฬิกาอัจฉริยะ วัดชีพจร นับก้าว กันน้ำ IP68 หน้าจอ AMOLED", price: 2290, stock: 35, slug: "electronics", label: "Smartwatch" },
    { name: "ลำโพงบลูทูธ BoomBox", description: "ลำโพงพกพา เสียงเบสแน่น กันน้ำ เล่นต่อเนื่อง 12 ชม.", price: 890, stock: 60, slug: "electronics", label: "Speaker" },
    { name: "เสื้อยืดคอตตอน Premium", description: "เสื้อยืดผ้าฝ้าย 100% นุ่มใส่สบาย ไม่ย้วย มีหลายไซซ์ S-XXL", price: 259, stock: 200, slug: "fashion", label: "T-Shirt" },
    { name: "กระเป๋าสะพายหนัง Classic", description: "กระเป๋าหนัง PU คุณภาพสูง ช่องเยอะ ใส่แล็ปท็อป 14 นิ้วได้", price: 790, stock: 40, slug: "fashion", label: "Bag" },
    { name: "รองเท้าผ้าใบ RunFlex", description: "รองเท้าวิ่งน้ำหนักเบา พื้นนุ่มรองรับแรงกระแทก ระบายอากาศดี", price: 1190, stock: 80, slug: "fashion", label: "Sneakers" },
    { name: "หม้อทอดไร้น้ำมัน AirFry 5L", description: "หม้อทอดไร้น้ำมัน ความจุ 5 ลิตร ทอดกรอบไม่ใช้น้ำมัน ประหยัดไฟ", price: 1490, stock: 25, slug: "home", label: "Air Fryer" },
    { name: "เครื่องดูดฝุ่นไร้สาย TurboV", description: "เครื่องดูดฝุ่นด้ามจับ แรงดูดสูง แบตใช้งาน 45 นาที พร้อมหัวแปรงครบ", price: 2590, stock: 20, slug: "home", label: "Vacuum" },
    { name: "ชุดผ้าปูที่นอน 6 ฟุต Soft Touch", description: "ผ้าปูที่นอนไมโครเทค นุ่มลื่น สัมผัสเย็นสบาย ครบชุด 5 ชิ้น", price: 690, stock: 45, slug: "home", label: "Bedding" },
    { name: "เซรั่มวิตามินซี Bright Up", description: "เซรั่มบำรุงผิวหน้า วิตามินซีเข้มข้น 20% ลดจุดด่างดำ ผิวกระจ่างใส", price: 450, stock: 100, slug: "beauty", label: "Serum" },
    { name: "ครีมกันแดด SPF50+ PA++++", description: "กันแดดเนื้อบางเบา ไม่เหนียวเหนอะหนะ กันน้ำกันเหงื่อ", price: 320, stock: 120, slug: "beauty", label: "Sunscreen" },
    { name: "เสื่อโยคะ EcoGrip 6mm", description: "เสื่อโยคะยางธรรมชาติ กันลื่น หนา 6 มม. พร้อมสายสะพาย", price: 590, stock: 55, slug: "sports", label: "Yoga Mat" },
    { name: "ดัมเบลปรับน้ำหนัก 2-20 กก.", description: "ดัมเบลปรับระดับได้ 2-20 กก. ในตัวเดียว ประหยัดพื้นที่", price: 3290, stock: 15, slug: "sports", label: "Dumbbell" },
    { name: "เมล็ดกาแฟคั่วกลาง ดอยช้าง 250g", description: "เมล็ดกาแฟอาราบิก้าแท้ 100% จากดอยช้าง คั่วใหม่ หอมกลมกล่อม", price: 280, stock: 90, slug: "food", label: "Coffee" },
    { name: "ชาเขียวมัทฉะ Premium 100g", description: "ผงมัทฉะเกรดพิธีการจากอูจิ ญี่ปุ่น สีเขียวสด รสอูมามิ", price: 520, stock: 70, slug: "food", label: "Matcha" },
  ];

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    let i = 0;
    for (const p of productsData) {
      const fileName = `seed-${i + 1}.svg`;
      fs.writeFileSync(path.join(UPLOAD_DIR, fileName), makeSvg(p.label, i));
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          categoryId: categories[p.slug],
          images: { create: [{ url: `/uploads/${fileName}`, sort: 0 }] },
        },
      });
      i++;
    }
  }

  const bankCount = await prisma.bankAccount.count();
  if (bankCount === 0) {
    await prisma.bankAccount.createMany({
      data: [
        { bankName: "ธนาคารกสิกรไทย", accountName: "บจก. อีซี่ช็อป", accountNumber: "123-4-56789-0" },
        { bankName: "ธนาคารไทยพาณิชย์", accountName: "บจก. อีซี่ช็อป", accountNumber: "987-6-54321-0" },
      ],
    });
  }

  console.log("Seed completed:", { admin: admin.email, customer: customer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
