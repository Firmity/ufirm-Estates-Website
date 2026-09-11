// src/lib/kv.ts
//
// Thin key-value abstraction over Upstash Redis (provisioned via Vercel
// Marketplace → Storage → Upstash Redis, which injects
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN into the project's env
// automatically). This is the ONLY thing in this app that should import
// @upstash/redis directly — src/lib/adminAuth.ts and
// src/lib/jobDescriptions.ts both go through here.
//
// WHY: this app deploys to Vercel, whose serverless functions get a fresh,
// read-mostly filesystem per invocation — writes to a local JSON file (the
// data/ dir) are not guaranteed to persist or be visible across
// invocations/regions, and reset on every deploy. Redis is the actual
// source of truth in production.
//
// LOCAL DEV FALLBACK: if the env vars aren't set (e.g. running `next dev`
// on a machine that hasn't provisioned Redis yet), every function here
// returns null/no-ops instead of throwing, and callers fall back to a
// local JSON file (data/*.json) — same shape as before this file existed.
// That keeps local development unblocked without requiring Redis, while
// production (where the env vars ARE set) always uses Redis.
//
// Requires `@upstash/redis` — run `npm install @upstash/redis` locally
// once (this tooling can't run npm install remotely, same as the Tiptap
// packages added earlier).

import type { Redis } from "@upstash/redis";

let client: Redis | null | undefined; // undefined = not yet resolved, null = unavailable

// Vercel's Upstash Marketplace integration doesn't use one fixed pair of
// env var names — it's been seen injecting plain UPSTASH_REDIS_REST_URL/
// TOKEN, the older Vercel KV names (KV_REST_API_URL/TOKEN), AND, on some
// setups, those same suffixes prefixed with the resource's own identifier
// (e.g. SOME_PREFIX_KV_REST_API_URL). Rather than hard-code one shape and
// break when Vercel's naming differs, this checks the known plain names
// first, then falls back to scanning process.env for ANY key ending in
// _KV_REST_API_URL / _KV_REST_API_TOKEN (explicitly skipping the
// *_READ_ONLY_TOKEN variant — writes need the real token) and pairs them
// by their shared prefix.
function findPrefixedCredentials(): { url: string; token: string } | null {
  const keys = Object.keys(process.env);
  const urlKey = keys.find((k) => k.endsWith("_KV_REST_API_URL") || k === "KV_REST_API_URL");
  if (!urlKey) return null;

  const prefix = urlKey.slice(0, urlKey.length - "KV_REST_API_URL".length);
  const tokenKey = keys.find(
    (k) => k === `${prefix}KV_REST_API_TOKEN` && !k.includes("READ_ONLY")
  );
  if (!tokenKey) return null;

  const url = process.env[urlKey];
  const token = process.env[tokenKey];
  if (!url || !token) return null;
  return { url, token };
}

function getClient(): Redis | null {
  if (client !== undefined) return client;

  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    const found = findPrefixedCredentials();
    url = found?.url;
    token = found?.token;
  }

  if (!url || !token) {
    client = null;
    return client;
  }

  try {
    // Lazy require so this module doesn't hard-fail to import in
    // environments where @upstash/redis hasn't been installed yet (e.g.
    // right after pulling this change, before `npm install` has run).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis: UpstashRedis } = require("@upstash/redis") as typeof import("@upstash/redis");
    client = new UpstashRedis({ url, token });
  } catch (err) {
    console.error("[KV_INIT_ERR] @upstash/redis not installed yet — run `npm install @upstash/redis`.", err);
    client = null;
  }

  return client;
}

export function isKvConfigured(): boolean {
  return getClient() !== null;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch (err) {
    console.error("[KV_GET_ERR]", key, err);
    return null;
  }
}

export async function kvSet<T>(key: string, value: T): Promise<boolean> {
  const redis = getClient();
  if (!redis) return false;
  try {
    await redis.set(key, value);
    return true;
  } catch (err) {
    console.error("[KV_SET_ERR]", key, err);
    return false;
  }
}

export async function kvDelete(key: string): Promise<boolean> {
  const redis = getClient();
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error("[KV_DEL_ERR]", key, err);
    return false;
  }
}
