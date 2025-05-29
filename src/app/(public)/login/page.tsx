/**
 * --------------------------------------------------------------------------
 *  /public/login/page.tsx
 *  • ฟอร์ม Login (Credentials) + ปุ่ม Google OAuth
 *  • ใช้ “GoogleButton” component ที่สร้างใหม่
 * --------------------------------------------------------------------------
 */
import React from "react";
import { GoogleButton } from "@/components/feature/auth/GoogleButton";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  async function onSubmit(data: FormData) {
    "use server";
    /* -------- credentials login -------- */
    await signIn("credentials", {
      redirect: true,
      callbackUrl: "/app",
      email: data.get("email"),
      password: data.get("password"),
    });
  }

  return (
    <div className="mx-auto mt-24 max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold">Login</h1>

      {/* ------------ Google OAuth ------------- */}
      <GoogleButton />

      {/* ------------ Divider ------------- */}
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* ------------ Credentials Form ------------- */}
      <form action={onSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm">
        Don’t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
