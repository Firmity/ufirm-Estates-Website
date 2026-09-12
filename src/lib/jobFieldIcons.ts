// src/lib/jobFieldIcons.ts
//
// Per-job, per-field icon selection ("Department" gets a briefcase, "Role"
// gets a graduation cap, etc.) — set by an admin in the Post/Edit Job form
// and rendered on the public Careers page. Same story as
// src/lib/jobStatus.ts and src/lib/jobDescriptions.ts: api.urest.in:8096
// has no concept of this at all, so it's entirely our own data — Redis in
// production, data/job-field-icons.json as a local-dev fallback when Redis
// isn't configured (see src/lib/kv.ts).
//
// Only these six fields are supported (the ones the admin UI exposes a
// picker for — see ICONABLE_FIELDS in src/lib/iconRegistry.tsx). A job with
// no stored icons renders with no icons at all, which is a fully valid,
// intentional state — icons are decoration, not required metadata.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

export type IconableField = "Department" | "Designation" | "Type" | "Education" | "CTC" | "Posted";

// Value is an icon KEY (see src/lib/iconRegistry.tsx's FIELD_ICON_OPTIONS),
// not a component — this module never imports React/react-icons, so it
// stays safe to import from server-only route handlers.
export type FieldIconMap = Partial<Record<IconableField, string>>;

const KV_KEY = "job-field-icons";
const FIELD_ICONS_PATH = join(process.cwd(), "data", "job-field-icons.json");

type StoreMap = Record<string, FieldIconMap>; // jobId (string) -> FieldIconMap

function readLocalFile(): StoreMap {
  try {
    if (!existsSync(FIELD_ICONS_PATH)) return {};
    const raw = readFileSync(FIELD_ICONS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("[JOB_FIELD_ICONS_READ_ERR]", err);
    return {};
  }
}

function writeLocalFile(map: StoreMap): void {
  mkdirSync(dirname(FIELD_ICONS_PATH), { recursive: true });
  writeFileSync(FIELD_ICONS_PATH, JSON.stringify(map, null, 2), "utf-8");
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

export async function getAllFieldIcons(): Promise<StoreMap> {
  return readAll();
}

export async function getFieldIcons(jobId: number | string): Promise<FieldIconMap> {
  const map = await readAll();
  return map[String(jobId)] ?? {};
}

// Merge-sets: only overwrites the keys present in `icons`, so e.g. saving a
// new Department icon doesn't wipe out a previously-chosen Designation icon.
// Pass an empty string value to clear one field's icon.
export async function setFieldIcons(jobId: number | string, icons: FieldIconMap): Promise<void> {
  const map = await readAll();
  const id = String(jobId);
  const next: FieldIconMap = { ...(map[id] ?? {}) };
  for (const [field, iconKey] of Object.entries(icons) as [IconableField, string | undefined][]) {
    if (!iconKey) {
      delete next[field];
    } else {
      next[field] = iconKey;
    }
  }
  if (Object.keys(next).length === 0) {
    delete map[id];
  } else {
    map[id] = next;
  }
  await writeAll(map);
}

export async function deleteFieldIcons(jobId: number | string): Promise<void> {
  const map = await readAll();
  if (String(jobId) in map) {
    delete map[String(jobId)];
    await writeAll(map);
  }
}
