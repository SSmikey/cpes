import { NextRequest, NextResponse } from "next/server";
import { getForms, saveForms } from "@/lib/data";
import type { EvaluationForm, Question } from "@/types";

export async function GET() {
  const forms = getForms();
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
    return NextResponse.json(
      { error: "scale ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const forms = getForms();
  const form_id = `form_${Date.now()}`;

  const newForm: EvaluationForm = {
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

  forms.push(newForm);
  saveForms(forms);

  return NextResponse.json({ form: newForm }, { status: 201 });
}
