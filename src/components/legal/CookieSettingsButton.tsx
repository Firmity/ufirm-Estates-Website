"use client";

// "Cookie settings" control for the Privacy and Cookie policy pages — the
// policies promise visitors can change or withdraw consent from there. It
// just reopens the banner (src/components/CookieConsent.tsx).

import { openCookieSettings } from "@/lib/cookieConsent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="cursor-pointer rounded-[4px] border-[0.5px] border-[#1E3143] bg-white px-4 py-2 text-sm font-medium text-[#1E3143] transition-colors duration-200 hover:bg-neutral-100 active:border-[#1484bc] active:bg-[#1484bc] active:text-white"
    >
      Cookie settings
    </button>
  );
}
