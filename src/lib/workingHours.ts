// src/lib/workingHours.ts
//
// Pure, client-safe helpers for the "working hours" admin form fields —
// two time inputs (start/end) each paired with its own AM/PM dropdown (see
// PredefinedSelect's sibling, the plain Dropdown component, used for the
// AM/PM choice in AdminDashboardClient.tsx). Kept separate from
// src/lib/jobExtras.ts for the same reason as src/lib/ctcFormat.ts: that
// file pulls in `fs`/`path` for its Redis/local-file persistence, and
// importing a runtime value (not just a `type`) from it inside a
// "use client" component would pull those Node-only imports into the
// browser bundle. This file has zero Node-only imports.
//
// Only the composed string (e.g. "9:00 AM - 6:00 PM") is ever persisted
// (see JobExtras.WorkingHours) — these helpers exist so the admin form can
// build that string from four structured inputs on create, and parse it
// back into those same four inputs when re-opening the edit modal, instead
// of asking an admin to hand-type a correctly-formatted range both times.

export type Period = "AM" | "PM";

export type WorkingHoursParts = {
  startTime: string; // free-text, e.g. "9:00" — validated loosely, see isValidTimeText
  startPeriod: Period;
  endTime: string;
  endPeriod: Period;
};

export const EMPTY_WORKING_HOURS_PARTS: WorkingHoursParts = {
  startTime: "",
  startPeriod: "AM",
  endTime: "",
  endPeriod: "PM",
};

// Loose on purpose — "9:00", "9", and "9:30" are all fine; this is a
// display string, not a value anything downstream parses as a real Date.
const TIME_TEXT_PATTERN = /^\d{1,2}(:\d{2})?$/;

export function isValidTimeText(value: string): boolean {
  return TIME_TEXT_PATTERN.test(value.trim());
}

/** Builds the single display string stored on the job, e.g.
 * "9:00 AM - 6:00 PM". Returns "" if either time is blank — a half-filled
 * pair isn't useful to store or display. */
export function formatWorkingHours(parts: WorkingHoursParts): string {
  const start = parts.startTime.trim();
  const end = parts.endTime.trim();
  if (!start || !end) return "";
  return `${start} ${parts.startPeriod} - ${end} ${parts.endPeriod}`;
}

const WORKING_HOURS_PATTERN = /^(\d{1,2}(?::\d{2})?)\s*(AM|PM)\s*-\s*(\d{1,2}(?::\d{2})?)\s*(AM|PM)$/i;

/** Reverses formatWorkingHours, for prefilling the edit modal from a
 * previously-saved string. Returns null for anything that doesn't match
 * the expected shape (e.g. hand-edited data, or a value from before this
 * feature existed) — callers fall back to EMPTY_WORKING_HOURS_PARTS rather
 * than guessing. */
export function parseWorkingHours(value: string | undefined | null): WorkingHoursParts | null {
  if (!value) return null;
  const match = WORKING_HOURS_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, startTime, startPeriod, endTime, endPeriod] = match;
  return {
    startTime,
    startPeriod: startPeriod.toUpperCase() as Period,
    endTime,
    endPeriod: endPeriod.toUpperCase() as Period,
  };
}
