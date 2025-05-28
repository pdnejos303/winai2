// src/app/app/page.tsx
import { getAuthSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AppHome() {
  const session = await getAuthSession();

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-6 text-white">
      <h1 className="text-4xl font-bold">
        ยินดีต้อนรับ,{" "}
        <span className="text-blue-400">{session?.user?.email}</span>
      </h1>

      {/* ปุ่ม Logout */}
      <LogoutButton />
    </main>
  );
}
