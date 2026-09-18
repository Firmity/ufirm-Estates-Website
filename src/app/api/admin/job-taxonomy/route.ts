// src/app/api/admin/job-taxonomy/route.ts
//
// Backs the Category and Skills pickers in the admin job form (see
// src/components/ui/PredefinedSelect.tsx and src/lib/jobTaxonomy.ts). GET
// returns the current predefined-plus-custom option lists; POST adds one
// new entry (category or skill) to whichever list, case-insensitive
// de-duped against what's already there.
//
// Session-gated like every other /api/admin/* route — the lists themselves
// aren't sensitive, but this only exists to serve the admin dashboard, so
// there's no reason to expose it unauthenticated.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/adminAuth";
import { getTaxonomy, addCategory, addSkill } from "@/lib/jobTaxonomy";
import { isRateLimited } from "@/lib/rateLimit";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const taxonomy = await getTaxonomy();
    return NextResponse.json(taxonomy, { status: 200 });
  } catch (err) {
    console.error("[JOB_TAXONOMY_GET_ERR]", err);
    return NextResponse.json({ message: "Failed to load categories/skills" }, { status: 500 });
  }
}

const MAX_NAME_LENGTH = 60;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifySessionCookieValue(session)) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(`taxonomy-add:${ip}`)) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    let body: { type?: unknown; name?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    if (body.type !== "category" && body.type !== "skill") {
      return NextResponse.json({ message: 'type must be "category" or "skill"' }, { status: 400 });
    }
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ message: "name is required" }, { status: 400 });
    }
    if (body.name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { message: `name must be ${MAX_NAME_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    const list = body.type === "category" ? await addCategory(body.name) : await addSkill(body.name);
    return NextResponse.json({ [body.type === "category" ? "categories" : "skills"]: list }, { status: 200 });
  } catch (err) {
    console.error("[JOB_TAXONOMY_POST_ERR]", err);
    return NextResponse.json({ message: "Failed to save new entry" }, { status: 500 });
  }
}
