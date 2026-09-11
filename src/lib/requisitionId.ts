// src/lib/requisitionId.ts
//
// SAP/LinkedIn-style "Requisition ID" shown on every job posting. There is
// no such field upstream (api.urest.in:8096 has never heard of it) and no
// storage is needed either — it's a pure, deterministic scramble of the
// job's own internal Id, so the same job always gets the same requisition
// number without us persisting anything new.
//
// WHY NOT JUST SHOW THE RAW Id: an internal Id like "3" or "12" makes it
// obvious how few roles have ever been posted. Scrambling it into a
// 6-digit number that looks like a real ATS requisition number costs
// nothing and reveals nothing.

const REQ_BASE = 100000; // keeps the result a stable 6 digits: 100000–999999
const REQ_RANGE = 900000;
const REQ_MULTIPLIER = 7919; // an arbitrary prime — just needs to scatter small, sequential Ids

export function getRequisitionId(jobId: number | string | undefined): string {
  const n = typeof jobId === "number" ? jobId : parseInt(String(jobId ?? ""), 10);
  if (!Number.isFinite(n)) return "—";
  const scrambled = ((n * REQ_MULTIPLIER) % REQ_RANGE + REQ_RANGE) % REQ_RANGE;
  return String(REQ_BASE + scrambled);
}
