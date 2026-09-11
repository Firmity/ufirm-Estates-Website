// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminCredentials,
  verifyPassword,
  createSessionCookieValue,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
} from "@/lib/adminAuth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    // Checks Redis (production) / data/admin-credentials.json (local
    // fallback) first, falls back to ADMIN_USERNAME/ADMIN_PASSWORD_HASH env
    // vars — see lib/adminAuth.ts.
    const stored = await getAdminCredentials();

    if (!stored) {
      console.error("[CONFIG_ERR] No admin credentials configured (Redis, local file, or env)");
      return NextResponse.json(
        { message: "Admin login is not configured" },
        { status: 500 }
      );
    }

    // Both checks run regardless of which fails first, to avoid timing hints
    // about whether the username was correct.
    const usernameOk = username === stored.username;
    const passwordOk = verifyPassword(password, stored.passwordHash);

    if (!usernameOk || !passwordOk) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ message: "Logged in" }, { status: 200 });
    res.cookies.set(ADMIN_SESSION_COOKIE, createSessionCookieValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
    return res;
  } catch (err) {
    console.error("[LOGIN_ERR]", err);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
