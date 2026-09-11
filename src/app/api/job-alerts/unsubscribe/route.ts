// src/app/api/job-alerts/unsubscribe/route.ts
//
// One-click unsubscribe from the link every alert email carries (see
// src/lib/jobAlerts.ts's notifySubscribersOfNewJob). GET, not POST — it
// needs to work from a plain link click in an email client with no JS.
// The token is an HMAC of the email itself (see getUnsubscribeToken), so
// this link can only ever remove the one address it was signed for.

import { NextRequest, NextResponse } from "next/server";
import { unsubscribe } from "@/lib/jobAlerts";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const token = req.nextUrl.searchParams.get("token") || "";

  if (!email || !token) {
    return new NextResponse("Missing email or token.", { status: 400 });
  }

  try {
    const ok = await unsubscribe(email, token);
    const html = ok
      ? `<!doctype html><html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#1e3143;">
           <h2>You're unsubscribed</h2>
           <p>${email} will no longer receive UFirm job alert emails.</p>
         </body></html>`
      : `<!doctype html><html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#1e3143;">
           <h2>Link expired or invalid</h2>
           <p>This unsubscribe link is no longer valid — you may have already been removed.</p>
         </body></html>`;

    return new NextResponse(html, {
      status: ok ? 200 : 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[JOB_ALERT_UNSUBSCRIBE_ERR]", err);
    return new NextResponse("Something went wrong.", { status: 500 });
  }
}
