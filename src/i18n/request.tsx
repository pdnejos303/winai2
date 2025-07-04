// Path: src/i18n/request.tsx
import { getRequestConfig } from "next-intl/server";
import type { GetRequestConfigParams, RequestConfig } from "next-intl/server";

export default getRequestConfig(
  async ({ locale }: GetRequestConfigParams): Promise<RequestConfig> => {
    const lc = locale ?? "en";
    const messages = (
      await import(`../messages/${lc}.json`)
    ).default as Record<string, string>;

    return { locale: lc, messages };
  }
);




// // Path: src/i18n/request.tsx
// import { getRequestConfig } from "next-intl/server";
// import type { GetRequestConfigParams, RequestConfig } from "next-intl/server";

// /* ---------- Locale ที่รองรับ & default ---------- */
// const LOCALES = ["en", "th", "ja"] as const;
// type Locale = (typeof LOCALES)[number];
// const DEFAULT_LOCALE: Locale = "en";

// /**
//  * ฟังก์ชันนี้ถูกเรียกทุก request โดย next-intl
//  * ต้องคืน { locale, messages }
//  */
// export default getRequestConfig(
//   async ({ locale }: GetRequestConfigParams): Promise<RequestConfig> => {
//     /* -- ถ้า locale ผิด หรือ  undefined ให้ fallback เป็น default -- */
//     const lc: Locale = LOCALES.includes(locale as Locale)
//       ? (locale as Locale)
//       : DEFAULT_LOCALE;

//     /* -- โหลดไฟล์ข้อความตาม locale อย่างปลอดภัย (dynamic import) -- */
//     const messages = (
//       await import(`../messages/${lc}.json`)
//     ).default as Record<string, string>;

//     return { locale: lc, messages };
//   }
// );
