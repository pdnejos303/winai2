/* -------------------------------------------------------------------------- *
   📄 𝙰𝚄𝚃𝙷 𝙲𝙾𝙽𝙵𝙸𝙶  –  NEXT-AUTH + PRISMA ADAPTER
   --------------------------------------------------------------------------
   หน้าที่ไฟล์นี้
   • กำหนด global options สำหรับ NextAuth
   • รองรับ   1) Google OAuth
              2) Email / Password (Credentials)
   • ใช้ PrismaAdapter เพื่อเขียน/อ่าน User-Account ผ่าน Prisma
   • ใช้ JWT strategy  (sessionToken เป็น JWT cookie)
   • callback เติม   user.id ➜ JWT ➜ session.user.id
   ------------------------------------------------------------------------ */

import type { NextAuthOptions } from "next-auth";          // type ของ config
import GoogleProvider      from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter }   from "@next-auth/prisma-adapter"; // bridge NextAuth ↔ Prisma
import { compare }         from "bcryptjs";                  // เปรียบรหัสผ่าน (hash)

import prisma from "@/lib/prisma";                          // Prisma client singleton

/* ────────────────────────────────────────────────────────────
   authOptions : ค่าคอนฟิกหลัก
────────────────────────────────────────────────────────────── */
export const authOptions: NextAuthOptions = {
  /* ใช้ JWT cookie (ไม่สร้าง Session table) */
  session: { strategy: "jwt" },

  /* PrismaAdapter จะ map เมทอด (createUser, linkAccount ฯลฯ) → Prisma */
  adapter: PrismaAdapter(prisma),

  /* ---------- Providers ---------- */
  providers: [
    /* 1) Google OAuth -------------------------------------------------- */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,     // ต้องมีใน .env.local
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      /* ถ้า email ตรงกับ user credentials เดิม ให้ merge account */
      allowDangerousEmailAccountLinking: true,
    }),

    /* 2) Credentials (Email + Password) ------------------------------- */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      /* ฟังก์ชันตรวจ username / password เอง */
      async authorize(creds) {
        /* 1) เช็กอินพุตเบื้องต้น */
        if (!creds?.email || !creds?.password) return null;

        /* 2) หา user */
        const user = await prisma.user.findUnique({
          where: { email: creds.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;

        /* 3) เปรียบเทียบ bcrypt */
        const ok = await compare(creds.password, user.passwordHash);

        /* 4) คืน user object แบบ “น้ำหนักเบา” ถ้าผ่าน */
        return ok
          ? {
              id:    String(user.id),          // 👈 ต้องเป็น string
              email: user.email,
              name:  user.name,
              image: user.image,
            }
          : null;
      },
    }),
  ],

  /* ---------- Callbacks (ปรับแต่ง JWT / Session) ---------- */
  callbacks: {
    /* หลัง sign-in / รีเฟรช token */
    async jwt({ token, user }) {
      if (user) token.id = user.id;    // push id → JWT
      return token;
    },
    /* ทุกครั้งที่ getSession() */
    async session({ session, token }) {
      if (session.user && token.id)
        session.user.id = token.id as string; // push id → session.user
      return session;
    },
  },

  /* ---------- Page & Secret ---------- */
  pages:  { signIn: "/login" },            // ใช้หน้า login custom
  secret: process.env.NEXTAUTH_SECRET,     // ใช้เซ็น JWT
};
