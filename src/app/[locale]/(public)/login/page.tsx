/* Path: src/app/[locale]/(public)/login/page.tsx
   ────────────────────────────────────────────────────────────────────────────
   ✅ แก้ Type ‘{ locale: string; }’ …  🔹ลบ prop ที่ GoogleButton ไม่รู้จัก
   ✅ ใช้ useParams() → ไม่พึ่ง params จาก Server
   ✅ redirect → /{locale}/app
   ------------------------------------------------------------------------- */
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession }  from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations }     from "next-intl";
import toast                   from "react-hot-toast";
import Link                    from "next/link";
import { GoogleButton }        from "@/components/feature/auth/GoogleButton";

export default function LoginPage() {
  const [loading, setLoading]  = useState(false);
  const { data: session }      = useSession();
  const router                 = useRouter();
  const { locale }             = useParams<{ locale: string }>();
  const t                      = useTranslations("login");

  /* redirect if already logged-in */
  useEffect(() => {
    if (session) router.replace(`/${locale}/app`);
  }, [session, router, locale]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email    = (e.currentTarget.email   as HTMLInputElement).value;
    const password = (e.currentTarget.password as HTMLInputElement).value;

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.ok) {
      toast.success(t("success"));
      router.replace(`/${locale}/app`);
    } else {
      toast.error(res?.error ?? t("failed"));
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold">{t("title")}</h1>

      {/* Google OAuth (❗ไม่มี prop locale แล้ว) */}
      <GoogleButton />

      {/* Divider */}
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">{t("or")}</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Email / Password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder={t("email")} required />
        <input name="password" type="password" placeholder={t("password")} required />
        <button disabled={loading} className="btn-primary w-full">
          {loading ? t("signing") : t("login")}
        </button>
      </form>

      <p className="text-center text-sm">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/register`} className="text-blue-600 underline">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
