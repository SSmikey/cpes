import { NextResponse } from "next/server";
import { getActiveForm } from "@/lib/data";

export async function GET() {
  const form = getActiveForm();
  if (!form) {
    return NextResponse.json(
      { error: "ไม่พบแบบประเมินที่เปิดใช้งาน" },
      { status: 404 }
    );
  }
  return NextResponse.json({ form });
}
