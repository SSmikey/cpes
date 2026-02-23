import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EvaluationFormModel from "@/models/EvaluationForm";
import EvaluationModel from "@/models/Evaluation";
import type { Question } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const formDoc = await EvaluationFormModel.findOne({ form_id: id });

  if (!formDoc) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  const formHasEvaluations = await EvaluationModel.exists({ form_id: id });

  // อัปเดต title, scale, deadline
  if (body.title !== undefined) formDoc.title = String(body.title);
  if (body.deadline !== undefined) formDoc.deadline = body.deadline;
  if (body.scale !== undefined && !formHasEvaluations) {
    formDoc.scale = body.scale;
  }

  // อัปเดต questions
  if (body.questions !== undefined) {
    const updatedQuestions = body.questions as Question[];
    const incomingIds = new Set(updatedQuestions.map((q) => q.id));

    const processedQuestions = updatedQuestions.map((incoming) => {
      const existing = formDoc.questions.find((q) => q.id === incoming.id);
      if (existing) {
        return {
          id: existing.id,
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
    const evaluationsForForm = await EvaluationModel.find({ form_id: id }).lean();
    const orphaned = formDoc.questions
      .filter((q) => {
        if (incomingIds.has(q.id)) return false;
        return evaluationsForForm.some((e) => {
          const answers =
            e.answers instanceof Map
              ? Object.fromEntries(e.answers)
              : (e.answers as Record<string, number>);
          return q.id in answers;
        });
      })
      .map((q) => ({ id: q.id, text: q.text, order: q.order, active: false }));

    formDoc.questions = [
      ...processedQuestions,
      ...orphaned,
    ] as typeof formDoc.questions;
  }

  await formDoc.save();
  const saved = await EvaluationFormModel.findOne({ form_id: id }).lean();
  return NextResponse.json({ form: saved });
}
