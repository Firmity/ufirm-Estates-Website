// src/lib/jobExtras.ts
//
// Small grab-bag of per-job, local-only metadata that api.urest.in:8096 has
// no concept of at all: CTC pay frequency (annual vs monthly) and an
// application end date. Same Redis/local-file pattern as jobStatus.ts,
// jobDescriptions.ts, and jobFieldIcons.ts — deliberately NOT split into
// jobCtcFrequency.ts + jobEndDate.ts, since both are small, both are set on
// the same job at the same time (create form + edit-description modal),
// and this codebase already has four near-identical single-field KV
// wrapper files; a fifth and sixth of the same shape would be duplication
// for its own sake, not separation of concerns. Split it out again if a
// third unrelated per-job local field shows up later and this file starts
// doing too much.
//
// We are NOT moving job data off api.urest.in:8096 — this is the same
// "merge our own local fields on top of the upstream record" pattern this
// app already uses everywhere. Upstream stays the source of truth for
// Title/Type/Education/CTC/Department/Designation/Posted/ImageUrl; this
// store only ever holds the handful of fields upstream was never asked to
// support.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

export type CtcFrequency = "annual" | "monthly";

export type JobExtras = {
  CtcFrequency?: CtcFrequency;
  // ISO yyyy-mm-dd (matches the <input type="date"> value format and
  // Posted's own "YYYY-MM-DD" shape from src/app/api/admin/jobs/route.ts).
  EndDate?: string;
};

const KV_KEY = "job-extras";
const EXTRAS_PATH = join(process.cwd(), "data", "job-extras.json");

type StoreMap = Record<string, JobExtras>; // jobId (string) -> JobExtras

function readLocalFile(): StoreMap {
  try {
    if (!existsSync(EXTRAS_PATH)) return {};
    const raw = readFileSync(EXTRAS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("[JOB_EXTRAS_READ_ERR]", err);
    return {};
  }
}

function writeLocalFile(map: StoreMap): void {
  mkdirSync(dirname(EXTRAS_PATH), { recursive: true });
  writeFileSync(EXTRAS_PATH, JSON.stringify(map, null, 2), "utf-8");
}

async function readAll(): Promise<StoreMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<StoreMap>(KV_KEY);
    return fromKv ?? {};
  }
  return readLocalFile();
}

async function writeAll(map: StoreMap): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, map);
    return;
  }
  writeLocalFile(map);
}

export async function getAllExtras(): Promise<StoreMap> {
  return readAll();
}

export async function getExtras(jobId: number | string): Promise<JobExtras> {
  const map = await readAll();
  return map[String(jobId)] ?? {};
}

// Merge-sets: only overwrites keys present in `extras`, so saving a new
// EndDate doesn't wipe out a previously-set CtcFrequency (same contract as
// setFieldIcons in src/lib/jobFieldIcons.ts). Pass an empty string to clear
// EndDate; CtcFrequency has no "clear" value — omit the key to leave it
// alone, or pass "annual" (the implicit default everywhere else in the UI).
export async function setExtras(jobId: number | string, extras: JobExtras): Promise<void> {
  const map = await readAll();
  const id = String(jobId);
  const next: JobExtras = { ...(map[id] ?? {}) };

  if (extras.CtcFrequency !== undefined) {
    next.CtcFrequency = extras.CtcFrequency;
  }
  if (extras.EndDate !== undefined) {
    if (extras.EndDate) {
      next.EndDate = extras.EndDate;
    } else {
      delete next.EndDate;
    }
  }

  if (Object.keys(next).length === 0) {
    delete map[id];
  } else {
    map[id] = next;
  }
  await writeAll(map);
}

export async function deleteExtras(jobId: number | string): Promise<void> {
  const map = await readAll();
  if (String(jobId) in map) {
    delete map[String(jobId)];
    await writeAll(map);
  }
}
