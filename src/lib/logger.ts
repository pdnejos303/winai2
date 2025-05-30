import pino from "pino";

/**
 * Global logger
 *  • dev  → pretty-print (pino-pretty)
 *  • prod → raw JSON
 *  • redact field ลับ
 */
const logger = pino({
  transport:
    process.env.NODE_ENV === "production"
      ? undefined // ← prod ส่ง JSON ดิบ
      : {
          target: "pino-pretty",          // <─ **ต้องอยู่ใน object**
          options: { colorize: true },
        },
  redact: [
    "req.headers.authorization",
    "passwordHash",
    "access_token",
    "refresh_token",
    "id_token",
  ],
});

export default logger;
