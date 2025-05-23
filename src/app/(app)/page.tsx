import { getAuthSession } from "@/lib/auth";

export default async function AppHome() {
  const session = await getAuthSession();
  return (
    <main className="h-screen flex items-center justify-center">
      <h1 className="text-3xl font-semibold">Hello {session?.user?.email}</h1>
    </main>
  );
}
