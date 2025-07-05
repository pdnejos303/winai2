// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*  GET /api/tasks                                                            */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  /* ---- ตรวจ session & user.id ---- */
  const rawId = session?.user?.id;
  const userId = Number(rawId);
  if (!session || !rawId || Number.isNaN(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  /* ---- สร้าง where ---- */
  const sp = req.nextUrl.searchParams;
  const where: Prisma.TaskWhereInput = { userId };

  const status = sp.get("status");
  if (status === "completed" || status === "incompleted") where.status = status;

  const urgency = sp.get("urgency");
  if (urgency && urgency !== "all") where.urgency = urgency;

  const category = sp.get("category");
  if (category && category !== "all") where.category = category;

  /* ---- คิวรี ---- */
  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

/* -------------------------------------------------------------------------- */
/*  POST /api/tasks                                                           */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const rawId = session?.user?.id;
  const userId = Number(rawId);
  if (!session || !rawId || Number.isNaN(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      ...body,
      userId,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
