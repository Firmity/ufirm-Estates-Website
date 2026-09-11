// src/lib/jobClicks.ts
//
// Rough click counter for shared job links. CareersPageClient's deep-link
// effect (the one that scrolls to and highlights ?job=<id>) fires a POST
// to /api/jobs/[id]/track-click on arrival — this is what that route
// increments. Redis in production, data/job-link-clicks.json fallback
// locally — same storage pattern as every other locally-owned field here
// (see src/lib/kv.ts).
//
// KNOWN LIMITATION: not deduped per visitor — no cookies/session involved,
// so the same person reloading the link counts more than once, and this
// uses the same read-modify-write pattern as jobStatus/jobDescriptions,
// which is NOT atomic under concurrent requests (two clicks landing in the
// same instant could clobber each other and undercount by one). Acceptable
// for "is anyone actually opening this link" — not a substitute for real
// analytics if that's ever needed.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

const KV_KEY = "job-link-clicks";
const CLICKS_PATH = join(process.cwd(), "data", "job-link-clicks.json");

type ClicksMap = Record<string, number>;

function readLocalFile(): ClicksMap {
  try {
    if (!existsSync(CLICKS_PATH)) return {};
    const raw = readFileSync(CLICKS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("[JOB_CLICKS_READ_ERR]", err);
    return {};
  }
}

function writeLocalFile(map: ClicksMap): void {
  mkdirSync(dirname(CLICKS_PATH), { recursive: true });
  writeFileSync(CLICKS_PATH, JSON.stringify(map, null, 2), "utf-8");
}

async function readAll(): Promise<ClicksMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<ClicksMap>(KV_KEY);
    return fromKv ?? {};
  }
  return readLocalFile();
}

async function writeAll(map: ClicksMap): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, map);
    return;
  }
  writeLocalFile(map);
}

export async function getAllClickCounts(): Promise<ClicksMap> {
  return readAll();
}

export async function recordClick(jobId: number | string): Promise<number> {
  const map = await readAll();
  const key = String(jobId);
  map[key] = (map[key] ?? 0) + 1;
  await writeAll(map);
  return map[key];
}
