/* --------------------------------------------------------------------------
 *  layout.tsx  (ใต้ src/app/app/)   –  Redirect ถ้า user ไม่ได้ login
 * -------------------------------------------------------------------------- */
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AppLayout({ children }: { children: ReactNode }) {
  /* ถ้าไม่มี session → เด้งไป /login */
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <>{children}</>;          // session มีอยู่ → แสดงเนื้อหา
}
