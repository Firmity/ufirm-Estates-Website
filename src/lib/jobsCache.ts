// src/lib/jobsCache.ts
//
// Shared cache for the upstream job list (api.urest.in:8096). Used by
// src/app/api/jobs/route.ts (reads, stale-while-revalidate) AND by the
// admin create/delete routes (invalidation on write). Pulled into its own
// lib file rather than living inline in the GET route handler specifically
// so the write side can invalidate it directly — Next.js route.ts files
// only ever execute their reserved HTTP-method exports (GET/POST/etc.), so
// importing shared mutable state from one route.ts into another isn't a
// safe pattern to lean on.
//
// Two layers:
//   L1: process memory — near-zero latency, but resets on cold start /
//       redeploy and is NOT shared across concurrent serverless instances.
//   L2: Upstash Redis via src/lib/kv.ts — shared across every instance and
//       survives cold starts/redeploys. This is what actually fixes slow
//       loads under real traffic (see the comment in api/jobs/route.ts for
//       the full incident writeup).

import { kvGet, kvSet, kvDelete } from "@/lib/kv";

const EXTERNAL_JOBS_URL = "https://api.urest.in:8096/api/jobs";
const KV_CACHE_KEY = "jobs:list-cache:v1";

// Below this age, cached data is served with NO refresh triggered at all —
// avoids a Redis round trip / background task on every single request.
export const FRESH_TTL_MS = 60 * 1000;
// Above FRESH_TTL_MS but below this, cached data is still served
// immediately (stale-while-revalidate) while a background refresh runs.
// Kept generous (10 min) because serving a slightly-old job list is always
// better than blocking a visitor on a slow upstream call — and because
// admin create/delete calls invalidateJobsListCache() below, this window
// is a worst-case ceiling for "someone edited jobs from somewhere other
// than this app's own admin dashboard," not the normal path.
export const STALE_TTL_MS = 10 * 60 * 1000;

// api.urest.in:8096 is documented as slow (that's the whole reason this
// caching layer exists). 25s gives a genuinely-blocking request real room
// to respond before Vercel's own function timeout would kill it.
const UPSTREAM_TIMEOUT_MS = 25_000;

export type CacheEntry = { data: unknown; fetchedAt: number };

// L1 — see file header.
let memCache: CacheEntry | null = null;

// Best-effort de-dupe so concurrent stale requests on the SAME warm
// instance don't each independently trigger their own background refresh.
// Not shared across instances — an occasional duplicate refresh fired by
// two different instances is harmless (one wasted upstream call), so this
// only needs to be right most of the time, not always.
let refreshInFlight = false;

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
// resets) — one quick retry clears most of those without making the
// caller wait for a full cache-miss round trip twice.
async function fetchUpstreamWithRetry(): Promise<unknown> {
  try {
    return await fetchUpstream();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.warn("[JOBS_CACHE_RETRY]", isTimeout ? `upstream timed out after ${UPSTREAM_TIMEOUT_MS}ms` : message);
    return await fetchUpstream();
  }
}

// Returns whatever's cached (L1 first, then L2) without ever hitting
// upstream. Null means genuinely nothing cached anywhere yet.
export async function readCache(): Promise<CacheEntry | null> {
  if (memCache) return memCache;
  const shared = await kvGet<CacheEntry>(KV_CACHE_KEY);
  if (shared) memCache = shared;
  return shared;
}

// Fetches upstream and writes BOTH cache layers. Throws on failure — the
// caller decides what to do with a stale fallback, if it has one.
export async function refreshCache(): Promise<CacheEntry> {
  const data = await fetchUpstreamWithRetry();
  const entry: CacheEntry = { data, fetchedAt: Date.now() };
  memCache = entry;
  // kvSet never throws (see src/lib/kv.ts) — if Redis isn't configured
  // (e.g. local dev without env vars), this is a silent no-op and the
  // in-memory cache alone still works.
  await kvSet(KV_CACHE_KEY, entry);
  return entry;
}

// Fire-and-forget refresh for the stale-while-revalidate path in
// api/jobs/route.ts. Never throws past itself.
export function triggerBackgroundRefresh(): void {
  if (refreshInFlight) return;
  refreshInFlight = true;
  refreshCache()
    .catch((err) => console.error("[JOBS_CACHE_BG_REFRESH_ERR]", err))
    .finally(() => {
      refreshInFlight = false;
    });
}

// Called by the admin create/delete routes immediately after a successful
// upstream write, so the very next read — including the admin dashboard's
// own post-create/post-delete reload — sees the change instead of waiting
// out FRESH_TTL_MS/STALE_TTL_MS. Best-effort and instance-local for L1:
// clears THIS invocation's memory plus the shared Redis entry. Another
// already-warm serverless instance won't know until its own L1 naturally
// expires (at most FRESH_TTL_MS later) — an acceptable, self-healing gap,
// not a correctness issue.
export async function invalidateJobsListCache(): Promise<void> {
  memCache = null;
  await kvDelete(KV_CACHE_KEY); // never throws — see src/lib/kv.ts
}
