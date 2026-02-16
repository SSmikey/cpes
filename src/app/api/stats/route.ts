import { NextRequest, NextResponse } from "next/server";
import { getFormById, getProjects } from "@/lib/data";
import { calcAllProjectStats, calcRanking, calcStudentMonitor } from "@/lib/stats";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const form_id = searchParams.get("form_id");

  if (!form_id) {
    return NextResponse.json(
      { error: "กรุณาระบุ form_id" },
      { status: 400 }
    );
  }

  const form = getFormById(form_id);
  if (!form) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  const projects = getProjects();
  const projectStats = calcAllProjectStats(form, projects);
  const ranking = calcRanking(projectStats);
  const studentMonitor = calcStudentMonitor(form_id, projects.length);

  return NextResponse.json({
    form_id,
    form_title: form.title,
    project_stats: projectStats,
    ranking,
    student_monitor: studentMonitor,
  });
}
