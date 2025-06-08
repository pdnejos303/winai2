"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useTheme } from "@/components/ui/ThemeProvider";

const locales = [
  { code: "en", label: "EN" },
  { code: "th", label: "ไทย" },
  { code: "ja", label: "JP" },
];

export default function Header() {
  /* ---------- Routing / Locale ---------- */
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean); // ['', 'en', 'app', ...] → ['en', 'app', ...]
  const currentLocale = segments[0] ?? "en";

  function switchLocale(code: string) {
    segments[0] = code;
    router.push("/" + segments.join("/"));
  }

  /* ---------- Theme ---------- */
  const { theme, toggle } = useTheme();

  /* ---------- Path helper ---------- */
  const taskHref = `/${currentLocale}/app/tasks`;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-brand-cream px-6 py-3 shadow-md">
      {/* โลโก้ → หน้า Home ตาม locale */}
      <Link
        href={`/${currentLocale}`}
        className="text-2xl font-bold text-brand-green"
      >
        WINAI
      </Link>

      {/* เมนูหลัก */}
      <nav className="flex gap-6 text-lg font-medium">
        <Link href={taskHref} className="hover:text-brand-green">
          Tasks
        </Link>
      </nav>

      {/* ปุ่ม Theme + ปุ่มเปลี่ยนภาษา */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="rounded px-2 py-1 hover:bg-brand-green/10"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Locale Switcher */}
        {locales.map((l) => (
          <button
            key={l.code}
            onClick={() => switchLocale(l.code)}
            className={clsx(
              "rounded px-2 py-1 text-sm",
              l.code === currentLocale
                ? "bg-brand-green text-white"
                : "hover:bg-brand-green/10"
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </header>
  );
}
