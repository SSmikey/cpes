import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { adminSessionOptions, type AdminSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  await connectDB();

  // Allow first-run (no users in DB) OR existing admin session
  const userCount = await UserModel.countDocuments();
  if (userCount > 0) {
    const cookieStore = await cookies();
    const session = await getIronSession<AdminSession>(cookieStore, adminSessionOptions);
    if (!session.userId) {
      return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
    }
  }

  const { username, password, role = "staff" } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password ต้องมีอย่างน้อย 6 ตัวอักษร" },
      { status: 400 }
    );
  }

  const existing = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (existing) {
    return NextResponse.json({ error: "Username นี้มีอยู่แล้ว" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await UserModel.create({
    username: username.toLowerCase().trim(),
    password: hashed,
    role,
  });

  return NextResponse.json({ ok: true });
}
