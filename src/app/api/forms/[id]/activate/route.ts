import { NextRequest, NextResponse } from "next/server";
import { getForms, saveForms } from "@/lib/data";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const forms = getForms();
  const index = forms.findIndex((f) => f.form_id === id);

  if (index === -1) {
    return NextResponse.json({ error: "ไม่พบ form" }, { status: 404 });
  }

  // Auto deactivate ทุก form ก่อน แล้ว activate เฉพาะตัวที่เลือก
  const updated = forms.map((f) => ({
    ...f,
    active: f.form_id === id,
  }));

  saveForms(updated);

  return NextResponse.json({ form: updated[index] });
}
