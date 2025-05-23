import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session) redirect("/login");
  return <html lang="en"><body className="bg-neutral-900 text-white">{children}</body></html>;
}
