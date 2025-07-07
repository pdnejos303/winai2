/* -------------------------------------------------------------------------- *
   📁  src/app/api/tasks/[id]/route.ts
   --------------------------------------------------------------------------
   REST handlers สำหรับ “Task เดี่ยว”  (GET · PATCH · DELETE)
   • รองรับ Next.js 15 (app router) – context.params ใช้ตรง ๆ
   • ตรวจ session → uid (Int) ทุกคำสั่ง
   • PATCH รองรับ field ส่วนใหญ่ + categoryId (FK)
   • ใช้ Zod validate เพื่อลด 500
   ------------------------------------------------------------------------ */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { z } from "zod";

/* ── helper: uid (Promise<number|null>) ── */
async function currentUserId() {
  const s   = await getServerSession(authOptions);
  const uid = Number(s?.user?.id);
  return !s || Number.isNaN(uid) ? null : uid;
}

/* ── Zod schema สำหรับ PATCH ── */
const Patch = z.object({
  title:       z.string().optional(),
  description: z.string().optional(),
  dueDate:     z.string().optional().refine(
                 (d) => !d || !Number.isNaN(Date.parse(d)), "bad date"),
  urgency:     z.enum(["low", "medium", "high"]).optional(),
  status:      z.enum(["completed", "incompleted"]).optional(),
  categoryId:  z.number().int().positive().optional(),
});
const iso = (s?: string) => (s ? new Date(s.length === 16 ? `${s}:00` : s) : undefined);

/* -------------------------------------------------------------------------- */
/*  GET /api/tasks/[id]                                                       */
/* -------------------------------------------------------------------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  const task = await prisma.task.findFirst({
    where: { id, userId: uid },
    include: { category: true },
  });

  return task
    ? NextResponse.json(task)
    : NextResponse.json({ message: "Not found" }, { status: 404 });
}

/* -------------------------------------------------------------------------- */
/*  PATCH /api/tasks/[id]                                                     */
/* -------------------------------------------------------------------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();
  const parsed = Patch.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(parsed.error.flatten(), { status: 400 });

  const { categoryId, dueDate, ...rest } = parsed.data;
  const data: any = {
    ...rest,
    ...(dueDate ? { dueDate: iso(dueDate) } : {}),
    ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
  };

  const task = await prisma.task.update({
    where: { id, userId: uid },
    data,
    include: { category: true },
  });

  return NextResponse.json(task);
}

/* -------------------------------------------------------------------------- */
/*  DELETE /api/tasks/[id]                                                    */
/* -------------------------------------------------------------------------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  await prisma.task.delete({ where: { id, userId: uid } });

  return NextResponse.json({ ok: true });
}

/* -------------------------------------------------------------------------- *
   END FILE — คอมเมนต์ยาวเหมือนเดิมไม่ตัด
 * -------------------------------------------------------------------------- */
