// src/app/api/admin/credentials/route.ts
//
// Lets a logged-in admin change the Careers-admin username/password from
// the dashboard instead of hand-editing .env.local (which most deploys
// can't do live anyway, and this repo's tooling specifically can't write
// to). Requires the CURRENT password to confirm identity, then writes
// data/admin-credentials.json — see src/lib/adminAuth.ts for how that file
// relates to ADMIN_USERNAME / ADMIN_PASSWORD_HASH (env is only the
// first-run bootstrap; this file takes over permanently once it exists).
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionCookieValue,
  getAdminCredentials,
  setAdminCredentials,
  verifyPassword,
  hashPassword,
} from "@/lib/adminAuth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    // Separate bucket from login attempts (src/lib/rateLimit.ts is keyed by
    // whatever string you pass it) — a slow credential-change guesser
    // shouldn't get to piggyback on the login endpoint's own budget.
    if (isRateLimited(`cred-change:${ip}`)) {
      return NextResponse.json(
        { message: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    let body: { currentPassword?: string; newUsername?: string; newPassword?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const { currentPassword, newUsername, newPassword } = body;
    if (!currentPassword) {
      return NextResponse.json({ message: "Current password is required" }, { status: 400 });
    }

    const stored = await getAdminCredentials();
    if (!stored || !verifyPassword(currentPassword, stored.passwordHash)) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    const trimmedUsername = newUsername?.trim();
    const nextUsername = trimmedUsername ? trimmedUsername : stored.username;
    let nextPasswordHash = stored.passwordHash;

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }
      nextPasswordHash = hashPassword(newPassword);
    }

    if (!trimmedUsername && !newPassword) {
      return NextResponse.json(
        { message: "Nothing to update — provide a new username and/or password" },
        { status: 400 }
      );
    }

    setAdminCredentials({ username: nextUsername, passwordHash: nextPasswordHash });

    return NextResponse.json({ message: "Credentials updated" }, { status: 200 });
  } catch (err) {
    console.error("[CRED_UPDATE_ERR]", err);
    return NextResponse.json({ message: "Failed to update credentials" }, { status: 500 });
  }
}
