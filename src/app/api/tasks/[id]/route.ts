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

/* -------------------------------------------------------------------------- */
/*  helper: รับ userId (Int) ถ้าไม่ผ่านให้คืน null                           */
/* -------------------------------------------------------------------------- */
async function currentUserId() {
  const s   = await getServerSession(authOptions);
  const uid = Number(s?.user?.id);
  return !s || Number.isNaN(uid) ? null : uid;
}

/* -------------------------------------------------------------------------- */
/*  GET /api/tasks/[id] – อ่าน Task เดียว                                     */
/* -------------------------------------------------------------------------- */
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } },      // ← ไม่ destructure
) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await context.params; // ← ต้อง await
  const id = Number(idStr);

  const task = await prisma.task.findFirst({ where: { id, userId: uid } });

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

  const { id: idStr } = await context.params; // ← ต้อง await
  const id = Number(idStr);

  const body = (await req.json()) as Partial<{
    title: string;
    description: string;
    dueDate: string;
    urgency: string;
    category: string;
    status: "completed" | "incompleted";
  }>;

  if (
    body.status &&
    body.status !== "completed" &&
    body.status !== "incompleted"
  ) {
    return NextResponse.json({ message: "Bad status" }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id, userId: uid },
    data:  body,
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

  const { id: idStr } = await context.params; // ← ต้อง await
  const id = Number(idStr);

  await prisma.task.delete({ where: { id, userId: uid } });

  return NextResponse.json({ ok: true });
}
