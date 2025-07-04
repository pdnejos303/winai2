/* Path: src/app/[locale]/page.tsx
   ────────────────────────────────────────────────────────────────────────────
   ✅ แก้ “params.locale ต้อง await”  ➜ non-async & ใช้ useParams()
   ------------------------------------------------------------------------- */
"use client";

import { useParams }       from "next/navigation";
import { useTranslations } from "next-intl";
import { Link }            from "@/i18n/navigation";

export default function HomePage() {
  const { locale } = useParams<{ locale: string }>();
  const t          = useTranslations("home");

  return (
    <main className="flex flex-col items-center justify-center gap-6 py-20">
      <h1 className="text-3xl font-bold">{t("welcome")}</h1>
      <Link
        href={`/${locale}/login`}
        className="rounded bg-brand-green px-4 py-2 text-white hover:opacity-90"
      >
        {t("goLogin")}
      </Link>
    </main>
  );
}
