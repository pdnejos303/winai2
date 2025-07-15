/** -------------------------------------------------------------------------
 * API Route: /api/tasks
 *
 * - GET  /api/tasks   → รายการ Task ของผู้ใช้  (รองรับ filter ผ่าน query)
 * - POST /api/tasks   → สร้าง Task ใหม่
 *
 * หมายเหตุ
 * -------
 * • ใช้ getServerSession(authOptions) เพื่อตรวจสิทธิ์ผู้ใช้งาน
 * • validate body ด้วย Zod ก่อนบันทึก
 * • รองรับ dueDate ที่ส่งมาเป็น “YYYY-MM-DDTHH:mm” โดยจะเติมวินาที :00 ให้
 * ------------------------------------------------------------------------ */
import { NextRequest, NextResponse }    from "next/server";
import { getServerSession }            from "next-auth";
import { authOptions }                 from "@/lib/authOptions";
import prisma                          from "@/lib/prisma";
import { Prisma }                      from "@prisma/client";
import { z }                           from "zod";

/* -------------------------------------------------------------------------- */
/* Zod schema สำหรับตรวจสอบ body ของ POST                                      */
/* -------------------------------------------------------------------------- */
const taskSchema = z.object({
  title      : z.string().min(1, "title is required"),
  description: z.string().default(""),
  dueDate    : z.string().refine((d) => !Number.isNaN(Date.parse(d)), {
                 message: "dueDate must be ISO-8601",
               }),
  urgency    : z.number().int().min(0).max(3).default(0),
  categoryId : z.number().int().optional().nullable(), // FK (nullable OK)
});

/* -------------------------------------------------------------------------- */
/* helper – ดึง userId (Int) กลับ null ถ้าไม่มีสิทธิ์                         */
/* -------------------------------------------------------------------------- */
async function currentUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  const uid     = Number(session?.user?.id);
  return !session || Number.isNaN(uid) ? null : uid;
}

/* -------------------------------------------------------------------------- */
/* GET /api/tasks                                                             */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sp    = req.nextUrl.searchParams;
  const where: Prisma.TaskWhereInput = { userId: uid };

  /* ---------- status ----------------------------------------------------- */
  const status = sp.get("status");
  if (status === "completed" || status === "incompleted") where.status = status;

  /* ---------- urgency ---------------------------------------------------- */
  const urgStr = sp.get("urgency");
  if (urgStr && urgStr !== "all") {
    const urg = Number(urgStr);
    if ([0, 1, 2, 3].includes(urg)) where.urgency = urg;
  }

  /* ---------- categoryId ------------------------------------------------- */
  // ⚠️  TaskGrid ส่ง query ?category=<id|string 'all'>
  const catStr = sp.get("category");
  if (catStr && catStr !== "all") {
    const cid = Number(catStr);
    if (!Number.isNaN(cid)) where.categoryId = cid;
  }

  /* ---------- fetch ------------------------------------------------------ */
  const tasks = await prisma.task.findMany({
    where,
    include : { category: true },  // ⭐️ ส่ง icon / name ออกไปด้วย
    orderBy : { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

/* -------------------------------------------------------------------------- */
/* POST /api/tasks                                                            */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  /* ---------- validate body --------------------------------------------- */
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(parsed.error.flatten(), { status: 400 });

  const {
    title,
    description,
    dueDate: dueDateRaw,
    urgency,
    categoryId,
  } = parsed.data;

  /* ---------- แปลงวันที่ -------------------------------------------------- */
  const fixed = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dueDateRaw)
    ? `${dueDateRaw}:00`
    : dueDateRaw;
  const dueDate = new Date(fixed);

  /* ---------- save ------------------------------------------------------- */
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        urgency,
        status: "incompleted",
        userId: uid,
        categoryId: categoryId ?? null,
      },
      include: { category: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks] Prisma error:", err);
    return NextResponse.json({ message: "Failed to create task" }, { status: 500 });
  }
}
