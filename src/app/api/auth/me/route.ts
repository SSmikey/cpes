import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { adminSessionOptions, type AdminSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, adminSessionOptions);

  if (!session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
    username: session.username,
    role: session.role,
  });
}
