import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "ชื่อกลุ่มห้ามว่าง" }, { status: 400 });
  }
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "ไม่พบกลุ่มนี้" }, { status: 404 });
  }
  projects[index].name = name.trim();
  saveProjects(projects);
  return NextResponse.json({ project: projects[index] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "ไม่พบกลุ่มนี้" }, { status: 404 });
  }
  projects.splice(index, 1);
  saveProjects(projects);
  return NextResponse.json({ success: true });
}
