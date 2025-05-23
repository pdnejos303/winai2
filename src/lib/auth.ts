import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/** server-side helper */
export async function getAuthSession() {
  return getServerSession(authOptions);
}
