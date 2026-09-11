// src/lib/rateLimit.ts
//
// Naive in-memory rate limiter for the admin login endpoint.
//
// KNOWN LIMITATION: state lives in process memory. It resets on every
// redeploy/cold start and is NOT shared across multiple server instances.
// That's an acceptable tradeoff for a single low-traffic internal admin
// login (it still stops a naive brute-force script in one process), but
// it is not a substitute for a real distributed rate limiter if this ever
// needs to withstand a serious attack.

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_ATTEMPTS;
}
