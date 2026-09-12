// src/lib/ctcFormat.ts
//
// Pure, client-safe CTC + pay-frequency formatting. Deliberately kept
// separate from src/lib/jobExtras.ts (which owns CtcFrequency's actual
// storage) — that file imports `fs`/`path` for its Redis/local-file
// persistence, and importing a runtime value (not just a `type`) from it
// inside a "use client" component would pull those Node-only imports into
// the browser bundle and break at build/runtime. This file has zero
// Node-only imports, so both CareersPageClient.tsx and
// AdminDashboardClient.tsx can import the function directly.

import type { CtcFrequency } from "@/lib/jobExtras";

const FREQUENCY_LABEL: Record<CtcFrequency, string> = {
  annual: "Per Annum",
  monthly: "Per Month",
};

// frequency defaults to "annual" when absent — matches the default applied
// server-side in src/app/api/jobs/route.ts's withLocalData(), so a job
// created before this feature existed (no stored frequency at all) is
// never misrepresented as monthly.
export function formatCtc(ctc: string | undefined | null, frequency: CtcFrequency | undefined): string {
  if (!ctc) return "";
  return `${ctc} · ${FREQUENCY_LABEL[frequency ?? "annual"]}`;
}
