/* Path: src/app/api/tasks/[id]/route.ts
   ----------------------------------------------------------------------------
   📄 ไฟล์นี้คือ:
   API Route สำหรับ "Task รายตัว" (ใช้ dynamic route `[id]`)
   - รองรับ HTTP PATCH: เพื่ออัปเดต task รายการเดียวตาม id
   - รองรับ HTTP DELETE: เพื่อลบ task รายการเดียวตาม id
   - ใช้การยืนยันตัวตนผ่าน NextAuth (getServerSession)
   - ใช้ Prisma ORM เชื่อมกับฐานข้อมูล
   ---------------------------------------------------------------------------- */

import { NextRequest, NextResponse } from "next/server"; // สำหรับจัดการ request/response แบบ API
import { getServerSession } from "next-auth"; // ฟังก์ชันเช็ก session ผู้ใช้แบบ server-side
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ตัวเลือก config auth (Google, Credentials ฯลฯ)
import prisma from "@/lib/prisma"; // Prisma client ที่ใช้เชื่อมกับฐานข้อมูล

/* --------------------------------------------------------------------------
   📝 PATCH: อัปเดตข้อมูล Task รายการเดียว (ตาม id ที่รับจาก URL)
   - ตรวจสอบ session ก่อน (ต้อง login)
   - ตรวจสอบว่า id เป็นเลขหรือไม่
   - อัปเดต field ที่ส่งมา (แบบ dynamic)
   -------------------------------------------------------------------------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions); // เช็กว่า user login หรือไม่
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // ไม่ได้ login → 401
  }

  const id = Number(params.id); // ดึงพารามิเตอร์ id จาก URL แล้วแปลงเป็นตัวเลข
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 }); // id ไม่ใช่เลข → 400
  }

  const body = await req.json(); // อ่าน body ของ request (JSON)
  const { title, description, dueDate, urgency, category, status } = body;

  // อัปเดตเฉพาะ field ที่มีใน body (ใช้ spread + short-circuit)
  const updatedTask = await prisma.task.update({
    where: { id }, // หา task จาก id
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(dueDate && { dueDate: new Date(dueDate) }), // แปลง string → Date
      ...(urgency && { urgency }),
      ...(category && { category }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(updatedTask); // คืนค่า task ที่อัปเดตแล้ว
}

/* --------------------------------------------------------------------------
   🗑️ DELETE: ลบ Task รายการเดียว (ตาม id)
   - ตรวจสอบ session และความถูกต้องของ id เช่นเดียวกับ PATCH
   - ลบ task ใน database
   -------------------------------------------------------------------------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions); // เช็กว่า user login อยู่หรือไม่
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // ไม่ login → ปฏิเสธ
  }

  const id = Number(params.id); // ดึง id จาก URL แล้วแปลงเป็นตัวเลข
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 }); // id ไม่ใช่เลข → ปฏิเสธ
  }

  await prisma.task.delete({ where: { id } }); // ลบ task จาก DB ตาม id

  return NextResponse.json({ ok: true }); // ตอบกลับว่า "ลบสำเร็จ"
}
