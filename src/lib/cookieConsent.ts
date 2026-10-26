// src/lib/cookieConsent.ts
//
// Pure, client-side helpers for the cookie-consent banner (see
// src/components/CookieConsent.tsx). No React and no Node imports, so it's
// safe to import from any "use client" component.
//
// What this implements from the Cookie Policy (src/app/CookiePolicyPage):
//   - one first-party "essential" cookie, `ufirm_consent`, holding the
//     visitor's choice for up to 12 months (clause 3.1, 4.5);
//   - Accept = analytics + marketing together, Reject = essential only
//     (clause 4.3);
//   - withdrawal removes the analytics/marketing cookies we can reach on our
//     own domain (clause 6.2).
//
// Deliberately NOT implemented: any server-side record of the choice (it
// would need a database). The Cookie Policy has no such clause; the choice
// lives only in the visitor's own browser cookie. If a server-side record is
// ever added, add the matching clause back to the Cookie Policy first.
//
// Gating a future analytics/marketing script: never load it unless
// hasAnalyticsConsent() is true, and re-check on CONSENT_CHANGED_EVENT.
// (Vercel Analytics / Speed Insights in src/app/layout.tsx are cookie-less
// aggregate counters — clause 3.3 — so they deliberately don't depend on this.)

export const CONSENT_COOKIE_NAME = "ufirm_consent";

// Bump ONLY when the policy changes in a way that needs fresh consent
// (Cookie Policy clause 4.5) — every visitor is asked again when this changes.
export const CONSENT_POLICY_VERSION = "1.0";

const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_SECONDS * 1000;

export const OPEN_SETTINGS_EVENT = "ufirm:open-cookie-settings";
export const CONSENT_CHANGED_EVENT = "ufirm:consent-changed";

export type ConsentChoice = "accepted" | "rejected";

export type ConsentRecord = {
  /** Random identifier — not derived from anything about the visitor. */
  id: string;
  choice: ConsentChoice;
  /** Epoch ms when the choice was made. */
  ts: number;
  /** CONSENT_POLICY_VERSION at the time of the choice. */
  v: string;
};

// Cookies set by common analytics/marketing tools. On withdrawal we only ever
// delete cookies matching these — never "everything that isn't ours", which
// could take out an unrelated cookie.
const NON_ESSENTIAL_COOKIE_PATTERNS: RegExp[] = [
  /^_ga/,
  /^_gid$/,
  /^_gat/,
  /^_gcl_/,
  /^__utm/,
  /^_fbp$/,
  /^_fbc$/,
  /^_clck$/,
  /^_clsk$/,
  /^_hj/,
];

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    (r.choice === "accepted" || r.choice === "rejected") &&
    typeof r.ts === "number" &&
    typeof r.v === "string"
  );
}

function readRawCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

/**
 * The visitor's stored choice, or null when they haven't chosen yet or the
 * choice has lapsed (older than 12 months, or made under another policy
 * version) — in all of those cases the banner should ask again.
 */
export function readConsent(): ConsentRecord | null {
  const raw = readRawCookie(CONSENT_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (!isConsentRecord(parsed)) return null;
    if (parsed.v !== CONSENT_POLICY_VERSION) return null;
    if (Date.now() - parsed.ts > CONSENT_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    // Malformed/tampered cookie — treat as "no choice yet".
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.choice === "accepted";
}

/** Deletes known analytics/marketing cookies on this host and its parent domain. */
export function clearNonEssentialCookies(): void {
  if (!isBrowser()) return;
  const host = window.location.hostname;
  const domains = new Set<string>([host]);
  const labels = host.split(".");
  if (labels.length > 2) domains.add(labels.slice(-2).join("."));

  for (const part of document.cookie.split("; ")) {
    const name = part.split("=")[0];
    if (!NON_ESSENTIAL_COOKIE_PATTERNS.some((p) => p.test(name))) continue;
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${domain}`;
    }
  }
}

/**
 * Stores the choice (reusing the previous identifier when there is one, so a
 * change of mind is traceable to the same visitor) and announces it.
 * Reject also clears any analytics/marketing cookies we can reach.
 */
export function saveConsent(choice: ConsentChoice): ConsentRecord | null {
  if (!isBrowser()) return null;

  const previousId = readRawCookie(CONSENT_COOKIE_NAME) ? readConsent()?.id : undefined;
  const record: ConsentRecord = {
    id: previousId ?? generateId(),
    choice,
    ts: Date.now(),
    v: CONSENT_POLICY_VERSION,
  };

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(record))}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  if (choice === "rejected") clearNonEssentialCookies();

  window.dispatchEvent(new CustomEvent<ConsentRecord>(CONSENT_CHANGED_EVENT, { detail: record }));
  return record;
}

/** Reopens the banner (expanded) — wired to every "Cookie settings" control. */
export function openCookieSettings(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
