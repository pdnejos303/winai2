// src/app/layout.tsx
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Winai2",
  description: "Task manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}
                <ToastProvider /> {/* ← one-line */}

      </body>
    </html>
  );
}
