// Path: src/components/ui/ThemeProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";

export type Theme =
  | "light" | "dark" | "green" | "rose" | "blue" | "purple";

const ORDER: Theme[] = ["light", "dark", "green", "rose", "blue", "purple"];

interface ThemeCtx {
  theme: Theme;
  cycleTheme: () => void;
  setTheme: (t: Theme) => void;        /* ← เพิ่ม */
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, _setTheme] = useState<Theme>("light");

  /* โหลดค่าแรก */
  useEffect(() => {
    const stored =
      (typeof window !== "undefined"
        ? (localStorage.getItem("theme") as Theme | null)
        : null) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    _setTheme(stored);
  }, []);

  /* ใส่ class + persist */
  useEffect(() => {
    const html = document.documentElement;
    ORDER.forEach((t) => html.classList.remove(t));
    html.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        cycleTheme: () =>
          _setTheme((p) => ORDER[(ORDER.indexOf(p) + 1) % ORDER.length]),
        setTheme: (t) => _setTheme(t)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
