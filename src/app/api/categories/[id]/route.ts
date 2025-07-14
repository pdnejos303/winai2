// --- FILE: src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";          // ⭐️ เพิ่ม
import { z } from "zod";

/* schema (all optional, at least 1) */
const patchSchema = z
  .object({
    name:  z.string().min(1).max(32).optional(),
    icon:  z.string().min(1).max(64).optional(),
    color: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "No fields provided",
  });

async function currentUserId(): Promise<number | null> {
  const s   = await getServerSession(authOptions);
  const uid = Number(s?.user?.id);
  return !s || Number.isNaN(uid) ? null : uid;
}

/* -------------------------------------------------------------------------- */
/* PATCH /api/categories/[id]                                                 */
/* -------------------------------------------------------------------------- */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: "Bad id" }, { status: 400 });

  const body = patchSchema.safeParse(await req.json());
  if (!body.success)
    return NextResponse.json(body.error.flatten(), { status: 400 });

  try {
    const updated = await prisma.category.update({
      where: { id, userId: uid },
      data:  body.data,
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {                              // ⭐️ เปลี่ยน any → unknown
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    )
      return NextResponse.json({ message: "Name already exists" }, { status: 409 });

    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE /api/categories/[id]                                                */
/* -------------------------------------------------------------------------- */
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: "Bad id" }, { status: 400 });

  try {
    // ป้องกันลบหมวดที่ยังมี task
    const used = await prisma.task.count({ where: { categoryId: id } });
    if (used)
      return NextResponse.json(
        { message: "Category is in use" },
        { status: 409 },
      );

    await prisma.category.delete({ where: { id, userId: uid } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}
