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

    form.questions = updatedQuestions.map((incoming) => {
      const existing = form.questions.find((q) => q.id === incoming.id);

      if (existing) {
        // ถ้ามีข้อมูล evaluation แล้ว ห้าม hard delete — soft delete เท่านั้น
        const questionHasData = evaluations.some(
          (e) => e.form_id === id && incoming.id in e.answers
        );
        return {
          ...existing,
          text: incoming.text ?? existing.text,
          order: incoming.order ?? existing.order,
          // ถ้ามีข้อมูลอยู่แล้ว บังคับให้ active=false แทน (soft delete)
          active:
            questionHasData && incoming.active === false
              ? false
              : (incoming.active ?? existing.active),
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
  }

  forms[index] = form;
  saveForms(forms);

  return NextResponse.json({ form });
}
