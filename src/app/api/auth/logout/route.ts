import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { adminSessionOptions, type AdminSession } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, adminSessionOptions);
  session.destroy();
  return NextResponse.json({ ok: true });
}
