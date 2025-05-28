// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { jsonError } from "@/lib/response";      // <— ใช้ helper

const prisma = new PrismaClient();

/* ---------- Zod schema: เพิ่มเงื่อนไขตัวอักษร + ตัวเลข ---------- */
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),                 // email ต้องถูก
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")              // ≥ 8
    .regex(/[A-Za-z]/, "Password must include at least one letter")// ✓ ตัวอักษร
    .regex(/\d/, "Password must include at least one number"),     // ✓ ตัวเลข
});

export async function POST(req: Request) {
  /* ---------- 1. แปลง JSON ---------- */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON payload", 400);
  }

  /* ---------- 2. Validate ---------- */
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    return jsonError(msg, 400);
  }

  /* ---------- 3. Business Logic ---------- */
  const { email, password } = parsed.data;
  const emailLC = email.toLowerCase();

  // Duplicate
  const existing = await prisma.user.findUnique({ where: { email: emailLC } });
  if (existing) {
    return jsonError("Email already used", 409);
  }

  // Hash & create user
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email: emailLC, passwordHash: hash },
  });

  return NextResponse.json({ ok: true });
}
