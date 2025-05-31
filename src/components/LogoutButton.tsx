"use client";

import { signOut } from "next-auth/react";

/** ปุ่ม Logout – ใช้ callbackUrl ให้ NextAuth ทำ redirect & เคลียร์คุกกี้แท้ๆ */
export default function LogoutButton() {
  return (
    <button
      onClick={() =>
        signOut({
          callbackUrl: "/login", // กลับหน้า login หลัง logout
        })
      }
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}
