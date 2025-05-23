"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false); res?.error ? alert("Invalid") : router.push("/app");
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <form onSubmit={handle} className="bg-neutral-800 p-8 rounded-xl flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <input className="px-4 py-2 rounded bg-neutral-700" required type="email"
               placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="px-4 py-2 rounded bg-neutral-700" required type="password"
               placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button disabled={loading} className="bg-blue-600 py-2 rounded disabled:opacity-50">
          {loading? "Signing…" : "Sign in"}
        </button>
        <a href="/register" className="text-center text-sm text-blue-400">Create account</a>
      </form>
    </main>
  );
}
