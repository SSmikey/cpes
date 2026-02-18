import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/data";

export async function GET() {
  const projects = getProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "ชื่อกลุ่มห้ามว่าง" }, { status: 400 });
  }
  const projects = getProjects();
  const id = `group${Date.now()}`;
  const newProject = { id, name: name.trim() };
  projects.push(newProject);
  saveProjects(projects);
  return NextResponse.json({ project: newProject }, { status: 201 });
}
