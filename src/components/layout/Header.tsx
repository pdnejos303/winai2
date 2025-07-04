/* Path: src/components/layout/Header.tsx
   ---------------------------------------------------------------------------
   • ใช้ normalizePath() แก้ปัญหา /en/en
   • ไม่มี activeClassName / ไม่มี any
--------------------------------------------------------------------------- */
"use client";

import {
  Link,
  usePathname,
  normalizePath,
  LOCALES,
  Locale,
} from "@/i18n/navigation";

import { useTheme }   from "@/components/ui/ThemeProvider";
import LogoutButton   from "@/components/LogoutButton";
import { useSession } from "next-auth/react";
import Image          from "next/image";
import clsx           from "clsx";
import { useState }   from "react";

const THEMES = ["light", "dark", "green", "rose", "blue", "purple"] as const;

export default function Header() {
  /* ── Path / Locale ──────────────────────────────────────────────────── */
  const pathname      = usePathname();             // "/en/app/tasks" | "/th" | "/"
  const [, rawLocale] = pathname.split("/");       // "en" | undefined
  const locale: Locale = LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "en";

  const tailPath = normalizePath(pathname);        // "/app/tasks" | "/"

  /* ── Theme popover ─────────────────────────────────────────────────── */
  const { theme, setTheme, cycleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  /* ── User session ──────────────────────────────────────────────────── */
  const { data: session } = useSession();
  const userName  = session?.user?.name  || session?.user?.email || "";
  const userImage = session?.user?.image || "";

  /* helper: ตรวจว่าลิงก์นี้ active ไหม */
  const isActive = (href: string) =>
    normalizePath(pathname) === href.replace(/^\//, "");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-brand-cream px-6 py-3 shadow-md">
      {/* ────── Logo ────── */}
      <Link
        href="/app"
        locale={locale}
        className={clsx(
          "text-2xl font-bold hover:opacity-80",
          isActive("/app") ? "text-brand-green" : "text-brand-green/80",
        )}
      >
        WINAI
      </Link>

      {/* ────── Nav menu ────── */}
      <nav className="flex gap-6 text-lg font-medium">
        <Link
          href="/app/tasks"
          locale={locale}
          className={clsx(
            "hover:text-brand-green",
            isActive("/app/tasks") && "text-brand-green",
          )}
        >
          Tasks
        </Link>
      </nav>

      {/* ────── Right zone ────── */}
      <div className="relative flex items-center gap-2">
        {/* ----- Theme button ----- */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Theme"
          className="rounded px-2 py-1 hover:bg-brand-green/10"
        >
          🎨
        </button>

        {open && (
          <ul className="absolute right-0 top-9 w-32 rounded-md border bg-white shadow">
            {THEMES.map((t) => (
              <li key={t}>
                <button
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className={clsx(
                    "block w-full px-3 py-1 text-left text-sm hover:bg-brand-cream",
                    t === theme && "bg-brand-cream font-semibold",
                  )}
                >
                  {t}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  cycleTheme();
                  setOpen(false);
                }}
                className="block w-full px-3 py-1 text-left text-sm text-brand-green hover:bg-brand-cream"
              >
                Next →
              </button>
            </li>
          </ul>
        )}

        {/* ----- Locale buttons ----- */}
        {LOCALES.map((l) => (
          <Link
            key={l}
            href={tailPath}    /* "/app/tasks" หรือ "/" */
            locale={l}
            className={clsx(
              "rounded px-2 py-1 text-sm capitalize",
              l === locale
                ? "bg-brand-green text-white"
                : "hover:bg-brand-green/10",
            )}
          >
            {l === "en" ? "EN" : l === "th" ? "ไทย" : "JP"}
          </Link>
        ))}

        {/* ----- Avatar & name ----- */}
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : userName ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-sm font-semibold text-white">
            {userName.charAt(0).toUpperCase()}
          </span>
        ) : null}
        {userName && (
          <span className="max-w-[12ch] truncate text-sm font-medium">
            {userName}
          </span>
        )}

        {/* ----- Logout ----- */}
        <LogoutButton />
      </div>
    </header>
  );
}
