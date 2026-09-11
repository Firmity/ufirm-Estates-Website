// src/app/CareerPage/page.tsx
//
// ITEM 7 (nav swap / old-page retirement): /CareersPage is now the live
// careers page (see src/app/CareersPage/page.tsx + CareersPageClient.tsx,
// and src/app/CareersPage/admin for the admin dashboard). This route is
// intentionally reduced to a redirect rather than deleted or unrouted:
//   - Next.js's underscore-prefix "private folder" convention (renaming
//     this folder to _CareerPage) would need the folder physically moved
//     on disk, which isn't possible from here this session — the device
//     shell is down (Windows mount bug, unrelated to this app).
//   - A redirect is arguably the better outcome anyway: any existing
//     bookmark/link/search-engine result pointing at /CareerPage lands the
//     visitor on the real page instead of a 404.
// The old implementation (job list, apply form, poster popup, etc.) is no
// longer imported/rendered by this route — NavBar.tsx and Hamburger.tsx's
// "Hire" links now point straight at /CareersPage, so this redirect should
// rarely even fire in practice.
//
// NOTE: src/app/CareerPage/LoginDialogContext/index.tsx is now dead code
// (superseded by src/components/LoginDialogContext.tsx, which every real
// importer — ClientLayout, NavBar, LoginDialog — uses instead). Left in
// place rather than deleted for the same disk-access reason above; nothing
// imports it anymore.

import { redirect } from "next/navigation";

export default function CareerPageRedirect() {
  redirect("/CareersPage");
}
