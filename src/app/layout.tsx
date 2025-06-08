// Path: src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import ThemeProvider from "@/components/ui/ThemeProvider";   // 🆕 ธีม
import ClientProvider from "@/components/ui/ClientProvider";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Winai2",
  description: "Task manager",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={inter.className}>
      <body>
        {/* ThemeProvider ครอบระดับบนสุด (ให้ class 'dark' กับ <html>) */}
        <ThemeProvider>
          {/* i18n provider */}
          <NextIntlClientProvider messages={messages}>
            {/* Header ใช้สวิตช์ locale & theme */}
            <Header />

            {/* ส่วน client-side context (Auth Session, Toast ฯลฯ) */}
            <ClientProvider>{children}</ClientProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
