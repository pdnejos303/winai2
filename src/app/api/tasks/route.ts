// Path: src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma"; // สมมติเรามี prisma client ที่ "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, dueDate, urgency, category } = body;

  if (!title || !dueDate || !urgency || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      urgency,
      category,
      user: { connect: { email: session.user.email } },
    },
  });

  return NextResponse.json(newTask, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const urgency = searchParams.get("urgency");

  const tasks = await prisma.task.findMany({
    where: {
      user: { email: session.user.email },
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(urgency ? { urgency } : {}),
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(tasks);
}
