// src/app/api/admin/job-alerts/route.ts
//
// Admin-only read of the "Get job alerts" subscriber count. This is the
// direct answer to "where do I view subscribed emails — can't find it in
// the Redis dashboard": the list lives under the Redis key
// "job-alert-subscribers" (src/lib/jobAlerts.ts), which won't appear in
// the Upstash Data Browser until at least one person has subscribed — it's
// simply empty/nonexistent right now, not hidden. This route only exposes
// a COUNT, not the raw email list, to keep subscriber addresses out of the
// browser/devtools; for the actual list, read the Redis key directly.

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
    console.error("[ADMIN_JOB_ALERTS_COUNT_ERR]", err);
    return NextResponse.json({ message: "Failed to load subscriber count" }, { status: 500 });
  }
}
