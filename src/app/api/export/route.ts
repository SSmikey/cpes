import { NextRequest, NextResponse } from "next/server";
import { getFormById, getProjects } from "@/lib/data";
import { calcAllProjectStats } from "@/lib/stats";

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
  const stats = calcAllProjectStats(form, projects);

  // สร้าง CSV headers
  const activeQuestions = form.questions
    .filter((q) => q.active)
    .sort((a, b) => a.order - b.order);

  const headers = [
    "ลำดับ",
    "กลุ่ม",
    "จำนวนผู้ประเมิน",
    "Mean รวม",
    "SD รวม",
    ...activeQuestions.map((q) => `Mean ${q.id}`),
    ...activeQuestions.map((q) => `SD ${q.id}`),
  ];

  const rows = stats.map((s, i) => {
    const qMeans = activeQuestions.map((q) => {
      const qs = s.per_question.find((p) => p.question_id === q.id);
      return qs ? qs.mean.toFixed(2) : "0.00";
    });
    const qSDs = activeQuestions.map((q) => {
      const qs = s.per_question.find((p) => p.question_id === q.id);
      return qs ? qs.sd.toFixed(2) : "0.00";
    });

    return [
      i + 1,
      s.project_name,
      s.evaluator_count,
      s.overall_mean.toFixed(2),
      s.overall_sd.toFixed(2),
      ...qMeans,
      ...qSDs,
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const bom = "\uFEFF"; // BOM สำหรับ Excel รองรับ UTF-8

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stats_${form_id}.csv"`,
    },
  });
}
