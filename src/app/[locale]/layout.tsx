/* Path: src/app/[locale]/layout.tsx
   ---------------------------------------------------------------------------
   ✅ await params → ตาม spec ใหม่
   ------------------------------------------------------------------------- */
import "../globals.css";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import ClientProvider from "@/components/ui/ClientProvider";
import Header         from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = { title: "Winai2", description: "Task manager" };

/* ❗️ props.params เป็น Promise → ต้อง await ก่อนใช้ */
export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;   // <-- update type
}) {
  const { locale } = await props.params;
  const messages   = await getMessages({ locale });

  return (
    <html lang={locale} className={inter.className}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProvider>
            <Header />
            {props.children}
          </ClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
