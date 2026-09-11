// src/lib/adminAuth.ts
//
// Server-side-only admin auth for the Careers admin panel (Post/Delete a Job).
// Design constraints this satisfies:
//  - No credentials in the client bundle (unlike the old CareerPage login).
//  - Password is never stored in plaintext, even in env vars (scrypt + salt).
//  - Session token is an HMAC-signed, httpOnly cookie the client JS cannot read
//    or forge; expiry is embedded in the signed payload.
//  - Uses only Node's built-in `crypto` — no new dependency, no native bindings.
//
// KNOWN LIMITATION (documented, not silently swept under the rug):
// This only gates writes made through THIS app's own API routes
// (src/app/api/admin/jobs/*). The upstream job store, api.urest.in:8096,
// has no auth of its own as far as this repo can see — anyone who already
// has that URL can still POST/DELETE directly, bypassing this login entirely.
// Closing that requires a change on the api.urest.in:8096 service itself,
// which is out of this repo's control.

import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

const SCRYPT_KEYLEN = 64;

/** Hash a plaintext password for storage. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/** Constant-time verification of a plaintext password against a stored "salt:hash" value. */
export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  let candidate: Buffer;
  let expected: Buffer;
  try {
    candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
    expected = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

// ---------------------------------------------------------------------------
// Credential storage
//
// ADMIN_USERNAME / ADMIN_PASSWORD_HASH in .env.local are only the BOOTSTRAP
// default. The moment an admin changes credentials from the dashboard
// (POST /api/admin/credentials), that write lands in Redis (production) or
// data/admin-credentials.json (local fallback — see src/lib/kv.ts) and
// becomes the source of truth from then on — env vars are never touched or
// re-read after that. getAdminCredentials() is the ONLY place that should
// be consulted for "what are the current admin credentials" — login and
// credential-change both go through it, never process.env directly.
//
// STORAGE: Redis in production (this app deploys to Vercel — its
// serverless filesystem doesn't reliably persist writes across
// invocations/deploys, so a local JSON file alone would mean logins and
// credential changes silently vanish). Falls back to
// data/admin-credentials.json when Redis isn't configured (e.g. local dev
// before the Upstash integration is provisioned).
// ---------------------------------------------------------------------------

const KV_KEY = "admin-credentials";
const CREDENTIALS_PATH = join(process.cwd(), "data", "admin-credentials.json");

export type StoredCredentials = { username: string; passwordHash: string };

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function readLocalFile(): StoredCredentials | null {
  try {
    if (!existsSync(CREDENTIALS_PATH)) return null;
    const raw = readFileSync(CREDENTIALS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (isNonEmptyString(parsed?.username) && isNonEmptyString(parsed?.passwordHash)) {
      return { username: parsed.username, passwordHash: parsed.passwordHash };
    }
    console.error("[CONFIG_ERR] data/admin-credentials.json is malformed; falling back to env");
    return null;
  } catch (err) {
    console.error("[CONFIG_ERR] Failed to read stored admin credentials:", err);
    return null;
  }
}

/** Current admin username + password hash — Redis first (production source
 * of truth), then data/admin-credentials.json, then falling back to
 * ADMIN_USERNAME/ADMIN_PASSWORD_HASH env vars (bootstrap default). */
export async function getAdminCredentials(): Promise<StoredCredentials | null> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<StoredCredentials>(KV_KEY);
    if (fromKv && isNonEmptyString(fromKv.username) && isNonEmptyString(fromKv.passwordHash)) {
      return fromKv;
    }
  } else {
    const fromFile = readLocalFile();
    if (fromFile) return fromFile;
  }

  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!username || !passwordHash) return null;
  return { username, passwordHash };
}

/** Persist new admin credentials — to Redis in production, or
 * data/admin-credentials.json as a local-dev fallback (created if missing). */
export async function setAdminCredentials(creds: StoredCredentials): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, creds);
    return;
  }
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Session cookie
// ---------------------------------------------------------------------------

export const ADMIN_SESSION_COOKIE = "ufirm_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
export const ADMIN_SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Fail loudly: an unset secret must never silently downgrade to "no signature".
    throw new Error("[CONFIG_ERR] SESSION_SECRET is not set");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

/** Build a new signed session cookie value: base64url(payload).hexSignature */
export function createSessionCookieValue(): string {
  const payload = `admin:${Date.now() + SESSION_TTL_MS}`;
  const signature = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

/** Verify a session cookie value: checks signature integrity AND expiry. */
export function verifySessionCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return false;

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return false;
  }

  let expectedSignature: string;
  try {
    expectedSignature = sign(payload);
  } catch (err) {
    console.error("[CONFIG_ERR] Session verification failed:", err);
    return false;
  }

  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  const [marker, expiryStr] = payload.split(":");
  if (marker !== "admin") return false;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return true;
}
