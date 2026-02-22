import type { SessionOptions } from "iron-session";

export interface AdminSession {
  userId: string;
  username: string;
  role: "admin" | "staff";
}

export interface StudentSession {
  student_id: string;
  name: string;
  own_group: string;
}

export const adminSessionOptions: SessionOptions = {
  cookieName: "cpes_admin",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export const studentSessionOptions: SessionOptions = {
  cookieName: "cpes_student",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
  },
};
