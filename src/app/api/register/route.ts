import { NextRequest, NextResponse } from "next/server";
import { getStudentById, upsertStudent } from "@/lib/data";
import type { Student } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_id, name, year, own_group } = body;

  if (!student_id || !name || !year || !own_group) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  }

  const existing = getStudentById(String(student_id));
  if (existing) {
    existing.own_group = String(own_group);
    upsertStudent(existing);
    return NextResponse.json({ student: existing });
  }

  const student: Student = {
    student_id: String(student_id),
    name: String(name),
    year: Number(year),
    own_group: String(own_group),
    evaluated_projects: [],
    created_at: new Date().toISOString(),
  };

  upsertStudent(student);
  return NextResponse.json({ student }, { status: 201 });
}
