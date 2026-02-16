import { NextRequest, NextResponse } from "next/server";
import { getForms, saveForms, getEvaluations } from "@/lib/data";
import type { Question } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const forms = getForms();
  const index = forms.findIndex((f) => f.form_id === id);

  if (index === -1) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  const form = forms[index];
  const evaluations = getEvaluations();
  const formHasEvaluations = evaluations.some((e) => e.form_id === id);

  // อัปเดต title, scale, deadline
  if (body.title !== undefined) form.title = String(body.title);
  if (body.deadline !== undefined) form.deadline = body.deadline;
  if (body.scale !== undefined && !formHasEvaluations) {
    form.scale = body.scale;
  }

  // อัปเดต questions
  if (body.questions !== undefined) {
    const updatedQuestions = body.questions as Question[];
    const incomingIds = new Set(updatedQuestions.map((q) => q.id));

    const processedQuestions = updatedQuestions.map((incoming) => {
      const existing = form.questions.find((q) => q.id === incoming.id);
      if (existing) {
        return {
          ...existing,
          text: incoming.text ?? existing.text,
          order: incoming.order ?? existing.order,
          active: incoming.active ?? existing.active,
        };
      }
      // คำถามใหม่
      return {
        id: incoming.id,
        text: String(incoming.text),
        order: Number(incoming.order),
        active: incoming.active ?? true,
      };
    });

    // ป้องกัน hard delete: question ที่มีข้อมูลแต่ไม่ได้รวมใน request
    // ต้องยังคงอยู่ในระบบ (เป็น inactive อัตโนมัติ)
    const orphaned = form.questions
      .filter(
        (q) =>
          !incomingIds.has(q.id) &&
          evaluations.some((e) => e.form_id === id && q.id in e.answers)
      )
      .map((q) => ({ ...q, active: false }));

    form.questions = [...processedQuestions, ...orphaned];
  }

  forms[index] = form;
  saveForms(forms);

  return NextResponse.json({ form });
}
