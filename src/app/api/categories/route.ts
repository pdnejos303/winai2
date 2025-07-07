import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(req: Request) {
  const { name, icon } = await req.json();
  if (!name || !icon) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const cat = await prisma.category.create({ data: { name, icon } });
  return NextResponse.json(cat, { status: 201 });
}
