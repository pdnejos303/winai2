/* ────────────────────────────────────────────────────────────────────────────
   📁 src/app/api/tasks/route.ts
   ---------------------------------------------------------------------------
   REST handlers (GET · POST) สำหรับ “Task ทั้งหมดของผู้ใช้”
   • สอดคล้อง Prisma schema (Task.categoryId → FK → Category)
   • GET  – คืน tasks ลำดับตาม dueDate  + include Category ชื่อ & icon
   • POST – body ต้องมี { title, dueDate(ISO), urgency:"low|medium|high",
                          categoryId:Int }
            → create task  status="incompleted"
   • ใช้ next-auth session ตรวจ uid (Int) ทุกคำสั่ง
   • Validate body ด้วย Zod ป้องกัน payload ผิดรูป (ลด 400/500)
   • Helper isoToDate() รองรับ “YYYY-MM-DDTHH:mm” (ไม่มีวินาที)  
   ------------------------------------------------------------------------- */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { z } from "zod";

/* ───── 1. Zod schema ตรวจ POST body ───── */
const TaskBody = z.object({
  title:       z.string().min(1, "title required"),
  description: z.string().default(""),
  dueDate:     z.string().refine((d) => !Number.isNaN(Date.parse(d)), {
                  message: "dueDate must be ISO-8601 string",
               }),
  urgency:     z.enum(["low", "medium", "high"]),
  categoryId:  z.number().int().positive(),
});

/* ───── 2. helper: แปลง ISO สั้น → Date ───── */
function isoToDate(str: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)
    ? new Date(`${str}:00`) // เติมวินาที
    : new Date(str);
}

/* ──────────────────────────────────────────
   GET /api/tasks
   -----------------------------------------
   » ดึง tasks ของ user  (include Category)
   » รองรับ query ?status & ?urgency & ?categoryId ถ้าอยาก filter
   ────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  /* 1) auth ---------------------------------------------------- */
  const session = await getServerSession(authOptions);
  const uid     = Number(session?.user?.id);
  if (!session || Number.isNaN(uid))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  /* 2) optional filter ---------------------------------------- */
  const sp   = req.nextUrl.searchParams;
  const where: any = { userId: uid };

  const st = sp.get("status");
  if (st === "completed" || st === "incompleted") where.status = st;

  const urg = sp.get("urgency");
  if (urg && ["low", "medium", "high"].includes(urg)) where.urgency = urg;

  const catId = sp.get("categoryId");
  if (catId && !Number.isNaN(Number(catId))) where.categoryId = Number(catId);

  /* 3) query --------------------------------------------------- */
  const tasks = await prisma.task.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: { category: true },
  });

  return NextResponse.json(tasks);
}

/* ──────────────────────────────────────────
   POST /api/tasks
   -----------------------------------------
   ● body ผ่าน Zod → สร้าง Task ใหม่
   ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* 1) auth ---------------------------------------------------- */
  const session = await getServerSession(authOptions);
  const uid     = Number(session?.user?.id);
  if (!session || Number.isNaN(uid))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  /* 2) parse+validate ----------------------------------------- */
  const raw = await req.json();
  const parsed = TaskBody.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(parsed.error.flatten(), { status: 400 });

  const { title, description, dueDate, urgency, categoryId } = parsed.data;

  /* 3) create -------------------------------------------------- */
  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: isoToDate(dueDate),
      urgency,
      status: "incompleted",
      userId: uid,
      category: { connect: { id: categoryId } }, // FK ➜ Category
    },
    include: { category: true },
  });

  return NextResponse.json(task, { status: 201 });
}

/* ──────────────────────────────────────────────────────────────
   END FILE  (คอมเมนต์ยาวเหมือนไฟล์ต้นฉบับเดิมทุกบรรทัด)
   ───────────────────────────────────────────────────────────── */
