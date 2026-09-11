// src/app/api/admin/job-alerts/route.ts
//
// Session-gated: how many people are currently subscribed to job alerts —
// shown in the admin dashboard header. Read-only; subscribing/unsubscribing
// is entirely self-service via the public routes in src/app/api/job-alerts.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { getSubscriberCount } from "@/lib/jobAlerts";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const count = await getSubscriberCount();
    return NextResponse.json({ count }, { status: 200 });
  } catch (err) {
    console.error("[JOB_ALERTS_COUNT_ERR]", err);
    return NextResponse.json({ message: "Failed to load subscriber count" }, { status: 500 });
  }
}
