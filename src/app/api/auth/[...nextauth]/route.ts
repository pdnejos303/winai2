/* -------------------------------------------------------------------------- */
/*  src/app/api/auth/[...nextauth]/route.ts                                   */
/*                                                                            */
/*  NextAuth route (App Router) – รวมสองวิธีล็อกอิน                         */
/*    1) Credentials  (email + password, เก็บ hash เอง)                       */
/*    2) Google OAuth (Social Login, provider="google")                       */
/*                                                                            */
/*  ข้อสำคัญที่ไฟล์นี้ทำ:                                                     */
/*    • กำหนด runtime ให้ใช้ Node (สำหรับ bcrypt / nodemailer ในอนาคต)        */
/*    • สร้าง PrismaClient (prisma) และผูก PrismaAdapter                     */
/*    • กำหนด providers + options                                             */
/*    • ส่ง handler กลับเป็น GET / POST ด้วย App Router pattern              */
/* -------------------------------------------------------------------------- */

export const runtime = "nodejs"; // จำเป็นสำหรับ bcrypt & SMTP ใน edge-host

/* ---------- Core NextAuth ------------- */
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

/* ---------- Prisma & Adapter ---------- */
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

/* ---------- Utilities ---------- */
import bcrypt from "bcryptjs";

/* ---------- สร้าง PrismaClient (singleton ภายในไฟล์) ---------- */
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*  NEXTAUTH OPTIONS                                                          */
/* -------------------------------------------------------------------------- */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  /* ---------- Secure Cookie (#5) ---------- */
  cookies: {
    sessionToken: {
      // • dev  →  next-auth.session-token   (ไม่ Secure)
      // • prod → __Secure-next-auth.session-token (Secure)
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options:
        process.env.NODE_ENV === "production"
          ? { httpOnly: true, sameSite: "lax", path: "/", secure: true }
          : { httpOnly: true, sameSite: "lax", path: "/" },
    },
  },
  /* ---------------- Providers ---------------- */
  providers: [
    /* ----- 1) Credentials (email + password) -------------------------- */
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        /* 1. ตรวจ input basic (ต้องมี) */
        const email = creds?.email?.toLowerCase().trim();
        if (!email || !creds?.password) return null;

        /* 2. หา user ตาม email */
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        /* 3. เช็ก hash (bcrypt) */
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        return ok ? { id: String(user.id), email: user.email } : null;
      },
    }),

    /* ----- 2) Google OAuth ------------------------------------------------- */
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      /**
       * ⚠️  ถ้ามี user ด้วย email+password อยู่แล้ว
       *     แล้วผู้ใช้กด Google ด้วยอีเมลเดียวกัน
       *     ตัวเลือกนี้จะ “เชื่อม” Account ให้เลย (ไม่สร้าง User ซ้ำ)
       *     - ปลอดภัยพอเพราะ Google ยืนยันอีเมล 100 %
       *     - ถ้าไม่ต้องการ ให้ลบ `allowDangerousEmailAccountLinking`
       */
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  /* ---------------- Pages ---------------- */
  pages: { signIn: "/login" }, // ใช้ UI เดิมของเรา (src/app/public/login)

  /* ---------------- Secrets / Callbacks ---------------- */
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * ตัวอย่าง: เพิ่ม custom field ลง JWT / session ได้ที่นี่
     * async jwt({ token, user, account }) { ... }
     * async session({ session, token }) { ... }
     */
  },
};

/* -------------------------------------------------------------------------- */
/*  HANDLER EXPORT – App Router pattern                                       */
/* -------------------------------------------------------------------------- */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
