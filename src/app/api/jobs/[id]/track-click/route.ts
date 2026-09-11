// src/app/api/jobs/[id]/track-click/route.ts
//
// Fired once by CareersPageClient's deep-link effect when a visitor lands
// on ?job=<id> — i.e. someone actually followed a shared job link. See
// src/lib/jobClicks.ts for the counter itself and its known limitations
// (not deduped per visitor, not atomic under heavy concurrency — a rough
// counter, by design).
//
// No admin auth here — this only ever increments a number, never reads or
// changes anything sensitive, so it stays public like the rest of the
// public job-browsing surface. Still rate-limited so it can't be hammered
// to run up a job's click count or hang the process.

import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/jobClicks";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing job id" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(`track-click:${ip}`)) {
      // Silently no-op rather than error — this is a fire-and-forget beacon
      // the page doesn't (and shouldn't) react to either way.
      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    const count = await recordClick(id);
    return NextResponse.json({ clicks: count }, { status: 200 });
  } catch (err) {
    console.error("[JOB_CLICK_TRACK_ERR]", err);
    // Never let a tracking failure surface to the visitor.
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }
}
