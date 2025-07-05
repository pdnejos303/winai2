/* -------------------------------------------------------------------------- *
   📄 AUTH CONFIG – Next-Auth + Prisma Adapter
   -------------------------------------------------------------------------- */
import type { NextAuthOptions } from "next-auth";
import GoogleProvider      from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter }   from "@next-auth/prisma-adapter";
import { compare }         from "bcryptjs";
import prisma              from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(prisma),

  providers: [
    /* --- Google OAuth ---------------------------------------------------- */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    /* --- Credentials (Email+Password) ------------------------------------ */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;

        const ok = await compare(creds.password, user.passwordHash);
        return ok
          ? {
              id:    String(user.id), // 👈 ต้องเป็น string
              email: user.email,
              name:  user.name,
              image: user.image,
            }
          : null;
      },
    }),
  ],

  /* ---------- Callbacks -------------------------------------------------- */
  callbacks: {
    /** 1) หลัง sign-in / ทุกครั้งรีเฟรช JWT */
    async jwt({ token, user }) {
      /*  push id จาก user ครั้งแรก  */
      if (user && "id" in user) token.id = String(user.id);

      /*  fallback กรณี OAuth: token.sub คือ userId ถ้า id หาย  */
      if (!token.id && token.sub) token.id = token.sub;

      return token;
    },

    /** 2) ทุกครั้ง getSession() ฝั่ง Server / Client */
    async session({ session, token }) {
      if (session.user) {
        /*  ถ้า token.id ไม่มีให้ใช้ token.sub (กันหาย) */
        const uid = token.id ?? token.sub;
        if (uid) (session.user as { id?: string }).id = String(uid);
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
