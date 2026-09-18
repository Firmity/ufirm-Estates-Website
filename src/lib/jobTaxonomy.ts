// src/lib/jobTaxonomy.ts
//
// The predefined-but-growable Category and Skills option lists shown in
// the admin form's dropdowns (see src/components/ui/PredefinedSelect.tsx).
// Distinct from src/lib/jobExtras.ts on purpose: jobExtras.ts is PER-JOB
// data keyed by job Id; this file is a single shared, global list of
// option names used across every job. Different shape, different KV key,
// different lifecycle (this grows over time as admins add custom entries;
// jobExtras entries come and go with individual jobs) — conflating the two
// would make jobExtras.ts's per-Id map shape awkward to reuse here.
//
// Same Redis/local-file pattern as every other lib/job*.ts store.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

export type JobTaxonomy = {
  categories: string[];
  skills: string[];
};

// Seed defaults — shown the first time this app runs, before any admin has
// added a custom entry. Deliberately generic: UFirm posts everything from
// facility trades (Electrician, HVAC Technician) to corporate roles
// (Content Writer, Sales Manager), so the starting list leans broad rather
// than guessing a narrow taxonomy that would need immediate correction.
const DEFAULT_CATEGORIES = [
  "Facility Management",
  "Engineering & Maintenance",
  "Sales & Marketing",
  "Content & Communications",
  "Human Resources",
  "Finance & Accounts",
  "Operations",
  "Customer Support",
  "Design",
  "Administration",
];

const DEFAULT_SKILLS = [
  "Communication",
  "MS Office",
  "Sales",
  "Negotiation",
  "Customer Service",
  "Content Writing",
  "SEO",
  "Electrical Maintenance",
  "Plumbing",
  "HVAC",
  "Team Management",
  "Data Entry",
  "Housekeeping",
  "Facility Operations",
];

const KV_KEY = "job-taxonomy";
const TAXONOMY_PATH = join(process.cwd(), "data", "job-taxonomy.json");

function readLocalFile(): JobTaxonomy | null {
  try {
    if (!existsSync(TAXONOMY_PATH)) return null;
    const raw = readFileSync(TAXONOMY_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.categories) && Array.isArray(parsed?.skills)) {
      return { categories: parsed.categories, skills: parsed.skills };
    }
    return null;
  } catch (err) {
    console.error("[JOB_TAXONOMY_READ_ERR]", err);
    return null;
  }
}

function writeLocalFile(taxonomy: JobTaxonomy): void {
  mkdirSync(dirname(TAXONOMY_PATH), { recursive: true });
  writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2), "utf-8");
}

async function readStored(): Promise<JobTaxonomy | null> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<JobTaxonomy>(KV_KEY);
    if (fromKv && Array.isArray(fromKv.categories) && Array.isArray(fromKv.skills)) {
      return fromKv;
    }
    return null;
  }
  return readLocalFile();
}

async function writeStored(taxonomy: JobTaxonomy): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(KV_KEY, taxonomy);
    return;
  }
  writeLocalFile(taxonomy);
}

/** Current category/skill option lists — defaults on first-ever call, then
 * whatever's been stored (defaults + any custom entries admins have added). */
export async function getTaxonomy(): Promise<JobTaxonomy> {
  const stored = await readStored();
  if (stored) return stored;
  return { categories: DEFAULT_CATEGORIES, skills: DEFAULT_SKILLS };
}

function normalizeForCompare(name: string): string {
  return name.trim().toLowerCase();
}

// Case-insensitive de-dupe: "sales" typed after "Sales" already exists
// should select the existing entry, not create a near-duplicate that
// splits future filtering/reporting on job category.
async function addEntry(list: "categories" | "skills", name: string): Promise<string[]> {
  const trimmed = name.trim();
  if (!trimmed) {
    const current = await getTaxonomy();
    return current[list];
  }

  const current = await getTaxonomy();
  const exists = current[list].some((v) => normalizeForCompare(v) === normalizeForCompare(trimmed));
  if (exists) return current[list];

  const next: JobTaxonomy = {
    categories: [...current.categories],
    skills: [...current.skills],
  };
  next[list] = [...next[list], trimmed];
  await writeStored(next);
  return next[list];
}

/** Adds a custom category if it's not already present (case-insensitive
 * match against the existing list); returns the resulting full list. */
export async function addCategory(name: string): Promise<string[]> {
  return addEntry("categories", name);
}

/** Same as addCategory, for the Skills list. */
export async function addSkill(name: string): Promise<string[]> {
  return addEntry("skills", name);
}
