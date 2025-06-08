// Path: src/components/ui/ClientProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import ToastProvider from "@/components/ui/ToastProvider";

/**
 * ClientProvider เป็น Client Component ที่ wrap children
 * ด้วย SessionProvider + ToastProvider ในฝั่ง client
 */
export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ToastProvider />
    </SessionProvider>
  );
}
