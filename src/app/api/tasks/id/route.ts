// Path: src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const { title, description, dueDate, urgency, category, status } = body;

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(urgency && { urgency }),
      ...(category && { category }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(updatedTask);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
