import { Suspense } from "react";
import { CareersPageClient } from "./CareersPageClient";

export const metadata = {
  title: "Careers | UFirm Estates",
  description:
    "Explore open positions at UFirm, or request trained, verified facility staff for your organization.",
};

// This page is now public-only — job management links live in the site
// footer's "Manage" link (see src/components/Footer.tsx), not here, so
// there's no longer any need to check the admin session cookie on this
// route (see the removed isAdmin-gated blocks that used to be in
// CareersPageClient.tsx).
//
// Suspense is required here because CareersPageClient reads the ?job=
// deep-link param via next/navigation's useSearchParams() — Next.js
// requires that hook's nearest client boundary to be wrapped in Suspense.
export default function CareersPage() {
  return (
    <Suspense fallback={null}>
      <CareersPageClient />
    </Suspense>
  );
}
