/* -------------------------------------------------------------------------- *
   📄 𝙰𝚄𝚃𝙷 𝙷𝙴𝙻𝙿𝙴𝚁 – getServerSession() ย่อเหลือบรรทัดเดียว
   --------------------------------------------------------------------------
   • สำหรับ Server-Component / API-Route / Middleware
   • Export สามแบบ (default, named, alias) เพื่อไม่ทำลายโค้ดเก่า
   ------------------------------------------------------------------------ */

import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/* ดึง Session ปัจจุบันฝั่ง Server */
async function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/* ---------- Exports ---------- */
export { auth };
export { auth as getAuthSession }; // alias ย้อนยุค
export default auth;
