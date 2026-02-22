import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { adminSessionOptions, type AdminSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "กรุณากรอก username และ password" },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await UserModel.findOne({ username: username.toLowerCase().trim() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { error: "Username หรือ Password ไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, adminSessionOptions);
  session.userId = user._id.toString();
  session.username = user.username;
  session.role = user.role;
  await session.save();

  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
