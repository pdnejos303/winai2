"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),   // ✅ ชื่อ key ตรงกับ schema
    });

    setLoading(false);
    if (res.ok) {
      alert("Account created! Please login.");
      router.push("/login");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Unknown error");
    }
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleRegister}
        className="bg-neutral-800 p-8 rounded-xl flex flex-col gap-4 w-80"
      >
        <h1 className="text-2xl font-bold text-center">Register</h1>

        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded bg-neutral-700 focus:outline-none"
        />

        <input
          required
          type="password"
          placeholder="Password (≥8, มีตัวเลข+ตัวอักษร)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded bg-neutral-700 focus:outline-none"
        />

        <button
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 py-2 rounded font-medium disabled:opacity-50"
        >
          {loading ? "Saving…" : "Register"}
        </button>
      </form>
    </main>
  );
}
