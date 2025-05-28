// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

/* ---------- Zod schema: เพิ่มเงื่อนไขตัวอักษร + ตัวเลข ---------- */
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),   // email ต้องถูก
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")           // ≥ 8
    .regex(/[A-Za-z]/, "Password must include at least one letter") // ✓ ต้องมีตัวอักษร
    .regex(/\d/, "Password must include at least one number"),      // ✓ ต้องมีตัวเลข
});

export async function POST(req: Request) {
  /* 1. แปลง JSON (ถ้า JSON พัง จะโยน 400 แทน 500) */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  /* 2. Validate ด้วย zod */
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  /* ----------- Logic เดิมทั้งหมดยังเหมือนเดิม ----------- */
  const { email, password } = parsed.data;
  const emailLC = email.toLowerCase();

  // Duplicate check
  const existing = await prisma.user.findUnique({ where: { email: emailLC } });
  if (existing) {
    return NextResponse.json({ error: "Email already used" }, { status: 409 });
  }

  // Hash & create user
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email: emailLC, passwordHash: hash },
  });

  return NextResponse.json({ ok: true });
}
