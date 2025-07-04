/* Path: src/app/api/register/route.ts
   ----------------------------------------------------------------------------
   📄 ไฟล์นี้คือ:
   API Route สำหรับการ "สมัครสมาชิก (Register)"
   - ใช้ HTTP POST เพื่อรับ email + password จากผู้ใช้
   - ตรวจสอบข้อมูลด้วย Zod (validation)
   - เข้ารหัสรหัสผ่านด้วย bcrypt
   - บันทึกผู้ใช้ใหม่ลงในฐานข้อมูลด้วย Prisma
   - ใช้ logger เพื่อติดตาม log การทำงานแบบ structured log
   ---------------------------------------------------------------------------- */

import { NextResponse } from "next/server";        // ใช้สร้าง response ฝั่ง server (API)
import { PrismaClient } from "@prisma/client";     // Prisma ORM client
import bcrypt from "bcryptjs";                     // สำหรับเข้ารหัส password แบบ hash
import { z } from "zod";                           // ใช้ตรวจสอบความถูกต้องของข้อมูล (validation)
import logger from "@/lib/logger";                 // structured logger ที่ใช้ log แบบ JSON

const prisma = new PrismaClient();                // สร้าง Prisma client ใหม่ (ใช้กับ DB)

/* ----------------------------------------------------------------------------
   🛡️ Zod Schema สำหรับตรวจสอบข้อมูลที่ผู้ใช้กรอกมา
   - email: ต้องเป็นอีเมลที่ถูกต้อง
   - password: 
     ▸ อย่างน้อย 8 ตัวอักษร
     ▸ ต้องมีตัวอักษร
     ▸ ต้องมีตัวเลข
---------------------------------------------------------------------------- */
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/\d/, "Password must include at least one number"),
});

/* ----------------------------------------------------------------------------
   📥 POST /api/register
   - รับ request สมัครสมาชิกจากผู้ใช้
   - ตรวจสอบข้อมูล
   - ตรวจสอบซ้ำซ้อน
   - เข้ารหัส password และบันทึกลง DB
---------------------------------------------------------------------------- */
export async function POST(req: Request) {
  const start = Date.now(); // จับเวลาเริ่มต้น (ใช้วัด performance)

  logger.info({ method: "POST", path: "/api/register" }, "incoming request");

  /* ---------------------------------------------
     📦 STEP 1: แปลง JSON ที่ส่งเข้ามา
     - ถ้าไม่ใช่ JSON หรือพัง → ตอบ 400
  --------------------------------------------- */
  let body: unknown;
  try {
    body = await req.json(); // พยายาม parse body จาก request เป็น JSON
  } catch {
    logger.warn("invalid JSON"); // log warning ถ้า JSON ไม่ถูกต้อง
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  /* ---------------------------------------------
     ✅ STEP 2: ตรวจสอบข้อมูลด้วย Zod
     - ใช้ .safeParse เพื่อไม่ throw error
     - ดึงข้อความ error แรกจาก issues[]
  --------------------------------------------- */
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    logger.info({ msg }, "validation error");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  /* ---------------------------------------------
     ⚙️ STEP 3: Logic การสมัครสมาชิก
     - แปลง email ให้เป็น lowercase
     - ตรวจสอบว่า email ซ้ำหรือไม่
     - ถ้าไม่ซ้ำ → hash password แล้วสร้าง user ใหม่
  --------------------------------------------- */
  const { email, password } = parsed.data;
  const emailLC = email.toLowerCase(); // normalize email

  // 🔍 ตรวจสอบว่า email นี้มีอยู่ในระบบแล้วหรือยัง
  const existing = await prisma.user.findUnique({ where: { email: emailLC } });
  if (existing) {
    logger.info({ email }, "duplicate email"); // log ถ้ามีผู้ใช้อยู่แล้ว
    return NextResponse.json({ error: "Email already used" }, { status: 409 });
  }

  // 🔐 เข้ารหัส password ด้วย bcrypt (ความปลอดภัยสูง)
  const hash = await bcrypt.hash(password, 12);

  // 💾 สร้างผู้ใช้ใหม่ในฐานข้อมูล
  await prisma.user.create({
    data: { email: emailLC, passwordHash: hash },
  });

  // ✅ log การสมัครสำเร็จ พร้อมเวลาที่ใช้
  logger.info(
    { email, ms: Date.now() - start },
    "register success"
  );

  // ส่งผลลัพธ์กลับว่า success
  return NextResponse.json({ ok: true });
}
