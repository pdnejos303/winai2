/* Path: src/components/feature/auth/GoogleButton/GoogleButton.tsx
   ---------------------------------------------------------------------------
   🔄 **สิ่งที่แก้** (เทียบไฟล์ที่ส่งมาให้)
   1. **ไม่รับ prop `locale`** อีกต่อไป → ปิด TS 2322 ในหน้า Login
   2. เพิ่ม `label` (optional) เผื่อเปลี่ยนข้อความตาม i18n ภายนอก
   3. ค่า `callbackUrl` ตั้ง default เป็น `"/app"` แต่สามารถส่งจากภายนอก
   ------------------------------------------------------------------------- */
"use client";

import { signIn }  from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import React        from "react";

type Props = {
  /** URL ที่จะ redirect หลังล็อกอิน (default = "/app") */
  callbackUrl?: string;
  /** ขนาดไอคอน (px) */
  iconSize?: number;
  /** ป้ายข้อความ (default = "Continue with Google") – รับจาก i18n ภายนอกได้ */
  label?: string;
};

export const GoogleButton: React.FC<Props> = ({
  callbackUrl = "/app",
  iconSize = 20,
  label = "Continue with Google",
}) => {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
      onClick={() => signIn("google", { callbackUrl })}
    >
      {/* Google Colored Icon */}
      <FcGoogle size={iconSize} />
      <span>{label}</span>
    </button>
  );
};
