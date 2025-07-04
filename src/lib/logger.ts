/* Path: src/lib/logger.ts
   ----------------------------------------------------------------------------
   📄 ไฟล์นี้คือ:
   Global Logger สำหรับระบบ (ทั้ง Backend และ Middleware)
   - ใช้ Pino เป็นเครื่องมือสำหรับ log
   - รองรับการ pretty-print ตอน dev และ raw JSON ตอน production
   - ซ่อนข้อมูลสำคัญที่ไม่ควรแสดง (เช่น token, password)
   ---------------------------------------------------------------------------- */

import pino from "pino"; // ใช้ pino เป็น logger หลัก (เร็วและเบา)

/**
 * 🌐 Global logger
 * • dev  → pretty-print ด้วย pino-pretty (อ่านง่าย, มีสี)
 * • prod → log เป็น JSON ดิบ (เหมาะกับระบบ production / log service เช่น Datadog, Logstash)
 * • redact → ซ่อน field สำคัญ ไม่ให้แสดงใน log
 */
const logger = pino({
  transport:
    process.env.NODE_ENV === "production"
      ? undefined // ⛔ prod mode → ไม่ใช้ transport (ส่ง JSON ดิบ)
      : {
          // ✅ dev mode → ใช้ pino-pretty แสดงผลอ่านง่าย
          target: "pino-pretty", // ต้องกำหนดใน object ที่ชื่อว่า transport
          options: { colorize: true }, // เพิ่มสีใน console
        },
  redact: [
    // 🛡️ ซ่อนข้อมูลสำคัญจาก log (เพื่อความปลอดภัย)
    "req.headers.authorization", // ป้องกัน token หลุด
    "passwordHash",              // รหัสผ่านที่ถูก hash
    "access_token",
    "refresh_token",
    "id_token",
  ],
});

// 🌟 export logger เพื่อให้ใช้ได้ทุกที่ในระบบ
export default logger;
