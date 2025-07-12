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
    .refine((d) => !Number.isNaN(Date.parse(d)), {
      message: "dueDate must be a valid ISO-8601 string",
    }),
  urgency: z.number().int().min(0).max(3).default(0),  // ✔ เปลี่ยนแบบถูก
  category: z.string().min(1),
});

/* -------------------------------------------------------------------------- */
/*  GET /api/tasks                                                            */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  /* ---------- ตรวจ session ---------- */
  const session = await getServerSession(authOptions);
  const rawId = session?.user?.id;
  const userId = Number(rawId);

  if (!session || !rawId || Number.isNaN(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  /* ---------- สร้าง where จาก query string ---------- */
  const sp = req.nextUrl.searchParams;
  const where: Prisma.TaskWhereInput = { userId };

  const status = sp.get("status");
  if (status === "completed" || status === "incompleted") where.status = status;

const urgStr = sp.get("urgency");
if (urgStr && urgStr !== "all") {
  const urgNum = Number(urgStr);
  if ([0, 1, 2, 3].includes(urgNum)) where.urgency = urgNum;
}

  const category = sp.get("category");
  if (category && category !== "all") where.category = category;

  /* ---------- ดึงข้อมูลจาก Prisma ---------- */
  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks, { status: 200 });
}

/* -------------------------------------------------------------------------- */
/*  POST /api/tasks                                                           */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  /* ---------- ตรวจ session ---------- */
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!session || Number.isNaN(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  /* ---------- อ่าน & validate request body ---------- */
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = taskSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  const {
    title,
    description,
    dueDate: dueDateRaw,
    urgency,
    category,
  } = parsed.data;

  /* ---------------------------------------------------------------------- */
  /*  แปลง dueDate ให้เป็น Date                                             */
  /*  - รองรับรูป “2025-07-06T11:00”                                        */
  /* ---------------------------------------------------------------------- */
  const dueDateFixed =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dueDateRaw)
      ? `${dueDateRaw}:00` // เติมวินาที = :00
      : dueDateRaw;
  const dueDate = new Date(dueDateFixed); // ถ้ายังผิดจะ throw และไป catch ด้านล่าง

  /* ---------- บันทึกลง Prisma ---------- */
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        urgency,
        category,
        status: "incompleted",
        userId,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks] Prisma error:", error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 },
    );
  }
}
