import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface User {
  username: string;
  password: string;
  role: string;
}

function getUsers(): User[] {
  const filePath = path.join(process.cwd(), "src", "data", "users.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as User[];
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "กรุณากรอก username และ password" }, { status: 400 });
  }

  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  return NextResponse.json({ success: true, role: user.role, username: user.username });
}
