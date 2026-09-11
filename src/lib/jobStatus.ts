// src/lib/jobStatus.ts
//
// Open/Closed status per job. Same story as src/lib/jobDescriptions.ts:
// api.urest.in:8096 has no concept of this at all, so it's entirely our
// own data — Redis in production, data/job-status.json as a local-dev
// fallback when Redis isn't configured (see src/lib/kv.ts). Any job with
// no stored status is treated as "open" — that's the only sane default,
// since every job that's ever been created was open by definition and
// nobody should have to explicitly mark 40 existing jobs "open" just to
// unblock this feature.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

export type JobStatus = "open" | "closed";

const KV_KEY = "job-status";
const STATUS_PATH = join(process.cwd(), "data", "job-status.json");

type StatusMap = Record<string, JobStatus>;

function readLocalFile(): StatusMap {
  try {
    if (!existsSync(STATUS_PATH)) return {};
    const raw = readFileSync(STATUS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("[JOB_STATUS_READ_ERR]", err);
    return {};
  }
}

function writeLocalFile(map: StatusMap): void {
  mkdirSync(dirname(STATUS_PATH), { recursive: true });
  writeFileSync(STATUS_PATH, JSON.stringify(map, null, 2), "utf-8");
}

async function readAll(): Promise<StatusMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<StatusMap>(KV_KEY);
    return fromKv ?? {};
  }
  return readLocalFile();
}

async function writeAll(map: StatusMap): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, map);
    return;
  }
  writeLocalFile(map);
}

export async function getAllStatuses(): Promise<StatusMap> {
  return readAll();
}

export async function getStatus(jobId: number | string): Promise<JobStatus> {
  const map = await readAll();
  return map[String(jobId)] ?? "open";
}

export async function setStatus(jobId: number | string, status: JobStatus): Promise<void> {
  const map = await readAll();
  map[String(jobId)] = status;
  await writeAll(map);
}

export async function deleteStatus(jobId: number | string): Promise<void> {
  const map = await readAll();
  if (String(jobId) in map) {
    delete map[String(jobId)];
    await writeAll(map);
  }
}
