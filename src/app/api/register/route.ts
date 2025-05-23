import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/i,  "must include letter")
    .regex(/\d/,     "must include number"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );

  const { email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists)
    return NextResponse.json({ error: "Email already used" }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email: email.toLowerCase(), passwordHash: hash } });

  return NextResponse.json({ ok: true });
}
