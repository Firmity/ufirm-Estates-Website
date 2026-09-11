// src/app/api/job-alerts/subscribe/route.ts
//
// Public "Get job alerts" signup — see src/lib/jobAlerts.ts for storage and
// the actual send-on-new-job logic (src/app/api/admin/jobs/route.ts calls
// that after a job is created). Same anti-abuse pattern as the resume
// upload form (src/app/api/upload-resume/route.ts): a honeypot field plus
// server-side email validation, and rate-limited per IP on top of that
// since this endpoint, unlike the resume form, has no file to slow a bot
// down.

import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/jobAlerts";
import { isRateLimited } from "@/lib/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    let body: { email?: unknown; website?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // Honeypot — a hidden field a real visitor never fills in.
    if (typeof body.website === "string" && body.website.trim()) {
      console.warn("[JOB_ALERT_SPAM_BLOCKED] honeypot field was filled");
      return NextResponse.json({ message: "Subscribed" }, { status: 200 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(`job-alert-subscribe:${ip}`)) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    const { added } = await subscribe(email);
    return NextResponse.json(
      { message: added ? "Subscribed" : "You're already subscribed" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[JOB_ALERT_SUBSCRIBE_ERR]", err);
    return NextResponse.json({ message: "Failed to subscribe" }, { status: 500 });
  }
}
