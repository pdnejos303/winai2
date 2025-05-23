export const runtime = "nodejs"; // ให้ nodemailer ฯลฯ ใช้งานได้ภายหน้า

import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = creds?.email?.toLowerCase().trim();
        if (!email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        return ok ? { id: String(user.id), email: user.email } : null;
      },
    }),
  ],

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
