import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getProjects } from "@/lib/data";
import ProjectModel from "@/models/Project";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "ชื่อกลุ่มห้ามว่าง" }, { status: 400 });
  }
  await connectDB();
  const id = `group${Date.now()}`;
  await ProjectModel.create({ id, name: name.trim() });
  return NextResponse.json({ project: { id, name: name.trim() } }, { status: 201 });
}
