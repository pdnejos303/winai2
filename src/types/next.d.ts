/* Path: src/types/next.d.ts
   ---------------------------------------------------------------------------
   🔰 Module Augmentation สำหรับ Next-Auth v5
   - เพิ่ม `user.id` ลง Session
   - เพิ่ม `id` ลง JWT
   - ต้องมั่นใจว่า tsconfig.json รวมโฟลเดอร์ src/types ไว้ใน `include`
   ------------------------------------------------------------------------- */

import type { DefaultSession } from "next-auth";   // base-type ของ Session
import type { DefaultJWT } from "next-auth/jwt";  // base-type ของ JWT

// ── Session ────────────────────────────────────────────────────────────────
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** 🔑 ไอดีผู้ใช้ในฐานข้อมูล (require) */
      id: string;
    } & DefaultSession["user"]; // รักษา name/email/image ให้เป็น optional ตามเดิม
  }
}

// ── JWT ─────────────────────────────────────────────────────────────────────
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** 🔑 ฝังไอดีผู้ใช้ไว้ใน token (เราจะ set ใน callbacks.jwt) */
    id?: string;
  }
}

// 👉 ไม่ต้อง export อะไร — `declare module` จะขยาย type ทั่วโปรเจกต์อัตโนมัติ
