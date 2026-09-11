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

const EXTERNAL_JOBS_URL = "https://api.urest.in:8096/api/jobs";

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
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

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

    // Posted date and Company are set server-side, not trusted from the client.
    const payload = {
      Title: body.Title,
      Type: body.Type,
      Posted: new Date().toISOString().split("T")[0],
      Education: body.Education,
      CTC: body.CTC,
      Company: "UFirm",
      Department: body.Department,
      Designation: body.Designation,
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

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[JOB_CREATE_ERR]", err);
    return NextResponse.json({ message: "Failed to post job" }, { status: 500 });
  }
}
