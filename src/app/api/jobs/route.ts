// src/app/api/jobs/route.ts
//
// Public read proxy for job listings. Caching itself lives in
// src/lib/jobsCache.ts (shared with the admin create/delete routes, which
// invalidate it on write — see that file's header for why it's not inline
// here). This file is just the HTTP layer: pick fresh/stale/cold based on
// age, and merge in our own locally-stored fields.
//
// WHY THE CACHE IS SHARED (Redis), NOT JUST IN-MEMORY: on Vercel, every
// cold serverless instance starts with an EMPTY in-memory cache. Under
// real traffic Vercel spins up multiple concurrent instances, so many
// concurrent "first requests" were each independently blocking on the
// slow upstream (api.urest.in:8096) — that's what showed up as slow/
// failed loads, not the amount of data being returned (the earlier
// oversized-poster incident was a compounding factor, already fixed
// separately via MAX_IMAGE_URL_LENGTH in api/admin/jobs/route.ts, not the
// root cause of ordinary slowness). Sharing the cache in Redis means only
// the very first request across ALL instances (or the first after the
// shared cache goes stale) ever waits on upstream.
//
// STALE-WHILE-REVALIDATE: once the shared cache has data at all, requests
// never block on upstream again, even once that data is stale — a stale
// response is served immediately and a refresh is kicked off in the
// background via Next's `after()` (stable since Next 15.1; this project is
// on 15.3.8), which runs after the response has already been sent instead
// of delaying it. Only a genuinely empty cache (first deploy ever, or
// Redis not configured — see src/lib/kv.ts's local-dev fallback) blocks a
// request on upstream.
//
// urest itself is UNCHANGED by this — it's still the system of record for
// Title/Type/Education/CTC/Department/Designation/Posted/ImageUrl/Company/
// Id, and job creation/deletion still goes through it (see
// src/app/api/admin/jobs/route.ts and .../jobs/[id]/route.ts — both call
// invalidateJobsListCache() right after a successful write, so a newly
// created or deleted job is visible on the very next request instead of
// waiting out the cache TTL).
//
// Also merges in locally-stored Description/Status/LinkClicks/FieldIcons/
// CtcFrequency/EndDate (see src/lib/job*.ts) — the upstream API silently
// drops, or has never had a concept of, any of these, so none of them are
// trusted from the upstream response. This merge is NOT part of the cached
// snapshot — it re-reads its own local stores on every request — so
// editing a description/status/icon/CTC-frequency/end-date already shows
// up immediately regardless of the jobs-list cache state.
//
// NOTE: src/app/api/job.ts's original getJobs(search) — used by the OLD
// /CareerPage — is intentionally left untouched and still hits the
// external API directly. This route is only used by the new /CareersPage
// and its admin dashboard, so the old page's behavior can't regress.

import { NextResponse, after } from "next/server";
import { getAllDescriptions } from "@/lib/jobDescriptions";
import { getAllStatuses } from "@/lib/jobStatus";
import { getAllClickCounts } from "@/lib/jobClicks";
import { getAllFieldIcons } from "@/lib/jobFieldIcons";
import { getAllExtras } from "@/lib/jobExtras";
import { readCache, refreshCache, triggerBackgroundRefresh, FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/jobsCache";

// Belt-and-suspenders alongside the MAX_IMAGE_URL_LENGTH guard in
// src/app/api/admin/jobs/route.ts: gives a genuinely-blocking request
// (empty cache) real room to run its full upstream timeout + one retry
// (up to ~50s, see src/lib/jobsCache.ts) before Vercel's own function
// timeout kills it mid-flight. Vercel clamps this to whatever the
// deployment's plan actually allows; it's a no-op, never an error, on a
// plan with a lower ceiling.
export const maxDuration = 60;

// Description, Status, LinkClicks, FieldIcons, CtcFrequency, and EndDate
// are entirely our own data now (see the src/lib/job*.ts files this
// imports) — this merges all of them into every job by Id, overriding
// whatever (if anything) the upstream response has for Description and
// filling in defaults for the rest, which upstream has never had any
// concept of at all.
async function withLocalData(data: unknown): Promise<unknown> {
  if (!Array.isArray(data)) return data;
  const [descriptions, statuses, clicks, fieldIcons, extras] = await Promise.all([
    getAllDescriptions(),
    getAllStatuses(),
    getAllClickCounts(),
    getAllFieldIcons(),
    getAllExtras(),
  ]);
  return data.map((job) => {
    if (!job || typeof job !== "object" || (job as { Id?: unknown }).Id == null) return job;
    const id = String((job as { Id: number | string }).Id);
    const jobExtras = extras[id];
    return {
      ...job,
      ...(id in descriptions ? { Description: descriptions[id] } : {}),
      Status: statuses[id] ?? "open",
      LinkClicks: clicks[id] ?? 0,
      ...(id in fieldIcons ? { FieldIcons: fieldIcons[id] } : {}),
      // CtcFrequency always defaults to "annual" (never left undefined) —
      // every CTC value that predates this feature was an annual figure,
      // so treating "no stored frequency" as monthly would misrepresent
      // every job created before today.
      CtcFrequency: jobExtras?.CtcFrequency ?? "annual",
      ...(jobExtras?.EndDate ? { EndDate: jobExtras.EndDate } : {}),
    };
  });
}

export async function GET() {
  const now = Date.now();
  const shared = await readCache();

  if (shared) {
    const age = now - shared.fetchedAt;

    if (age < FRESH_TTL_MS) {
      return NextResponse.json(await withLocalData(shared.data), { status: 200 });
    }

    if (age < STALE_TTL_MS) {
      // Stale-while-revalidate: respond instantly with what we have, and
      // schedule the refresh for AFTER the response is sent so it never
      // adds to this visitor's latency.
      after(() => triggerBackgroundRefresh());
      return NextResponse.json(await withLocalData(shared.data), { status: 200 });
    }
    // Past STALE_TTL_MS — too old to serve blindly. Fall through to a
    // blocking refresh, keeping `shared` only as a last-resort fallback if
    // that blocking refresh itself fails (see catch below).
  }

  try {
    const entry = await refreshCache();
    return NextResponse.json(await withLocalData(entry.data), { status: 200 });
  } catch (err) {
    console.error("[JOBS_PROXY_ERR]", err);
    // Prefer arbitrarily-stale data over a broken page.
    if (shared) return NextResponse.json(await withLocalData(shared.data), { status: 200 });
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 502 });
  }
}
