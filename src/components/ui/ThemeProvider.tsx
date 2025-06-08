"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useTheme must be used within <ThemeProvider> context");
  return ctx;
}

/**
 * ThemeProvider
 * ----------------------------------------------------------------
 * • อ่าน theme จาก localStorage หรือระบบ (prefers-color-scheme) ครั้งแรก  
 * • ใส่/ถอด class `dark` บน <html> เพื่อให้ Tailwind darkMode:'class' ทำงาน  
 * • เก็บค่าใหม่กลับ localStorage เมื่อสลับ  
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  /* อ่านค่าเริ่มต้นครั้งเดียว */
  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem("theme") as Theme | null)
      : null) ?? (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setTheme(stored);
  }, []);

  /* ใส่ / ถอด class dark + sync localStorage */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
