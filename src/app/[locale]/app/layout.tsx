// Path: src/app/app/layout.tsx
import { Inter } from "next/font/google";
import ClientProvider from "@/components/ui/ClientProvider";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // ❌ ห้ามใส่ <html>/<body> ซ้ำ
  return (
    <div className={inter.className}>
      <ClientProvider>{children}</ClientProvider>
    </div>
  );
}
