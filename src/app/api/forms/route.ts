import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getForms } from "@/lib/data";
import EvaluationFormModel from "@/models/EvaluationForm";
import type { Question } from "@/types";

export async function GET() {
  const forms = await getForms();
  return NextResponse.json({ forms });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, scale, questions } = body;

  if (!title || !scale || !questions) {
    return NextResponse.json(
      { error: "ข้อมูลไม่ครบถ้วน (title, scale, questions)" },
      { status: 400 }
    );
  }

  if (
    typeof scale.min !== "number" ||
    typeof scale.max !== "number" ||
    scale.min >= scale.max
  ) {
    return NextResponse.json({ error: "scale ไม่ถูกต้อง" }, { status: 400 });
  }

  await connectDB();
  const form_id = `form_${Date.now()}`;
  const newForm = {
    form_id,
    title: String(title),
    active: false,
    scale: { min: Number(scale.min), max: Number(scale.max) },
    deadline: body.deadline ?? null,
    questions: (questions as Question[]).map((q, i) => ({
      id: q.id ?? `q${i + 1}`,
      text: String(q.text),
      order: Number(q.order ?? i + 1),
      active: q.active ?? true,
    })),
  };

  await EvaluationFormModel.create(newForm);
  return NextResponse.json({ form: newForm }, { status: 201 });
}
