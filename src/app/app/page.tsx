// src/app/app/page.tsx
import { getAuthSession } from "@/lib/auth";

export default async function AppHome() {
  const session = await getAuthSession();   // ดึงข้อมูลผู้ใช้ที่ล็อกอิน
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-4 text-white">
      <h1 className="text-4xl font-bold">
        ยินดีต้อนรับ,&nbsp;
        <span className="text-blue-400">{session?.user?.email}</span>
      </h1>

      <p className="text-gray-400">นี่คือหน้าแดชบอร์ดว่างๆ — พร้อมลุยพัฒนาต่อได้เลย!</p>
    </main>
  );
}
