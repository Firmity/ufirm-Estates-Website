export type JobInfo = {
  Id?: number;
  Title: string;
  Type: string;
  Posted: string;
  Education: string;
  CTC: string;
  Company: string;
  Department: string;
  Designation: string;
  ImageUrl?: string;
  // Optional — best-effort passthrough. The external API may or may not
  // persist/return this field; the UI treats it as optional either way.
  // See src/app/api/admin/jobs/route.ts.
  Description?: string;
  // Status and LinkClicks below don't exist upstream at all — api.urest.in
  // has never heard of either. Both are merged in server-side from our own
  // KV-backed stores (see src/lib/jobStatus.ts, src/lib/jobClicks.ts) by
  // src/app/api/jobs/route.ts, the same way Description already is.
  Status?: "open" | "closed";
  LinkClicks?: number;
  // Per-field icon selection (Department/Designation/Type) — also entirely
  // our own data, merged in the same way by src/app/api/jobs/route.ts. See
  // src/lib/jobFieldIcons.ts and src/lib/iconRegistry.tsx.
  FieldIcons?: Partial<Record<"Department" | "Designation" | "Type", string>>;
};

const BASE_URL = "https://api.urest.in:8096/api/jobs";

// Used by the OLD /CareerPage only — left exactly as it was so that page's
// server-side-filtered search keeps working unchanged. Do not repoint this
// at /api/jobs; that route ignores `search` (filtering moved client-side
// for the new /CareersPage — see getAllJobs below).
export async function getJobs(search: string = ""): Promise<JobInfo[]> {
  const res = await fetch(`${BASE_URL}?search=${encodeURIComponent(search)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch jobs: ${text}`);
  }
  const data: JobInfo[] = await res.json();
  return data;
}

// Used by the NEW /CareersPage and its admin dashboard. Fetches through our
// own cached proxy (src/app/api/jobs/route.ts) instead of the slow external
// API directly, and returns the full list — callers filter client-side.
export async function getAllJobs(): Promise<JobInfo[]> {
  const res = await fetch("/api/jobs");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch jobs: ${text}`);
  }
  const data: JobInfo[] = await res.json();
  return data;
}

export async function createJob(job: JobInfo): Promise<JobInfo> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to post job: ${text}`);
  }
  const response: { data: JobInfo } = await res.json();
  return response.data;
}

export async function deleteJob(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete job: ${text}`);
  }
}
