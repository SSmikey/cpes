import { NextRequest, NextResponse } from "next/server";
import { getForms, saveForms } from "@/lib/data";
import type { EvaluationForm } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const forms = getForms();
  const source = forms.find((f) => f.form_id === id);

  if (!source) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  const form_id = `form_${Date.now()}`;
  const newTitle = body.title ?? `${source.title} (copy)`;

  const cloned: EvaluationForm = {
    ...source,
    form_id,
    title: String(newTitle),
    active: false,
    questions: source.questions.map((q) => ({ ...q })),
  };

  forms.push(cloned);
  saveForms(forms);

  return NextResponse.json({ form: cloned }, { status: 201 });
}
