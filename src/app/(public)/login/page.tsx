// Path: src/app/(public)/login/page.tsx (ต่อเนื่อง)
"use client"; 

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { GoogleButton } from "@/components/feature/auth/GoogleButton";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // หากผู้ใช้ล็อกอินอยู่แล้ว (session มี) → redirect ไปหน้า /app เลย
  useEffect(() => {
    if (session) {
      router.replace("/app");
    }
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      toast.success("Logged in!");
      router.replace("/app");
    } else {
      toast.error(res?.error ?? "Login failed");
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold">Login</h1>

      {/* ปุ่ม Google OAuth */}
      <GoogleButton />

      {/* Divider */}
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-xs text-gray-500">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* ฟอร์ม Login ด้วย Email/Password */}
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
          placeholder="Password"
          required
          className="w-full rounded-lg border px-3 py-2"
        />
        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      {/* ลิงก์ไปหน้าสมัครสมาชิก */}
      <p className="text-center text-sm">
        Don&rsquo;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
