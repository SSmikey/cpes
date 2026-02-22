import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import type { AdminSession, StudentSession } from "@/lib/session";

async function getAdminSession(req: NextRequest): Promise<AdminSession | null> {
  const cookie = req.cookies.get("cpes_admin")?.value;
  if (!cookie) return null;
  try {
    const data = await unsealData<AdminSession>(cookie, {
      password: process.env.SESSION_SECRET!,
    });
    return data.userId ? data : null;
  } catch {
    return null;
  }
}

async function getStudentSession(req: NextRequest): Promise<StudentSession | null> {
  const cookie = req.cookies.get("cpes_student")?.value;
  if (!cookie) return null;
  try {
    const data = await unsealData<StudentSession>(cookie, {
      password: process.env.SESSION_SECRET!,
    });
    return data.student_id ? data : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect /evaluate — must have student session
  if (pathname === "/evaluate") {
    const session = await getStudentSession(request);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/evaluate"],
};
