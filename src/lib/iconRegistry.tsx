// src/lib/iconRegistry.tsx
//
// Fixed palette of selectable icons for the admin's per-field icon picker
// (Department / Role / Employment Type — see src/lib/jobFieldIcons.ts for
// where the selection is stored). Deliberately a closed, curated set, not
// "any icon" — an open-ended icon search is a UI project of its own, and a
// small curated set is what admins editing a job form actually want to
// scan quickly.
//
// Uses react-icons/fa exclusively (already the only icon set used
// elsewhere on this page and in the admin dashboard — see
// CareersPageClient.tsx and AdminDashboardClient.tsx's own imports).
// lucide-react and @tabler/icons-react are installed dependencies but are
// NOT used anywhere in the careers surface today; introducing a second
// icon library here would mean two different visual weights/styles mixed
// on one page for no benefit.
"use client";

import type { IconType } from "react-icons";
import {
  FaBook,
  FaClock,
  FaBriefcase,
  FaGraduationCap,
  FaBuilding,
  FaUserTie,
  FaTools,
  FaLaptopCode,
  FaHeartbeat,
  FaShieldAlt,
  FaHandshake,
  FaChartLine,
  FaHeadset,
  FaTruck,
} from "react-icons/fa";
import type { IconableField } from "@/lib/jobFieldIcons";

export type FieldIconOption = { key: string; label: string; Icon: IconType };

export const FIELD_ICON_OPTIONS: FieldIconOption[] = [
  { key: "book", label: "Books", Icon: FaBook },
  { key: "clock", label: "Clock", Icon: FaClock },
  { key: "briefcase", label: "Briefcase", Icon: FaBriefcase },
  { key: "graduation-cap", label: "Graduation Cap", Icon: FaGraduationCap },
  { key: "building", label: "Building", Icon: FaBuilding },
  { key: "user-tie", label: "Person", Icon: FaUserTie },
  { key: "tools", label: "Tools", Icon: FaTools },
  { key: "laptop", label: "Laptop", Icon: FaLaptopCode },
  { key: "heartbeat", label: "Health", Icon: FaHeartbeat },
  { key: "shield", label: "Shield", Icon: FaShieldAlt },
  { key: "handshake", label: "Handshake", Icon: FaHandshake },
  { key: "chart", label: "Chart", Icon: FaChartLine },
  { key: "headset", label: "Support", Icon: FaHeadset },
  { key: "truck", label: "Logistics", Icon: FaTruck },
];

export function getFieldIcon(key: string | undefined | null): IconType | null {
  if (!key) return null;
  return FIELD_ICON_OPTIONS.find((o) => o.key === key)?.Icon ?? null;
}

// The only job fields the picker applies to — kept here (not just in
// jobFieldIcons.ts) so the admin form and this registry can't drift apart
// on which fields are "iconable".
export const ICONABLE_FIELDS: { key: IconableField; label: string }[] = [
  { key: "Department", label: "Department" },
  { key: "Designation", label: "Role" },
  { key: "Type", label: "Employment Type" },
];
