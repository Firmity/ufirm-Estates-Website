// src/lib/jobDescriptions.ts
//
// WHY THIS EXISTS: api.urest.in:8096 (the external jobs API) silently drops
// the Description field on write — confirmed by the "Content Writer" job:
// it was posted with a description via the admin's rich-text editor, but
// GET /api/jobs never returns it back. Rather than depend on a third-party
// API round-tripping a field it doesn't recognize, Description is now
// entirely OUR data: written here on create/edit, merged into job listings
// at read time (see src/app/api/jobs/route.ts), and never trusted from the
// upstream response.
//
// STORAGE: Redis (via src/lib/kv.ts) in production — this app deploys to
// Vercel, whose serverless filesystem doesn't reliably persist writes
// across invocations/deploys. Falls back to a local JSON file
// (data/job-descriptions.json) when Redis isn't configured (e.g. local dev
// before the Upstash integration is provisioned), so nothing breaks before
// that's set up. See src/lib/kv.ts for the fallback rationale.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvDelete, kvGet, kvSet } from "@/lib/kv";

const KV_KEY = "job-descriptions";
const DESCRIPTIONS_PATH = join(process.cwd(), "data", "job-descriptions.json");

type DescriptionsMap = Record<string, string>;

function readLocalFile(): DescriptionsMap {
  try {
    if (!existsSync(DESCRIPTIONS_PATH)) return {};
    const raw = readFileSync(DESCRIPTIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("[JOB_DESCRIPTIONS_READ_ERR]", err);
    return {};
  }
}

function writeLocalFile(map: DescriptionsMap): void {
  mkdirSync(dirname(DESCRIPTIONS_PATH), { recursive: true });
  writeFileSync(DESCRIPTIONS_PATH, JSON.stringify(map, null, 2), "utf-8");
}

async function readAll(): Promise<DescriptionsMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<DescriptionsMap>(KV_KEY);
    return fromKv ?? {};
  }
  return readLocalFile();
}

async function writeAll(map: DescriptionsMap): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, map);
    return;
  }
  writeLocalFile(map);
}

export async function getAllDescriptions(): Promise<DescriptionsMap> {
  return readAll();
}

export async function getDescription(jobId: number | string): Promise<string | undefined> {
  const map = await readAll();
  return map[String(jobId)];
}

export async function setDescription(jobId: number | string, html: string): Promise<void> {
  const map = await readAll();
  if (html && html.trim()) {
    map[String(jobId)] = html;
  } else {
    delete map[String(jobId)]; // empty description — nothing to store
  }
  await writeAll(map);
}

export async function deleteDescription(jobId: number | string): Promise<void> {
  const map = await readAll();
  if (String(jobId) in map) {
    delete map[String(jobId)];
    await writeAll(map);
  }
}
