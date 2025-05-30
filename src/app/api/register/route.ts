// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import logger from "@/lib/logger";            // structured logger

const prisma = new PrismaClient();

/* ---------- Zod schema: email + password rules ---------- */
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/\d/, "Password must include at least one number"),
});

export async function POST(req: Request) {
  const start = Date.now();                  // <── DECLARE time stamp

  logger.info({ method: "POST", path: "/api/register" }, "incoming request");

  /* 1. parse JSON */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logger.warn("invalid JSON");
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  /* 2. validate */
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    logger.info({ msg }, "validation error");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  /* 3. business logic */
  const { email, password } = parsed.data;
  const emailLC = email.toLowerCase();

  // duplicate
  const existing = await prisma.user.findUnique({ where: { email: emailLC } });
  if (existing) {
    logger.info({ email }, "duplicate email");
    return NextResponse.json({ error: "Email already used" }, { status: 409 });
  }

  // create user
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email: emailLC, passwordHash: hash } });

  logger.info(
    { email, ms: Date.now() - start },
    "register success"
  );
  return NextResponse.json({ ok: true });
}
