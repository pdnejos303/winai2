/* Path: src/components/ui/ClientProvider.tsx */
"use client";

import { SessionProvider } from "next-auth/react";
import ThemeProvider       from "@/components/ui/ThemeProvider";
import ToastProvider       from "@/components/ui/ToastProvider";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
      <ToastProvider />
    </SessionProvider>
  );
}
