// Path: src/i18n/request.tsx
import { getRequestConfig } from "next-intl/server";
import type {
  GetRequestConfigParams,
  RequestConfig
} from "next-intl/server";

/**
 * next-intl เรียกฟังก์ชันนี้ทุก request
 * ต้องคืนค่า { locale: string; messages: Record<string, string> }
 */
export default getRequestConfig(
  async ({ locale }: GetRequestConfigParams): Promise<RequestConfig> => {
    // ถ้า locale เป็น undefined (กรณี URL ผิด) fallback เป็น 'en'
    const lc = locale ?? "en";

    const messages = (
      await import(`../messages/${lc}.json`)
    ).default as Record<string, string>;

    return {
      locale: lc,   // ✅ เป็น string แน่นอน
      messages
    };
  }
);
