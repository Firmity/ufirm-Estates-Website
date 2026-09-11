// src/lib/jobAlerts.ts
//
// "Get job alerts": a visitor leaves their email and gets ONE notification
// email the moment a new job is posted — real-time, not a digest/schedule.
// Subscriber list is entirely our own data (Redis in production,
// data/job-alert-subscribers.json fallback locally — see src/lib/kv.ts).
//
// Sending reuses the same GoDaddy SMTP account as
// src/app/api/upload-resume/route.ts and src/app/api/contact/route.ts
// (EMAIL_USERNAME / EMAIL_PASSWORD — already set in this project's env).
// The transporter is pooled and capped (maxConnections/maxMessages) so a
// job post with a large subscriber list opens a handful of SMTP
// connections, not one per subscriber at once — GoDaddy (or any SMTP
// provider) will throttle or flag a burst of simultaneous connections as
// abuse otherwise. See fullstack-ai-engineering guidance: bound parallel
// I/O, never fire it unbounded.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { createHmac, timingSafeEqual } from "crypto";
import nodemailer from "nodemailer";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

const KV_KEY = "job-alert-subscribers";
const SUBSCRIBERS_PATH = join(process.cwd(), "data", "job-alert-subscribers.json");

type SubscriberList = string[]; // lowercase, deduped emails

function readLocalFile(): SubscriberList {
  try {
    if (!existsSync(SUBSCRIBERS_PATH)) return [];
    const raw = readFileSync(SUBSCRIBERS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[JOB_ALERTS_READ_ERR]", err);
    return [];
  }
}

function writeLocalFile(list: SubscriberList): void {
  mkdirSync(dirname(SUBSCRIBERS_PATH), { recursive: true });
  writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(list, null, 2), "utf-8");
}

async function readAll(): Promise<SubscriberList> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<SubscriberList>(KV_KEY);
    return Array.isArray(fromKv) ? fromKv : [];
  }
  return readLocalFile();
}

async function writeAll(list: SubscriberList): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, list);
    return;
  }
  writeLocalFile(list);
}

export async function getSubscriberCount(): Promise<number> {
  const list = await readAll();
  return list.length;
}

export async function subscribe(email: string): Promise<{ added: boolean }> {
  const normalized = email.trim().toLowerCase();
  const list = await readAll();
  if (list.includes(normalized)) return { added: false }; // already on the list
  list.push(normalized);
  await writeAll(list);
  return { added: true };
}

function getAlertsSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("[CONFIG_ERR] SESSION_SECRET is not set");
  return secret;
}

/** Signed unsubscribe token for one email — same HMAC approach as the admin
 * session cookie (see src/lib/adminAuth.ts), so an unsubscribe link can't
 * be used to remove someone else's address. */
export function getUnsubscribeToken(email: string): string {
  return createHmac("sha256", getAlertsSecret()).update(email.trim().toLowerCase()).digest("hex");
}

export async function unsubscribe(email: string, token: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  let expected: string;
  try {
    expected = getUnsubscribeToken(normalized);
  } catch {
    return false;
  }

  const tokenBuf = Buffer.from(token, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (tokenBuf.length !== expectedBuf.length || !timingSafeEqual(tokenBuf, expectedBuf)) {
    return false;
  }

  const list = await readAll();
  const next = list.filter((e) => e !== normalized);
  if (next.length === list.length) return false; // wasn't subscribed
  await writeAll(next);
  return true;
}

/** Emails every subscriber that a new job has been posted. Best-effort and
 * never throws — a flaky SMTP send must never fail job creation itself
 * (see src/app/api/admin/jobs/route.ts, which calls this AFTER the job is
 * already successfully created upstream). */
export async function notifySubscribersOfNewJob(job: {
  Title: string;
  Department: string;
  Designation: string;
  Id?: number;
}): Promise<void> {
  try {
    const subscribers = await readAll();
    if (subscribers.length === 0) return;

    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
    });

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ufirm.in").replace(/\/$/, "");
    const jobUrl = job.Id != null ? `${siteUrl}/CareersPage?job=${job.Id}` : `${siteUrl}/CareersPage`;

    const results = await Promise.allSettled(
      subscribers.map((email) => {
        const unsubUrl = `${siteUrl}/api/job-alerts/unsubscribe?email=${encodeURIComponent(
          email
        )}&token=${getUnsubscribeToken(email)}`;
        return transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: `New opening at UFirm: ${job.Title}`,
          text:
            `A new role has just been posted at UFirm:\n\n` +
            `${job.Title} — ${job.Designation} (${job.Department})\n\n` +
            `View and apply: ${jobUrl}\n\n` +
            `---\nDon't want these emails? Unsubscribe: ${unsubUrl}`,
        });
      })
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error(`[JOB_ALERT_NOTIFY_ERR] ${failed}/${subscribers.length} alert emails failed to send`);
    }

    transporter.close();
  } catch (err) {
    console.error("[JOB_ALERT_NOTIFY_ERR]", err);
  }
}
