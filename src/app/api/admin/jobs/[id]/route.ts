// src/app/api/admin/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { deleteDescription, setDescription } from "@/lib/jobDescriptions";

const EXTERNAL_JOBS_URL = "https://api.urest.in:8096/api/jobs";

// PATCH updates ONLY the Description field, and ONLY in our own local
// store (see src/lib/jobDescriptions.ts) — never touches the upstream API.
// This exists because api.urest.in:8096 has no confirmed update endpoint
// (see the NOTE at the bottom of this file), and because Description is no
// longer upstream's data to own: the external API silently drops it on
// write, so editing it here — independent of any upstream call — is both
// the workaround and, going forward, the correct owner of this field.
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

    let body: { description?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    if (typeof body.description !== "string") {
      return NextResponse.json({ message: "description must be a string" }, { status: 400 });
    }

    await setDescription(id, body.description);
    return NextResponse.json({ message: "Description updated" }, { status: 200 });
  } catch (err) {
    console.error("[JOB_DESCRIPTION_UPDATE_ERR]", err);
    return NextResponse.json({ message: "Failed to update description" }, { status: 500 });
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

    // Purge the locally-stored description so a future job that happens to
    // reuse this numeric Id doesn't inherit a stranger's text.
    try {
      await deleteDescription(id);
    } catch (err) {
      console.error("[JOB_DESCRIPTION_DELETE_ERR]", err);
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
