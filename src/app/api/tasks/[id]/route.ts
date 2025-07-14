/* -------------------------------------------------------------------------- *
   📁  src/app/api/tasks/[id]/route.ts
   --------------------------------------------------------------------------
   REST handlersสำหรับ Task เดี่ยว  (GET · PATCH · DELETE)
   • รองรับ Next.js 15 – ต้อง await context.params ก่อนใช้ id
   • ตรวจสอบ session → uid  (Int) ทุกคำสั่ง
   • จำกัดการแก้ไข status ให้มีแค่ completed | incompleted
   ------------------------------------------------------------------------ */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { z } from "zod"; // ⭐️ เพิ่ม zod สำหรับ validate body

/* -------------------------------------------------------------------------- */
/*  helper: รับ userId (Int) ถ้าไม่ผ่านให้คืน null                           */
/* -------------------------------------------------------------------------- */
async function currentUserId(): Promise<number | null> {
  const s   = await getServerSession(authOptions);
  const uid = Number(s?.user?.id);
  return !s || Number.isNaN(uid) ? null : uid;
}

/* -------------------------------------------------------------------------- */
/*  schema PATCH – รับเฉพาะฟิลด์ที่อนุญาต & urgency เป็นตัวเลข 0-3           */
/* -------------------------------------------------------------------------- */
const patchSchema = z.object({
  title:       z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate:     z
    .string()
    .refine((d) => !Number.isNaN(Date.parse(d)), {
      message: "dueDate must be ISO-8601",
    })
    .optional(),
  urgency:     z.number().int().min(0).max(3).optional(), // 0-none 1-low 2-med 3-high
  categoryId:  z.number().int().nullable().optional(),    // ← เปลี่ยนเป็น categoryId
  status:      z.enum(["completed", "incompleted"]).optional(),
});

/* -------------------------------------------------------------------------- */
/*  GET /api/tasks/[id] – อ่าน Task เดียว                                     */
/* -------------------------------------------------------------------------- */
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } },      // ← ไม่ destructure
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await context.params; // ← ต้อง await ตาม Next 15
  const id = Number(idStr);

  const task = await prisma.task.findFirst({
    where: { id, userId: uid },
    include: { category: true },             // include relation
  });

  return task
    ? NextResponse.json(task)
    : NextResponse.json({ message: "Not found" }, { status: 404 });
}

/* -------------------------------------------------------------------------- */
/*  PATCH /api/tasks/[id] – อัปเดต status หรือฟิลด์อื่น ๆ                    */
/* -------------------------------------------------------------------------- */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await context.params;
  const id = Number(idStr);

  /* ---------- validate body ---------- */
  const raw = await req.json();
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  /* ---------- แปลง dueDate เป็น Date ถ้ามี ---------- */
  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate as string);
  }

  /* ---------- บันทึก ---------- */
  const task = await prisma.task.update({
    where: { id, userId: uid },
    data,
    include: { category: true },
  });

  return NextResponse.json(task);
}

/* -------------------------------------------------------------------------- */
/*  DELETE /api/tasks/[id] – ลบ Task                                          */
/* -------------------------------------------------------------------------- */
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } },
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await context.params;
  const id = Number(idStr);

  await prisma.task.delete({ where: { id, userId: uid } });

  return NextResponse.json({ ok: true });
}
