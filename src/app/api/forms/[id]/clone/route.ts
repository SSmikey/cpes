import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EvaluationFormModel from "@/models/EvaluationForm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const source = await EvaluationFormModel.findOne({ form_id: id }).lean();

  if (!source) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  const form_id = `form_${Date.now()}`;
  const newTitle = body.title ?? `${source.title} (copy)`;

  const cloned = {
    form_id,
    title: String(newTitle),
    active: false,
    scale: source.scale,
    deadline: source.deadline ?? null,
    questions: source.questions.map((q) => ({ ...q })),
  };

  await EvaluationFormModel.create(cloned);
  return NextResponse.json({ form: cloned }, { status: 201 });
}
