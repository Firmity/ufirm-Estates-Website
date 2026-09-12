// src/app/api/admin/jobs/route.ts
//
// Server-side proxy for job creation. The browser never talks to
// api.urest.in:8096 directly for writes anymore — it only talks to this
// route, which requires a valid admin session cookie first.
//
// See src/lib/adminAuth.ts for the documented limitation: this secures
// OUR front door, not the upstream API itself.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { setDescription } from "@/lib/jobDescriptions";
import { notifySubscribersOfNewJob } from "@/lib/jobAlerts";
import { setFieldIcons, type FieldIconMap } from "@/lib/jobFieldIcons";
import { setExtras, type CtcFrequency } from "@/lib/jobExtras";
import { invalidateJobsListCache } from "@/lib/jobsCache";

const EXTERNAL_JOBS_URL = "https://api.urest.in:8096/api/jobs";

// See the matching export in src/app/api/jobs/route.ts for why — same
// upstream, same risk of Vercel's function timeout killing this route
// before it can return a clean error.
export const maxDuration = 60;

// ImageUrl is stored as a base64 data URI directly on the job record (no
// blob storage/CDN in this stack) and EVERY /api/jobs GET re-fetches ALL
// jobs as one array (see src/app/api/jobs/route.ts). One oversized poster
// therefore doesn't just bloat one job — it bloats the whole listings
// payload and can push that proxy route past its upstream timeout, taking
// the entire Careers page down for every visitor. Confirmed in production:
// an AI-generated poster with an embedded C2PA provenance block exceeded
// this and made /api/jobs hang indefinitely. The admin UI already blocks
// this client-side (see MAX_POSTER_BYTES in AdminDashboardClient.tsx) —
// this is the same limit enforced server-side so a direct API call can't
// bypass it. ~1.4M base64 chars ≈ 1MB raw file, comfortably above the
// client's 700KB cap (with room for base64's ~33% overhead) so a
// legitimately-sized poster is never rejected here.
const MAX_IMAGE_URL_LENGTH = 1_400_000;

const REQUIRED_FIELDS = [
  "Title",
  "Type",
  "Education",
  "CTC",
  "Department",
  "Designation",
] as const;

type NewJobBody = {
  Title: string;
  Type: string;
  Education: string;
  CTC: string;
  Department: string;
  Designation: string;
  ImageUrl?: string;
  // Optional, best-effort — see src/app/api/job.ts's JobInfo type. The
  // external API may silently drop unknown fields; if it does, this is a
  // no-op rather than a breakage.
  Description?: string;
  // Local-only, like Description — never sent upstream (see the payload
  // object below), persisted separately via setFieldIcons() once we have
  // the upstream-assigned Id. See src/lib/jobFieldIcons.ts.
  FieldIcons?: FieldIconMap;
  // Local-only, same story as FieldIcons above — see src/lib/jobExtras.ts.
  CtcFrequency?: CtcFrequency;
  EndDate?: string; // ISO yyyy-mm-dd, from <input type="date">
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let body: Partial<NewJobBody>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    for (const field of REQUIRED_FIELDS) {
      if (!isNonEmptyString(body[field])) {
        return NextResponse.json(
          { message: `Missing or empty field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (typeof body.ImageUrl === "string" && body.ImageUrl.length > MAX_IMAGE_URL_LENGTH) {
      return NextResponse.json(
        {
          message: `Poster image is too large (${Math.round(
            body.ImageUrl.length / 1024
          )}KB encoded). Use a smaller image — an oversized poster degrades the listings API for every visitor.`,
        },
        { status: 413 }
      );
    }

    if (body.CtcFrequency !== undefined && body.CtcFrequency !== "annual" && body.CtcFrequency !== "monthly") {
      return NextResponse.json(
        { message: 'CtcFrequency must be "annual" or "monthly"' },
        { status: 400 }
      );
    }

    if (body.EndDate !== undefined && body.EndDate !== "" && !DATE_PATTERN.test(body.EndDate)) {
      return NextResponse.json(
        { message: "EndDate must be a yyyy-mm-dd date" },
        { status: 400 }
      );
    }

    // The loop above validates every REQUIRED_FIELDS key at runtime, but TS
    // can't narrow a `Partial<NewJobBody>` through a dynamic loop over an
    // array of keys — each field is still typed `string | undefined` to the
    // compiler. Assert what's already been proven true rather than
    // re-deriving it; `validatedBody` is only used for the fields the loop
    // above actually checked.
    const validatedBody = body as NewJobBody;

    // Posted date and Company are set server-side, not trusted from the client.
    const payload = {
      Title: validatedBody.Title,
      Type: validatedBody.Type,
      Posted: new Date().toISOString().split("T")[0],
      Education: validatedBody.Education,
      CTC: validatedBody.CTC,
      Company: "UFirm",
      Department: validatedBody.Department,
      Designation: validatedBody.Designation,
      ImageUrl: typeof body.ImageUrl === "string" ? body.ImageUrl : "",
      Description: typeof body.Description === "string" ? body.Description : "",
    };

    const upstream = await fetch(EXTERNAL_JOBS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[JOB_CREATE_ERR]", upstream.status, text);
      return NextResponse.json(
        { message: "Failed to post job to Urest" },
        { status: 502 }
      );
    }

    const data = await upstream.json();

    // The job list changed upstream — invalidate the shared cache (see
    // src/lib/jobsCache.ts) BEFORE the best-effort local-data saves below,
    // so even if one of those is slow or fails, the next /api/jobs read
    // (including the admin dashboard's own post-create reload) already
    // sees the new job instead of waiting out the cache TTL. Best-effort —
    // kvDelete never throws — but wrapped anyway since this must never be
    // the reason a successful job posting reports as failed.
    try {
      await invalidateJobsListCache();
    } catch (err) {
      console.error("[JOBS_CACHE_INVALIDATE_ERR]", err);
    }

    // Description is our own data (see src/lib/jobDescriptions.ts) — the
    // external API silently drops this field, so we save it locally keyed
    // by the Id it just handed back, and never rely on it echoing the
    // field in its own response. Defensive about response shape: some
    // upstream calls return { data: JobInfo }, others the JobInfo directly.
    const createdId =
      (data && typeof data === "object" && "data" in data
        ? (data as { data?: { Id?: number } }).data?.Id
        : (data as { Id?: number })?.Id) ?? undefined;

    if (createdId != null && payload.Description) {
      try {
        await setDescription(createdId, payload.Description);
      } catch (err) {
        // Don't fail job creation over the description store — log and move on.
        console.error("[JOB_DESCRIPTION_SAVE_ERR]", err);
      }
    }

    if (createdId != null && body.FieldIcons && Object.keys(body.FieldIcons).length > 0) {
      try {
        await setFieldIcons(createdId, body.FieldIcons);
      } catch (err) {
        // Same best-effort treatment as Description above — icons are
        // decoration, never worth failing a successful job posting over.
        console.error("[JOB_FIELD_ICONS_SAVE_ERR]", err);
      }
    }

    if (createdId != null && (body.CtcFrequency !== undefined || body.EndDate)) {
      try {
        await setExtras(createdId, {
          CtcFrequency: body.CtcFrequency,
          EndDate: body.EndDate,
        });
      } catch (err) {
        // Same best-effort treatment as Description/FieldIcons above.
        console.error("[JOB_EXTRAS_SAVE_ERR]", err);
      }
    }

    // Notify "Get job alerts" subscribers — best-effort (this function
    // never throws, see src/lib/jobAlerts.ts) so a flaky SMTP send can
    // never turn a successful job posting into a failed request.
    await notifySubscribersOfNewJob({
      Title: payload.Title,
      Department: payload.Department,
      Designation: payload.Designation,
      Id: createdId,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[JOB_CREATE_ERR]", err);
    return NextResponse.json({ message: "Failed to post job" }, { status: 500 });
  }
}
