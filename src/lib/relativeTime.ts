// src/lib/relativeTime.ts
//
// Tiny hand-rolled "posted X ago" humanizer. No date library (date-fns,
// dayjs, moment) is installed anywhere in this project — see package.json
// — and pulling one in for a single humanize call is more dependency than
// the job is worth. Pure function, no i18n, matches the plain English used
// everywhere else on this page.

export function formatRelativeTime(dateInput: string | undefined | null): string | null {
  if (!dateInput) return null;
  const then = new Date(dateInput).getTime();
  if (!Number.isFinite(then)) return null;

  const now = Date.now();
  let diffMs = now - then;
  if (diffMs < 0) diffMs = 0; // clock skew / future-dated Posted value — treat as "just now" rather than negative
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}
