// --- FILE: src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";          // ⭐️ เพิ่ม
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Zod schema                                                                 */
/* -------------------------------------------------------------------------- */
const categorySchema = z.object({
  name:  z.string().min(1).max(32),
  icon:  z.string().min(1).max(64),
  color: z.string().regex(/^#?[0-9a-fA-F]{6}$/), // #RRGGBB
});

/* -------------------------------------------------------------------------- */
/* helper – current userId (Int)                                              */
/* -------------------------------------------------------------------------- */
async function currentUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  const uid     = Number(session?.user?.id);
  return !session || Number.isNaN(uid) ? null : uid;
}

/* -------------------------------------------------------------------------- */
/* GET /api/categories – list of user                                         */
/* -------------------------------------------------------------------------- */
export async function GET() {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where:   { userId: uid },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

/* -------------------------------------------------------------------------- */
/* POST /api/categories – create new                                          */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(parsed.error.flatten(), { status: 400 });

  try {
    const cat = await prisma.category.create({
      data: { ...parsed.data, userId: uid },
    });
    return NextResponse.json(cat, { status: 201 });
  } catch (err: unknown) {                              // ⭐️ เปลี่ยน any → unknown
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      // Unique constraint failed (name dup)
      return NextResponse.json({ message: "Name already exists" }, { status: 409 });
    }
    console.error("[POST /api/categories] Prisma error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
