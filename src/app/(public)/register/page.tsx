/**
 * --------------------------------------------------------------------------
 *  /public/register/page.tsx
 *  • ฟอร์มสมัคร (POST → /api/register) + ปุ่ม Google OAuth
 *  • ถ้า user มีบัญชี Google อยู่แล้วจะเชื่อมได้ทันที
 * --------------------------------------------------------------------------
 */
import React from "react";
import { GoogleButton } from "@/components/feature/auth/GoogleButton";
import Link from "next/link";

export default function RegisterPage() {
  async function onSubmit(data: FormData) {
    "use server";

    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });

    if (res.ok) {
      // auto redirect login page after success
      return { redirect: "/login" };
    }

    // TODO: handle error (แสดงบน UI ได้ภายหลัง)
    console.error(await res.json());
  }

  return (
    <div className="mx-auto mt-24 max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold">Register</h1>

      {/* ------------ Google OAuth ------------- */}
      <GoogleButton />

      {/* ------------ Divider ------------- */}
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* ------------ Register Form ------------- */}
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
          placeholder="Password (min 8, A+0)"
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
