import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint นี้ถูกปิดแล้ว กรุณาใช้ /api/auth/login" },
    { status: 410 }
  );
}
