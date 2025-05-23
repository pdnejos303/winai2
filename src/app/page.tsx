import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Landing() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/app");
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">Winai2 Task Manager</h1>
      <a href="/login" className="px-8 py-3 bg-blue-600 rounded text-white">Get Started</a>
    </main>
  );
}
