"use client";
/**
 * --------------------------------------------------------------------------
 *  /public/register/page.tsx
 *  • ฟอร์มสมัคร + ปุ่ม Google OAuth
 *  • เพิ่ม Toast แจ้งผล (success / error) - แก้ปัญหาเดิมที่ .json() พังเมื่อ
 *    API ตอบ HTML (429, 5xx)                                  (#3 + UI UX)
 * --------------------------------------------------------------------------
 */
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { GoogleButton } from "@/components/feature/auth/GoogleButton";
import Link from "next/link";

export default function RegisterPage() {
  /* ---------------------------------------------------------------------- */
  /*  Local state & utils                                                   */
  /* ---------------------------------------------------------------------- */
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ---------------------------------------------------------------------- */
  /*  Handle form (Client-side fetch)                                       */
  /* ---------------------------------------------------------------------- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const isJson =
      res.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await res.json() : { error: await res.text() };

    setLoading(false);

    /* ---------- Success ---------- */
    if (res.ok) {
      toast.success("Register success! Redirecting…");
      router.push("/login");
      return;
    }

    /* ---------- Error ---------- */
    toast.error(payload.error ?? "Unknown error");
  }

  /* ---------------------------------------------------------------------- */
  /*  UI                                                                    */
  /* ---------------------------------------------------------------------- */
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Password (min 8 chars, A+0)"
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering…" : "Register"}
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
