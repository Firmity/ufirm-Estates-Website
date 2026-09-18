// src/lib/jobExtras.ts
//
// Grab-bag of per-job, local-only metadata that api.urest.in:8096 has no
// concept of at all: CTC pay frequency, application end date, job
// category, working days/hours, compensation structure, and required
// skills. Same Redis/local-file pattern as jobStatus.ts, jobDescriptions.ts,
// and jobFieldIcons.ts — deliberately kept as ONE file rather than split
// into one-field-per-file, since all of these are small, all get set on
// the same job at the same time (create form + edit-details modal), and
// this codebase already has several near-identical single-field KV wrapper
// files; a seventh through eleventh of the same shape would be duplication
// for its own sake, not separation of concerns. Split it out again if this
// file starts doing too much (e.g. a field that needs its own validation
// pipeline or is set from somewhere else entirely).
//
// We are NOT moving job data off api.urest.in:8096 — this is the same
// "merge our own local fields on top of the upstream record" pattern this
// app already uses everywhere. Upstream stays the source of truth for
// Title/Type/Education/CTC/Department/Designation/Posted/ImageUrl; this
// store only ever holds the fields upstream was never asked to support.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

export type CtcFrequency = "annual" | "monthly";

// Radio-button choice shown just before the CTC field in the admin form —
// see src/app/CareersPage/admin/AdminDashboardClient.tsx.
export type CompensationType = "fixed" | "fixed_incentive" | "commission";

export type JobExtras = {
  CtcFrequency?: CtcFrequency;
  // ISO yyyy-mm-dd (matches the <input type="date"> value format and
  // Posted's own "YYYY-MM-DD" shape from src/app/api/admin/jobs/route.ts).
  EndDate?: string;
  // Job category — picked from src/lib/jobTaxonomy.ts's predefined list, or
  // a custom one the admin typed in (which gets folded back into that list
  // — see the "+" flow in PredefinedSelect.tsx). Free string, not an enum,
  // so a custom category never fails validation just for being new.
  Category?: string;
  // Working days per week, 1-7. Stored as a number (not a string like
  // "5 days/week") so it stays sortable/comparable if ever needed, and
  // formatted for display only at the point of rendering.
  WorkingDays?: number;
  // Pre-formatted for display, e.g. "9:00 AM - 6:00 PM" — composed
  // client-side from four structured inputs (start/end time + AM/PM each)
  // via src/lib/workingHours.ts, then stored as one string. Same "store
  // the already-formatted value" convention as CTC itself.
  WorkingHours?: string;
  CompensationType?: CompensationType;
  // Predefined + custom, same story as Category — see
  // src/lib/jobTaxonomy.ts. Stored as an array; an empty array is treated
  // the same as "not set" (see setExtras below).
  Skills?: string[];
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
// setFieldIcons in src/lib/jobFieldIcons.ts). "Clear" conventions, kept
// consistent across every field here: an empty string clears a string
// field, an empty array clears Skills, and 0 clears WorkingDays (0 working
// days a week is meaningless anyway, so it's safe to double as the "unset"
// sentinel rather than needing a separate null/undefined distinction over
// JSON). CtcFrequency has no "clear" value — omit the key to leave it
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
  if (extras.Category !== undefined) {
    if (extras.Category) {
      next.Category = extras.Category;
    } else {
      delete next.Category;
    }
  }
  if (extras.WorkingDays !== undefined) {
    if (extras.WorkingDays) {
      next.WorkingDays = extras.WorkingDays;
    } else {
      delete next.WorkingDays;
    }
  }
  if (extras.WorkingHours !== undefined) {
    if (extras.WorkingHours) {
      next.WorkingHours = extras.WorkingHours;
    } else {
      delete next.WorkingHours;
    }
  }
  if (extras.CompensationType !== undefined) {
    next.CompensationType = extras.CompensationType;
  }
  if (extras.Skills !== undefined) {
    if (extras.Skills.length > 0) {
      next.Skills = extras.Skills;
    } else {
      delete next.Skills;
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
