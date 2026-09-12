// src/app/api/jobs/route.ts
//
// Public read proxy for job listings, with a short in-memory cache.
//
// WHY THIS EXISTS: CareersPageClient used to call the external API
// (api.urest.in:8096) directly from the browser, once per keystroke in the
// search box (?search=...). That upstream is slow, so every keystroke paid
// a full network round trip from the visitor's own connection — the
// reported "search bar is too slow" / "Loading open positions... takes a
// lot of time". Fixed here without touching the external API:
//   1. The client now fetches the full job list ONCE per page load, from
//      THIS route, and filters by search + department entirely client-side
//      (see CareersPageClient.tsx / AdminDashboardClient.tsx).
//   2. This route caches the upstream response for CACHE_TTL_MS, so even
//      repeat page loads across different visitors are usually served from
//      memory instead of re-hitting the slow upstream.
//
// Also merges in locally-stored Description text (see
// src/lib/jobDescriptions.ts) — the upstream API silently drops that field,
// so it's no longer trusted from the upstream response at all.
//
// KNOWN LIMITATION (same shape as src/lib/rateLimit.ts): cache lives in
// process memory. Resets on redeploy/cold start, not shared across
// multiple server instances. Fine for a single small Next.js server; not a
// substitute for a real shared cache if this ever needs to scale out.
//
// NOTE: src/app/api/job.ts's original getJobs(search) — used by the OLD
// /CareerPage — is intentionally left untouched and still hits the
// external API directly. This route is only used by the new /CareersPage
// and its admin dashboard, so the old page's behavior can't regress.

import { NextResponse } from "next/server";
import { getAllDescriptions } from "@/lib/jobDescriptions";
import { getAllStatuses } from "@/lib/jobStatus";
import { getAllClickCounts } from "@/lib/jobClicks";
import { getAllFieldIcons } from "@/lib/jobFieldIcons";
import { getAllExtras } from "@/lib/jobExtras";

// Belt-and-suspenders alongside the MAX_IMAGE_URL_LENGTH guard in
// src/app/api/admin/jobs/route.ts: gives this route real room to run its
// full UPSTREAM_TIMEOUT_MS + one retry (up to ~50s) before Vercel's own
// function timeout kills it mid-flight. Without this, a plan's shorter
// default execution limit can kill the function before our own timeout
// logic even gets to return its 502 — the connection just drops, which is
// what a hung, JSON-less fetch looks like to the browser (confirmed in
// production against an oversized job poster — see MAX_IMAGE_URL_LENGTH's
// comment). Vercel clamps this to whatever the deployment's plan actually
// allows; it's a no-op, never an error, on a plan with a lower ceiling.
export const maxDuration = 60;

const EXTERNAL_JOBS_URL = "https://api.urest.in:8096/api/jobs";
const CACHE_TTL_MS = 60 * 1000; // 60s — job listings don't change often enough to need less.
// api.urest.in:8096 is documented as slow (that's the whole reason this
// caching proxy exists). An earlier version of this route used a 12s
// abort timeout, which was SHORTER than the upstream's normal response
// time and caused it to abort perfectly healthy (if slow) requests —
// visible as repeated AbortError logs. 25s gives it real room to respond;
// the visible Retry button in the UI is the backstop if it's still slow.
const UPSTREAM_TIMEOUT_MS = 25_000;

let cache: { data: unknown; expiresAt: number } | null = null;

async function fetchUpstream(): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(EXTERNAL_JOBS_URL, { signal: controller.signal });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`upstream ${res.status}: ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// The upstream API is occasionally flaky (transient 5xx / connection
// resets) — one quick retry clears most of those without making the user
// wait for a full cache-miss round trip twice.
async function fetchUpstreamWithRetry(): Promise<unknown> {
  try {
    return await fetchUpstream();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.warn("[JOBS_PROXY_RETRY]", isTimeout ? `upstream timed out after ${UPSTREAM_TIMEOUT_MS}ms` : message);
    return await fetchUpstream();
  }
}

// Description, Status, and LinkClicks are entirely our own data now (see
// src/lib/jobDescriptions.ts, jobStatus.ts, jobClicks.ts for why) — this
// merges all three into every job by Id, overriding whatever (if anything)
// the upstream response has for Description and filling in defaults
// (Status: "open", LinkClicks: 0) for the other two, which upstream has
// never had a concept of at all.
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
  if (cache && now < cache.expiresAt) {
    return NextResponse.json(await withLocalData(cache.data), { status: 200 });
  }

  try {
    const data = await fetchUpstreamWithRetry();
    cache = { data, expiresAt: now + CACHE_TTL_MS };
    return NextResponse.json(await withLocalData(data), { status: 200 });
  } catch (err) {
    console.error("[JOBS_PROXY_ERR]", err);
    // Prefer slightly-stale data over a broken page.
    if (cache) return NextResponse.json(await withLocalData(cache.data), { status: 200 });
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 502 });
  }
}
