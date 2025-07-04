// Path: src/lib/prisma.ts
/** 
 * ไฟล์ src/lib/prisma.ts คือหัวใจที่ทำให้ทุกจุดในโปรเจ็กต์สามารถ “คุย” กับฐาน PostgreSQL ผ่าน Prisma ได้อย่างปลอดภัย (ไม่เปิด-ปิด connection จนเครื่องพัง) และยังไม่พังเวลา Hot-Reloa
 */
// 1) ดึง PrismaClient (ที่ auto-generate หลังรัน ` prisma generate`)
import { PrismaClient } from "@prisma/client";

// 2) ประกาศ type helper เพื่อบอก TypeScript ว่า globalThis อาจมี 'prisma'
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
//   - as unknown: หลอก TS ให้แปลงประเภทก่อน (เพราะ TS ไม่รู้ field 'prisma')
//   - { prisma?: PrismaClient } : object มี key 'prisma' ได้ (optional)

/* 3) สร้าง instance:
   - ถ้าเคยมีใน global แล้ว (dev hot-reload) ใช้อันเดิม
   - ถ้ายังไม่มี → new PrismaClient()
   - ใส่ option log[] เพื่อเก็บ log error/warn ชัด ๆ  */
const client =
  globalForPrisma.prisma ??                       // ?? = ถ้า null/undefined
  new PrismaClient({
    // log ระดับ “error” กับ “warn” จะโชว์ในคอนโซล
    log: ["error", "warn"],
  });

/* 4) เก็บ instance ลง global เฉพาะ “ไม่ใช่ production”  
      - Production (build เสร็จ) โมดูลไม่รีโหลดซ้ำ จึงไม่ต้องเซต  
      - Dev (Next.js) โมดูลถูก Hot-Reload → ถ้าไม่เซตจะ new client ซ้ำ */
if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = client;

/* 5) ส่งออก (export) 2 แบบ
      a) default  → import prisma from "@/lib/prisma";
      b) named    → import { prisma } from "@/lib/prisma";
   เหลือทางเลือกให้ dev สะดวก  */
export default client;   // ← default export
export const prisma = client; // ← named export (optional แต่หลายคนชอบ)
