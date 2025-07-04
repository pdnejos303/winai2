// Path: src/i18n/navigation.ts
import { createNavigation } from "next-intl/navigation";

/* ---------------------------------------------------------------------------
   next-intl navigation helper
   ส่งออก Link / usePathname / useRouter / redirect
   + helper  normalizePath()  สำหรับตัด locale เดิมออก
--------------------------------------------------------------------------- */

export const LOCALES = ["en", "th", "ja"] as const;
export type Locale   = (typeof LOCALES)[number];

export const { Link, usePathname, useRouter, redirect } = createNavigation({
  locales: LOCALES,
});

/* ตัด prefix locale ใน path
   "/en/app/tasks" → "/app/tasks"
   "/th"           → "/"
   "/"             → "/"
*/
export function normalizePath(path: string): string {
  const parts = path.split("/").filter(Boolean);          // ['', 'en', ...] → ['en', …]
  if (parts.length && LOCALES.includes(parts[0] as Locale)) parts.shift();
  const joined = "/" + parts.join("/");
  return joined === "/" ? "/" : joined.replace(/\/{2,}/g, "/");
}
