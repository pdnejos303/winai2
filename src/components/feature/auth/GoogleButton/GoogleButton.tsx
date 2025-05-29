/**
 * --------------------------------------------------------------------------
 *  GoogleButton  (Reusable component)
 *  • คลิกแล้วเรียก signIn("google") ของ NextAuth
 *  • callbackUrl เป็น '/app' (เปลี่ยนได้ผ่าน prop)
 *  • ใช้ไอคอน FcGoogle (react-icons)
 * --------------------------------------------------------------------------
 */
"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import React from "react";

type Props = {
  /** redirect กลับหลัง login (default = /app) */
  callbackUrl?: string;
  /** ขนาดไอคอน (px) */
  iconSize?: number;
};

export const GoogleButton: React.FC<Props> = ({
  callbackUrl = "/app",
  iconSize = 20,
}) => {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
      onClick={() => signIn("google", { callbackUrl })}
    >
      {/* Google Colored Icon */}
      <FcGoogle size={iconSize} />
      <span>Continue with Google</span>
    </button>
  );
};
