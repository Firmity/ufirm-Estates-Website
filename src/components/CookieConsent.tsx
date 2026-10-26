"use client";

// Cookie-consent bar pinned to the bottom of every page (desktop and mobile).
// Collapsed: short notice + "More details" + Reject / Accept. Expanded: the
// Consent / Details / About tabs. Accept and Reject are deliberately the same
// size and weight, with nothing pre-selected (Cookie Policy clause 4.3).
//
// Choice storage and cookie handling live in src/lib/cookieConsent.ts. This
// component only decides whether to show itself:
//   - no valid stored choice  -> shown on load
//   - "Cookie settings" click -> reopened, expanded (see openCookieSettings)

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NavButton } from "@/components/ui/NavButton";
import { cn } from "@/utils/cn";
import { OPEN_SETTINGS_EVENT, readConsent, saveConsent, type ConsentChoice } from "@/lib/cookieConsent";

type TabKey = "consent" | "details" | "about";

const TABS: { key: TabKey; label: string }[] = [
  { key: "consent", label: "Consent" },
  { key: "details", label: "Details" },
  { key: "about", label: "About" },
];

// Link / active-tab colour — the site's accent blue, dark enough for text
// contrast on white (same value the Careers page uses for text links).
const ACCENT_TEXT = "text-[#146995]";

const BUTTON_SIZE = "px-8 py-3 text-base font-semibold";

function PolicyLinks() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
      <Link href="/CookiePolicyPage" className={cn("hover:underline", ACCENT_TEXT)}>
        Cookie Policy
      </Link>
      <Link href="/PrivacyPolicypage" className={cn("hover:underline", ACCENT_TEXT)}>
        Privacy Policy
      </Link>
    </div>
  );
}

function ConsentTab() {
  return (
    <div className="space-y-3">
      <p className="text-lg font-bold text-[#131720]">This website uses cookies</p>
      <p>
        Essential cookies keep this website working and do not need your consent. We use analytics and marketing
        cookies only if you accept. If you reject, only essential cookies are used and the website works as normal.
      </p>
      <p>
        Accepting enables both analytics and marketing cookies. You can change or withdraw your choice at any time
        using Cookie settings on our Privacy Policy and Cookie Policy pages.
      </p>
      <PolicyLinks />
    </div>
  );
}

function CategoryCard({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[#e2e8f0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold text-[#131720]">{title}</p>
        <span className={cn("rounded-[4px] bg-[#e8f4fa] px-3 py-1 text-sm font-semibold", ACCENT_TEXT)}>{badge}</span>
      </div>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function DetailsTab() {
  return (
    <div className="space-y-4">
      <CategoryCard title="Essential" badge="Always active">
        <p>Needed for the website to work. These do not need consent and cannot be switched off.</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>ufirm_consent: remembers your cookie choice. First-party cookie, up to 12 months.</li>
        </ul>
      </CategoryCard>
      <CategoryCard title="Analytics" badge="Only if you accept">
        <p>
          Help us understand how visitors reach and use this website, such as pages viewed, device type and traffic
          source, so we can improve it. Reports are aggregated. Names and lifetimes are in the cookie list we provide
          on request.
        </p>
      </CategoryCard>
      <CategoryCard title="Marketing" badge="Only if you accept">
        <p>
          Measure which campaigns and channels bring visitors to this website and how well our communications perform.
          Names and lifetimes are in the cookie list we provide on request.
        </p>
      </CategoryCard>
    </div>
  );
}

function AboutTab() {
  return (
    <div className="space-y-3">
      <p>
        Cookies are small text files that a website stores on your device. Similar technologies, such as browser local
        storage and session storage, work in the same way and are covered by this notice.
      </p>
      <p>
        Ufirm Technologies Private Limited, which operates the Firmity platform, is the Data Fiduciary for this website
        and acts under the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025. Our Privacy Policy
        explains how we handle personal data.
      </p>
      <p>
        Your choice is stored in a small cookie on your own device: a random identifier, your choice, the date and
        time, and the policy version. We do not keep a separate copy on our servers.
      </p>
      <p>
        You may withdraw consent at any time through Cookie settings, as easily as you gave it. For a grievance, write
        to Sanjeev Kumar, Grievance Officer and DPO, at{" "}
        <a href="mailto:dpo@ufirm.in" className={cn("hover:underline", ACCENT_TEXT)}>
          dpo@ufirm.in
        </a>
        . If it is not resolved, you may complain to the Data Protection Board of India.
      </p>
      <PolicyLinks />
    </div>
  );
}

export default function CookieConsent() {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ consent: null, details: null, about: null });

  // `ready` stays false until the cookie has been read on the client, so the
  // server-rendered HTML never shows a banner that hydration then removes.
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<TabKey>("consent");
  const [focusRequested, setFocusRequested] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
    setReady(true);

    const handleOpen = () => {
      setVisible(true);
      setExpanded(true);
      setTab("consent");
      setFocusRequested(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handleOpen);
  }, []);

  // Move focus into the bar only when the visitor reopened it themselves —
  // never steal focus on the automatic first-visit appearance.
  useEffect(() => {
    if (visible && focusRequested) {
      dialogRef.current?.focus();
      setFocusRequested(false);
    }
  }, [visible, focusRequested]);

  const choose = useCallback((choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
    setExpanded(false);
    setTab("consent");
  }, []);

  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next].key);
    tabRefs.current[TABS[next].key]?.focus();
  };

  if (!ready) return null;

  const transition = { duration: reduceMotion ? 0 : 0.25, ease: "easeOut" as const };

  const actionButtons = (
    <>
      <NavButton type="button" variant="secondary" className={cn(BUTTON_SIZE, "flex-1 lg:flex-none")} onClick={() => choose("rejected")}>
        Reject
      </NavButton>
      <NavButton type="button" variant="primary" className={cn(BUTTON_SIZE, "flex-1 lg:flex-none")} onClick={() => choose("accepted")}>
        Accept
      </NavButton>
    </>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          tabIndex={-1}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={transition}
          className="fixed inset-x-0 bottom-0 z-[80] border-t border-[#e2e8f0] bg-white text-[#475569] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] focus:outline-none"
        >
          <div className="mx-auto max-w-[1440px] px-6 py-5 sm:px-12 md:px-16 lg:px-24">
            {expanded ? (
              <div>
                <div role="tablist" aria-label="Cookie details" className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  {TABS.map((t, index) => (
                    <button
                      key={t.key}
                      ref={(el) => {
                        tabRefs.current[t.key] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`cookie-tab-${t.key}`}
                      aria-selected={tab === t.key}
                      aria-controls={`cookie-panel-${t.key}`}
                      tabIndex={tab === t.key ? 0 : -1}
                      onClick={() => setTab(t.key)}
                      onKeyDown={(e) => handleTabKeyDown(e, index)}
                      className={cn(
                        "-mb-px cursor-pointer border-b-[3px] py-3 text-sm font-semibold transition-colors duration-150 sm:py-4 sm:text-base",
                        tab === t.key
                          ? cn("border-[#146995]", ACCENT_TEXT)
                          : "border-transparent text-[#131720] hover:text-[#146995]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div
                  role="tabpanel"
                  id={`cookie-panel-${tab}`}
                  aria-labelledby={`cookie-tab-${tab}`}
                  tabIndex={0}
                  className="max-h-[38vh] overflow-y-auto py-5 pr-1 text-sm leading-relaxed sm:max-h-[42vh] sm:text-base"
                >
                  {tab === "consent" && <ConsentTab />}
                  {tab === "details" && <DetailsTab />}
                  {tab === "about" && <AboutTab />}
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-[#e2e8f0] pt-4 sm:gap-6">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-expanded
                    className={cn("flex w-full cursor-pointer items-center gap-2 text-base hover:underline lg:w-auto", ACCENT_TEXT)}
                  >
                    Hide details <ChevronDown size={18} aria-hidden="true" />
                  </button>
                  {actionButtons}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-[#131720] sm:text-xl">This website uses cookies</p>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed sm:text-base">
                    Essential cookies keep the website working. We use analytics and marketing cookies only if you
                    accept. If you reject, the website works as normal with essential cookies only.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      setExpanded(true);
                      setTab("consent");
                    }}
                    aria-expanded={false}
                    className={cn("flex w-full cursor-pointer items-center gap-2 text-base hover:underline lg:w-auto", ACCENT_TEXT)}
                  >
                    More details <ChevronUp size={18} aria-hidden="true" />
                  </button>
                  {actionButtons}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
