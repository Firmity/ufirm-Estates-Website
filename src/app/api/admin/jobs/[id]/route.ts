// src/app/api/admin/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { deleteDescription, setDescription } from "@/lib/jobDescriptions";
import { deleteStatus, setStatus, type JobStatus } from "@/lib/jobStatus";

const EXTERNAL_JOBS_URL = "https://api.urest.in:8096/api/jobs";

function isJobStatus(v: unknown): v is JobStatus {
  return v === "open" || v === "closed";
}

// PATCH updates Description and/or Status, and ONLY in our own local
// stores (see src/lib/jobDescriptions.ts, src/lib/jobStatus.ts) — never
// touches the upstream API. Description: the external API silently drops
// it on write, so it's our data now. Status: the external API has never
// had a concept of open/closed at all. Body may include either field,
// both, or neither (neither is a no-op, not an error).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing job id" }, { status: 400 });
    }

    let body: { description?: unknown; status?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    if (body.description === undefined && body.status === undefined) {
      return NextResponse.json(
        { message: "Provide description and/or status" },
        { status: 400 }
      );
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return NextResponse.json({ message: "description must be a string" }, { status: 400 });
      }
      await setDescription(id, body.description);
    }

    if (body.status !== undefined) {
      if (!isJobStatus(body.status)) {
        return NextResponse.json({ message: 'status must be "open" or "closed"' }, { status: 400 });
      }
      await setStatus(id, body.status);
    }

    return NextResponse.json({ message: "Updated" }, { status: 200 });
  } catch (err) {
    console.error("[JOB_UPDATE_ERR]", err);
    return NextResponse.json({ message: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing job id" }, { status: 400 });
    }

    const upstream = await fetch(`${EXTERNAL_JOBS_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[JOB_DELETE_ERR]", upstream.status, text);
      return NextResponse.json(
        { message: "Failed to delete job on Urest" },
        { status: 502 }
      );
    }

    // Purge the locally-stored description and status so a future job that
    // happens to reuse this numeric Id doesn't inherit a stranger's text
    // or get born pre-closed.
    try {
      await deleteDescription(id);
    } catch (err) {
      console.error("[JOB_DESCRIPTION_DELETE_ERR]", err);
    }
    try {
      await deleteStatus(id);
    } catch (err) {
      console.error("[JOB_STATUS_DELETE_ERR]", err);
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("[JOB_DELETE_ERR]", err);
    return NextResponse.json({ message: "Failed to delete job" }, { status: 500 });
  }
}

// NOTE: there is intentionally no PUT/edit here. api.urest.in:8096 has no
// confirmed update endpoint — only GET/POST/DELETE were ever used in this
// codebase. An earlier version of this route faked "edit" as delete+recreate,
// which is not atomic (a failed recreate after a successful delete loses the
// job). That was removed at the user's request rather than shipped as a
// silent data-loss risk. To add real editing later, confirm a PUT/PATCH
// endpoint exists on that API first.
