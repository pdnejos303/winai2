/**
 * API Route: /api/tasks
 *
 * - GET    /api/tasks              → รายการ Task ของผู้ใช้ (filter ผ่าน query string)
 * - POST   /api/tasks              → สร้าง Task ใหม่
 *
 * หมายเหตุ
 * -------
 * • ใช้ getServerSession(authOptions) เพื่อตรวจสิทธิ์ผู้ใช้งาน
 * • validate body ด้วย Zod ก่อนสร้างข้อมูล
 * • รองรับ dueDate ที่ส่งมาเป็น “YYYY-MM-DDTHH:mm” โดยจะเติมวินาทีให้อัตโนมัติ
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Zod schema สำหรับตรวจสอบ body ของ POST                                    */
/* -------------------------------------------------------------------------- */
const taskSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().default(""),
  dueDate: z
    .string()
    .refine((d) => !Number.isNaN(Date.parse(d)), { message: "dueDate must be ISO-8601" }),
  urgency: z.number().int().min(0).max(3).default(0),
  categoryId: z.number().int().optional().nullable(), // FK (nullable)
});

/* -------------------------------------------------------------------------- */
/* helper – รับ userId (Int) ถ้าไม่ผ่านให้ null                                */
/* -------------------------------------------------------------------------- */
async function currentUserId(): Promise<number | null> {
  const s = await getServerSession(authOptions);
  const uid = Number(s?.user?.id);
  return !s || Number.isNaN(uid) ? null : uid;
}

/* -------------------------------------------------------------------------- */
/*  GET /api/tasks                                                             */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sp   = req.nextUrl.searchParams;
  const where: Prisma.TaskWhereInput = { userId: uid };

  /* status ----------------------------------------------------------------- */
  const status = sp.get("status");
  if (status === "completed" || status === "incompleted") where.status = status;

  /* urgency ---------------------------------------------------------------- */
  const urgStr = sp.get("urgency");                // ✅ FIX : read as string first
  if (urgStr !== null) {
    const urg = Number(urgStr);
    if ([0, 1, 2, 3].includes(urg)) where.urgency = urg;
  }

  /* categoryId ------------------------------------------------------------- */
  const catStr = sp.get("categoryId");             // ✅ FIX : same idea
  if (catStr !== null) {
    const id = Number(catStr);
    if (!Number.isNaN(id)) where.categoryId = id;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(tasks);
}


/* -------------------------------------------------------------------------- */
/* POST /api/tasks                                                            */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  /* ---------- ตรวจ session ---------- */
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!session || Number.isNaN(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  /* ---------- อ่าน & validate body ---------- */
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = taskSchema.safeParse(rawBody);
  if (!parsed.success)
    return NextResponse.json(parsed.error.flatten(), { status: 400 });

  const {
    title,
    description,
    dueDate: dueDateRaw,
    urgency,
    categoryId,
  } = parsed.data;

  /* ---------------------------------------------------------------------- */
  /*  แปลง dueDate string → Date                                            */
  /*  - รองรับรูป “2025-07-06T11:00” (ไม่มีวินาที)                         */
  /* ---------------------------------------------------------------------- */
  const dueDateFixed =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dueDateRaw)
      ? `${dueDateRaw}:00`
      : dueDateRaw;
  const dueDate = new Date(dueDateFixed);

  /* ---------- บันทึกลง Prisma ---------- */
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        urgency,
        status: "incompleted",
        userId,
        categoryId: categoryId ?? null,
      },
      include: { category: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/tasks] Prisma error:", error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 },
    );
  }
}
