import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EvaluationFormModel from "@/models/EvaluationForm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await connectDB();
  const formExists = await EvaluationFormModel.exists({ form_id: id });

  if (!formExists) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  // Auto deactivate ทุก form ก่อน แล้ว activate เฉพาะตัวที่เลือก
  await EvaluationFormModel.updateMany({}, { $set: { active: false } });
  await EvaluationFormModel.findOneAndUpdate(
    { form_id: id },
    { $set: { active: true } }
  );

  const updated = await EvaluationFormModel.findOne({ form_id: id }).lean();
  return NextResponse.json({ form: updated });
}
