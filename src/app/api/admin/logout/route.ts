// src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" }, { status: 200 });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
