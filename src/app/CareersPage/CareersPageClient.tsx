"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  FaTools,
  FaUserShield,
  FaWind,
  FaBroom,
  FaUserCheck,
  FaEnvelopeOpenText,
  FaPaperclip,
  FaSearch,
  FaTimes,
  FaBell,
  FaCheck,
} from "react-icons/fa";
import { getAllJobs, JobInfo } from "@/app/api/job";
import { Dropdown } from "@/components/ui/Dropdown";
import { ShareMenu } from "@/components/ui/ShareMenu";
import { NavButton } from "@/components/ui/NavButton";
import { getRequisitionId } from "@/lib/requisitionId";
import { getFieldIcon } from "@/lib/iconRegistry";
import { formatRelativeTime } from "@/lib/relativeTime";
import { formatCtc } from "@/lib/ctcFormat";

type SortOption = "latest" | "oldest" | "open" | "closed";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "open", label: "Hiring positions" },
  { value: "closed", label: "Closed positions" },
];

// Hiring/Closed status pill — shown next to the Requisition ID on both the
// job card and the View Details modal, so a visitor sees it in the same
// place either way. Hiring reuses the same light-green/dark-green pairing
// as the admin dashboard's "open" toggle (src/app/CareersPage/admin/AdminDashboardClient.tsx)
// so the color means the same thing everywhere on the site; Closed moves
// from red to light-blue/dark-blue per the new spec — red reads as an
// error/warning, which "this role isn't taking applicants" isn't.
function JobStatusBadge({ status }: { status: JobInfo["Status"] }) {
  const isClosed = status === "closed";
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0",
        isClosed ? "bg-[#DBEAFE] text-[#1E40AF]" : "bg-[#DCFCE7] text-[#15803D]"
      )}
    >
      {isClosed ? "Closed" : "Hiring"}
    </span>
  );
}

// Fade/slide-up used everywhere on this page — one small, consistent motion,
// not a different flourish per section.
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
} as const;

// Rendering for admin-authored Description HTML (written via the Tiptap
// board in AdminDashboardClient — see RichTextEditor.tsx for the matching
// editor-side styles). Only a logged-in admin can write this field through
// our session-gated /api/admin/jobs route, so rendering it as HTML here is
// trusted content, not user input.
const JOB_DESCRIPTION_CLASS =
  "mt-3 text-sm text-[#131720] leading-relaxed " +
  "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-[#1e3143] [&_h1]:mt-2 [&_h1]:mb-1 " +
  "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#1e3143] [&_h2]:mt-2 [&_h2]:mb-1 " +
  "[&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-[#aec2cc] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#64748B] " +
  "[&_strong]:font-bold [&_em]:italic";

// Labeled key/value fields shown on every card and in the details modal —
// SAP/LinkedIn-style ("Work Area: Presales", not a bare icon next to text)
// so a visitor knows exactly what each value means without guessing. The
// label text itself (bold, sized ABOVE its value, not below it) is what
// carries the meaning — an icon, when an admin has chosen one, is purely
// supplementary (see FieldLabel below), never a replacement for the label.
//
// iconKey (optional) — set by an admin per-job in the Post Job form (see
// AdminDashboardClient.tsx + src/lib/jobFieldIcons.ts) for any of
// Department/Role/Employment Type/Education/CTC/Posted. Most jobs will have
// none set; that's a fully valid state, not a missing-data bug.
type JobField = { label: string; value: string; iconKey?: string };

function getJobFields(job: JobInfo): JobField[] {
  return [
    job.Department && { label: "Department", value: job.Department, iconKey: job.FieldIcons?.Department },
    job.Designation && { label: "Role", value: job.Designation, iconKey: job.FieldIcons?.Designation },
    job.Type && { label: "Employment Type", value: job.Type, iconKey: job.FieldIcons?.Type },
    job.Education && { label: "Education", value: job.Education, iconKey: job.FieldIcons?.Education },
    job.CTC && { label: "CTC", value: formatCtc(job.CTC, job.CtcFrequency), iconKey: job.FieldIcons?.CTC },
    job.Posted && { label: "Posted", value: job.Posted, iconKey: job.FieldIcons?.Posted },
    // No icon option for Apply By (not one of the admin's six iconable
    // fields — see src/lib/jobFieldIcons.ts) and no icon looks fine here;
    // it's a deadline, not a descriptive attribute like the others.
    job.EndDate && { label: "Apply By", value: job.EndDate },
  ].filter(Boolean) as JobField[];
}

// Renders a field's <dt> label, with its admin-chosen icon in front when one
// is set. Pulled out so the card and the View Details modal (both map over
// getJobFields()) can't render this differently from each other.
function FieldLabel({ field }: { field: JobField }) {
  const Icon = getFieldIcon(field.iconKey);
  return (
    <dt className={clsx(FIELD_LABEL_CLASS, "flex items-center gap-1.5")}>
      {Icon && <Icon className="text-[#1484bc] text-sm shrink-0" aria-hidden="true" />}
      {field.label}
    </dt>
  );
}

// Shared label/value classes for the field grid — used on both the card
// and the details modal so the two never drift apart. Label is
// deliberately LARGER and higher-contrast than its value (dark navy vs.
// slate, text-base vs. text-sm) — the label is what tells a visitor what
// they're looking at, so it should read first, not the small print.
const FIELD_LABEL_CLASS = "text-base font-bold text-[#1e3143]";
const FIELD_VALUE_CLASS = "text-sm font-normal text-[#475569]";

// Three dots that pulse in sequence (classic "typing indicator" timing) —
// used next to "Loading open positions" instead of a static "...". Pure
// CSS-driven via framer-motion, no extra dependency.
function LoadingDots() {
  return (
    <span className="inline-flex ml-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

// This page is public-facing only. All job create/delete/edit controls
// live at /CareersPage/admin (linked from the site footer's "Manage" link)
// — see AdminDashboardClient.tsx.
export function CareersPageClient() {
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [appliedJobInfo, setAppliedJobInfo] = useState<JobInfo | null>(null);

  const [resumeName, setResumeName] = useState("");
  const [resumeEmail, setResumeEmail] = useState("");
  const [resumeMobile, setResumeMobile] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // Honeypot: real users never see or fill this field. A bot filling every
  // input on the page will. Server rejects silently (200 OK, no email sent).
  const [resumeHoneypot, setResumeHoneypot] = useState("");

  // "View details" — the full-information modal for one job (all labeled
  // fields + full description), opened from a link under the job title.
  const [viewDetailsJob, setViewDetailsJob] = useState<JobInfo | null>(null);

  const [activeTab, setActiveTab] = useState<"positions" | "hire">("positions");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [allJobs, setAllJobs] = useState<JobInfo[]>([]);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);

  // "Get job alerts" — email signup; notified the moment a new job is
  // posted (src/lib/jobAlerts.ts + src/app/api/job-alerts/*). Lives in a
  // small modal now (triggered by a compact button next to "Submit resume
  // without applying"), not an inline full-width form — see showAlertModal.
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertHoneypot, setAlertHoneypot] = useState("");
  const [alertStatus, setAlertStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [alertMessage, setAlertMessage] = useState("");

  // Resume-submit confirmation — shown IN PLACE of the form inside the same
  // modal on success, instead of a browser alert() + immediate close (the
  // old behavior gave no real acknowledgment of the application).
  const [resumeSubmitStatus, setResumeSubmitStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Deep-linking: /CareersPage?job=<id> scrolls to and briefly highlights
  // that one job, so a link shared on LinkedIn/etc. lands the visitor
  // straight on it instead of the top of the full list.
  const searchParams = useSearchParams();
  const jobParam = searchParams.get("job");
  const [highlightedJobId, setHighlightedJobId] = useState<number | null>(null);

  // Gates rendering of anything that needs `window` (ShareMenu builds an
  // absolute URL from window.location.origin) until after client mount, so
  // server-rendered HTML never has to guess the origin.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const getJobUrl = (id?: number) => {
    if (!mounted || !id) return "";
    return `${window.location.origin}/CareersPage?job=${id}`;
  };

  // Smooth in-page scrolling (e.g. jumping to a job card), scoped to this
  // page only — restored on unmount rather than changed site-wide.
  useEffect(() => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = previous;
    };
  }, []);

  // Fetched ONCE per page load (through our cached /api/jobs proxy — see
  // that route for why). Search and department filtering both happen
  // client-side below, so typing in the search box never hits the network.
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const jobs = await getAllJobs();
      setAllJobs(jobs);
      setJobsError(null);
    } catch (err) {
      console.error("[JOBS_FETCH_ERR]", err);
      setJobsError("Couldn't load job listings right now — the listings service may be temporarily unavailable.");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Runs once the job list has loaded. Lands the visitor on the Open
  // Positions tab (regardless of default), clears any filters that could
  // hide the target job, scrolls to it, and highlights it briefly.
  useEffect(() => {
    if (!jobParam || jobsLoading || allJobs.length === 0) return;
    const targetId = Number(jobParam);
    if (!Number.isFinite(targetId) || !allJobs.some((j) => j.Id === targetId)) return;

    setActiveTab("positions");
    setSearch("");
    setDepartment("all");

    // Wait a tick so the Open Positions tab has actually rendered its
    // cards before we try to scroll to one.
    const t = setTimeout(() => {
      const el = document.getElementById(`job-${targetId}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedJobId(targetId);
      setTimeout(() => setHighlightedJobId(null), 1500);

      // Fire-and-forget click tracking (see src/lib/jobClicks.ts) — someone
      // actually followed a shared link to this job. Never awaited, never
      // allowed to affect the page if it fails.
      fetch(`/api/jobs/${targetId}/track-click`, { method: "POST" }).catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [jobParam, jobsLoading, allJobs]);

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(allJobs.map((j) => j.Department).filter(Boolean)));
    return [
      { value: "all", label: "All Departments" },
      ...unique.sort().map((dept) => ({ value: dept, label: dept })),
    ];
  }, [allJobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = allJobs.filter((job) => {
      const matchesDept = department === "all" || job.Department === department;
      const matchesSearch =
        !q ||
        job.Title?.toLowerCase().includes(q) ||
        job.Designation?.toLowerCase().includes(q) ||
        job.Department?.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });

    // "Open"/"Closed" act as a status filter, not just an ordering — showing
    // only closed roles sorted by "latest" wouldn't make sense any other
    // way. "Latest"/"Oldest" are pure ordering over whatever the search +
    // department filters already narrowed down to.
    if (sortBy === "open") {
      result = result.filter((job) => (job.Status ?? "open") === "open");
    } else if (sortBy === "closed") {
      result = result.filter((job) => job.Status === "closed");
    }

    const sortedAscending = sortBy === "oldest";
    return [...result].sort((a, b) => {
      const dateA = a.Posted ? new Date(a.Posted).getTime() : 0;
      const dateB = b.Posted ? new Date(b.Posted).getTime() : 0;
      return sortedAscending ? dateA - dateB : dateB - dateA;
    });
  }, [allJobs, search, department, sortBy]);

  const handleAlertSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!alertEmail.trim() || alertStatus === "submitting") return;

    setAlertStatus("submitting");
    try {
      const res = await fetch("/api/job-alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: alertEmail, website: alertHoneypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAlertStatus("success");
        setAlertMessage(data.message || "You're subscribed to job alerts.");
        setAlertEmail("");
      } else {
        setAlertStatus("error");
        setAlertMessage(data.message || "Couldn't subscribe — try again.");
      }
    } catch (err) {
      console.error("[JOB_ALERT_SUBSCRIBE_UI_ERR]", err);
      setAlertStatus("error");
      setAlertMessage("Couldn't subscribe — try again.");
    }
  };

  // Resets every piece of resume-form state, including the post-submit
  // thank-you view — shared by the modal's Close/Cancel/backdrop paths so
  // none of them can leave stale data behind for the next time it opens.
  const closeResumeForm = () => {
    setShowResumeForm(false);
    setAppliedJobInfo(null);
    setResumeName("");
    setResumeEmail("");
    setResumeMobile("");
    setResumeFile(null);
    setResumeHoneypot("");
    setResumeSubmitStatus("idle");
  };

  const handleResumeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resumeFile || resumeSubmitStatus === "submitting") return;

    const fileType = resumeFile.type;
    const fileSize = resumeFile.size;
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(fileType)) {
      alert("Please upload a valid resume file (PDF, DOC, DOCX).");
      return;
    }
    if (fileSize > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("name", resumeName);
    formData.append("email", resumeEmail);
    formData.append("mobile", resumeMobile);
    formData.append("file", resumeFile);
    formData.append("website", resumeHoneypot); // honeypot; real users leave this empty

    if (appliedJobInfo) {
      const jobDetails = `
      Job Title: ${appliedJobInfo.Title}
      Job Type: ${appliedJobInfo.Type}
      Posted On: ${appliedJobInfo.Posted}
      Education: ${appliedJobInfo.Education}
      CTC: ${appliedJobInfo.CTC}
      Company: ${appliedJobInfo.Company}
      Department: ${appliedJobInfo.Department}
      Designation: ${appliedJobInfo.Designation}
    `;
      formData.append("jobDetails", jobDetails);
    }

    setResumeSubmitStatus("submitting");
    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        // Thank-you view replaces the form INSIDE the same modal — see the
        // resumeSubmitStatus === "success" branch below — rather than a
        // browser alert() that gave no lasting confirmation.
        setResumeSubmitStatus("success");
      } else {
        setResumeSubmitStatus("idle");
        alert("Failed to submit resume.");
      }
    } catch (error) {
      console.error("[RESUME_SUBMIT_UI_ERR]", error);
      setResumeSubmitStatus("idle");
      alert("An error occurred.");
    }
  };

  return (
    <div className="bg-[#fafbf9] min-h-screen pt-[64px]">
      {/* Hero — banner image with a left-to-right gradient so the headline
          stays legible without covering the people in the photo. */}
      <div className="relative h-[36vh] sm:h-[42vh] min-h-[280px] overflow-hidden">
        <Image
          src="/Banners/careers.png"
          alt="UFirm team at work"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e3143]/95 via-[#1e3143]/60 to-[#1e3143]/10" />
        <div className="relative h-full w-full px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col justify-center">
          <motion.div {...fadeUp} className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#fafbf9] leading-tight">
              Careers at UFirm
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#fafbf9]/85 max-w-md">
              Build a meaningful career with UFirm, or hire trained, verified
              facility staff for your organization.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search / mode console — overlaps the hero's bottom edge. Full-width
          padding (no mx-auto) matching the navbar, with an inner max-width
          cap that is NOT centered — so this pins to the same left edge as
          the logo instead of drifting to the middle of the padded area. */}
      <div className="w-full px-6 sm:px-12 md:px-16 lg:px-24 -mt-8 relative z-10">
        <motion.div
          {...fadeUp}
          className="max-w-5xl bg-white rounded-[8px] shadow-lg border border-[#f0f3f5] p-3 sm:p-4"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            {(
              [
                { key: "positions", label: "Open Positions" },
                { key: "hire", label: "Hire From Us" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  "px-6 py-2 rounded-[4px] text-sm font-medium cursor-pointer transition-colors duration-200",
                  activeTab === tab.key
                    ? "bg-[#1e3143] text-[#fafbf9]"
                    : "text-[#1e3143] hover:bg-[#f0f3f5]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "positions" && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm" />
                <input
                  type="text"
                  placeholder="Search by job title or skill"
                  className="w-full pl-9 pr-3 py-2.5 rounded-[4px] border border-[#aec2cc] text-[#131720] text-sm focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dropdown
                value={department}
                onChange={setDepartment}
                options={departmentOptions}
                className="sm:w-56"
              />
              <Dropdown
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={SORT_OPTIONS}
                className="sm:w-48"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Content — same full-width-padding + non-centered max-width pattern
          as the search console above, so this left edge also lines up with
          the logo at every viewport width. */}
      <div className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-10">
        <div className="max-w-5xl">
        <AnimatePresence mode="wait">
          {activeTab === "positions" && (
            <motion.div
              key="positions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* pr-3/sm:pr-4 matches the search card's own p-3/sm:p-4
                  inner padding (see the search console above) so this
                  row's right edge — where the button group ends —
                  lines up with the search box's visible right edge
                  instead of overshooting past it. */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pr-3 sm:pr-4">
                <h2 className="text-xl font-semibold text-[#1e3143] flex items-center">
                  {jobsLoading ? (
                    <motion.span
                      className="inline-flex items-center"
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Loading open positions
                      <LoadingDots />
                    </motion.span>
                  ) : (
                    `${filteredJobs.length} open position${filteredJobs.length === 1 ? "" : "s"}`
                  )}
                </h2>
                {/* Submit resume without applying + Get job alerts sit
                    together in one group on the right, same height, same
                    row — wrapping together onto their own line on narrow
                    screens rather than each wrapping independently. */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedJobInfo(null);
                      setShowResumeForm(true);
                    }}
                    className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] text-sm font-medium cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                  >
                    Submit resume without applying
                  </button>
                  {/* Get job alerts — compact navy trigger, same height as
                      the button above (identical px-6 py-2 sizing), opens a
                      small modal instead of an inline full-width form. */}
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] text-sm font-medium cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200"
                  >
                    <FaBell className="text-xs" /> Get job alerts
                  </button>
                </div>
              </div>

              {jobsError && (
                <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 rounded-[4px] bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm flex-1 min-w-[200px]">{jobsError}</p>
                  <button
                    type="button"
                    onClick={fetchJobs}
                    className="px-4 py-1.5 text-sm rounded-[4px] border border-red-300 text-red-700 cursor-pointer hover:bg-red-100 transition-colors duration-150"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!jobsLoading && !jobsError && filteredJobs.length === 0 && (
                <p className="text-[#64748B]">No open positions match your search right now.</p>
              )}

              <div className="flex flex-col gap-4">
                {filteredJobs.map((job, idx) => {
                  const fields = getJobFields(job);

                  const isHighlighted = highlightedJobId === job.Id;

                  return (
                    <div
                      key={job.Id ?? idx}
                      id={`job-${job.Id}`}
                      className={clsx(
                        // pl-7 (vs. the p-5 default of pl-5) gives the
                        // decorative accent bar below more breathing room
                        // before the title/fields start — at p-5 alone the
                        // bar's right edge sat only ~6px from the text,
                        // which read as cramped/overlapping on mobile.
                        "group relative bg-white rounded-[8px] p-5 pl-7 shadow-sm border transition-all duration-500",
                        isHighlighted
                          ? "bg-[#EAFBF0] border-[#86EFAC] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]"
                          : "border-[#dbe3e7] hover:shadow-md hover:border-[#aec2cc]"
                      )}
                    >
                      {/* Inset accent bar — replaces the old border-l-4, which
                          ran flush to the card's left edge and clipped
                          oddly against the rounded corners (looked like a
                          separate rectangle glued on, not part of the
                          card). This one lives inside the padding, with
                          room on both sides, navy by default, and light
                          blue on card hover (unless the green scroll-to
                          highlight is active, which takes priority). */}
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "absolute left-2.5 top-3 bottom-3 w-1 rounded-full transition-colors duration-300",
                          isHighlighted ? "bg-[#22C55E]" : "bg-[#1e3143] group-hover:bg-[#60A5FA]"
                        )}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
                              <h3 className="text-xl font-bold text-[#1e3143]">{job.Title}</h3>
                              {job.Company && (
                                <span className="text-sm text-[#64748B]">{job.Company}</span>
                              )}
                            </div>
                            {/* Mobile-only Share, next to the title. On phone
                                the action row below wraps (Apply Now + View
                                details + Share don't fit one line), which
                                orphaned the icon-only Share button under the
                                other two. sm:hidden here + the matching
                                hidden sm:inline-flex on the copy in that
                                action row keeps exactly one Share button
                                visible per breakpoint. */}
                            {mounted && (
                              <div className="sm:hidden shrink-0">
                                <ShareMenu url={getJobUrl(job.Id)} title={job.Title} />
                              </div>
                            )}
                          </div>
                          {/* Requisition ID, "posted X ago", and status all
                              on one line, in that order — status comes LAST
                              now (not up by the title), and "posted X ago"
                              shares the Requisition ID's color (#64748B)
                              instead of a lighter one, so the two read as
                              one consistent metadata line. Wraps as a group
                              on narrow screens rather than each piece
                              wrapping alone. */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                            <p className="text-xs text-[#64748B]">
                              Requisition ID {getRequisitionId(job.Id)}
                            </p>
                            {formatRelativeTime(job.Posted) && (
                              <span className="text-xs text-[#64748B]">
                                · Posted {formatRelativeTime(job.Posted)}
                              </span>
                            )}
                            <JobStatusBadge status={job.Status} />
                          </div>

                          {/* Labeled fields, SAP/LinkedIn-style — every value
                              carries its own label so a visitor never has to
                              guess what a bare string like "Freelance" or
                              "Graduate" refers to. */}
                          {fields.length > 0 && (
                            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-3 pt-3 border-t border-[#f0f3f5]">
                              {fields.map((field) => (
                                <div key={field.label} className="min-w-0">
                                  <FieldLabel field={field} />
                                  <dd className={clsx(FIELD_VALUE_CLASS, "truncate")} title={field.value}>
                                    {field.value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>

                        {/* Apply Now, View details, and Share (desktop copy
                            — see the mobile one next to the title above)
                            all sit in one row, vertically centered together.
                            justify-start on mobile: this row sits BELOW the
                            content in the flex-col layout and stretches
                            full width, so justify-end alone would push it
                            flush right — out of alignment with the content
                            above it. sm:justify-end restores the original
                            right-aligned-within-the-row look once this
                            becomes a side-by-side row on larger screens. */}
                        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0">
                          <NavButton
                            type="button"
                            variant="primary"
                            disabled={job.Status === "closed"}
                            onClick={() => {
                              setAppliedJobInfo(job);
                              setShowResumeForm(true);
                            }}
                          >
                            {job.Status === "closed" ? "Closed" : "Apply Now"}
                          </NavButton>
                          <NavButton
                            type="button"
                            variant="secondary"
                            onClick={() => setViewDetailsJob(job)}
                          >
                            View details
                          </NavButton>
                          {mounted && (
                            <div className="hidden sm:inline-flex">
                              <ShareMenu url={getJobUrl(job.Id)} title={job.Title} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "hire" && (
            <motion.div
              key="hire"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-semibold text-[#1e3143] mb-2">
                Hire Trained Facility Staff
              </h2>
              <p className="text-[#64748B] mb-8">
                UFirm offers skilled, verified manpower for your technical and soft
                service needs, with flexible short- or long-term engagements across India.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div className="bg-[#f0f3f5] rounded-[8px] p-6">
                  <h3 className="font-semibold text-[#1e3143] mb-3">What We Provide</h3>
                  <ul className="text-[#131720] text-sm space-y-3">
                    <li className="flex items-center gap-2">
                      <FaUserCheck className="text-[#146995]" /> Facility Staff
                    </li>
                    <li className="flex items-center gap-2">
                      <FaTools className="text-[#146995]" /> Electricians & Plumbers
                    </li>
                    <li className="flex items-center gap-2">
                      <FaWind className="text-[#146995]" /> HVAC Technicians
                    </li>
                    <li className="flex items-center gap-2">
                      <FaBroom className="text-[#146995]" /> Housekeeping & Support Staff
                    </li>
                    <li className="flex items-center gap-2">
                      <FaUserShield className="text-[#146995]" /> Safety & Compliance Officers
                    </li>
                  </ul>
                </div>
                <div className="bg-[#f0f3f5] rounded-[8px] p-6">
                  <h3 className="font-semibold text-[#1e3143] mb-3">Why UFirm</h3>
                  <ul className="text-[#131720] text-sm space-y-3">
                    <li>Professionally trained staff</li>
                    <li>Background-verified workers</li>
                    <li>Flexible hiring — short or long term</li>
                    <li>Services available across India</li>
                    <li>Quick and easy onboarding process</li>
                  </ul>
                </div>
              </div>

              <a
                href={`mailto:crm@ufirm.in?subject=Connect with Us&body=${encodeURIComponent(
                  `Hello,\n\nPlease reach out to me,\nMy Name: \nCompany/ Society/ Organization/ Industry name: \nMobile no.: \nShort description of requirement: \nLocation: \n\nThanks`
                )}`}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] font-medium cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200"
              >
                <FaEnvelopeOpenText /> Request Staff
              </a>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* View Details — full information for one job: every labeled field
          plus the complete description, so a visitor never has to guess
          what they're looking at (see getJobFields above). */}
      <AnimatePresence>
        {viewDetailsJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-start sm:items-center overflow-y-auto z-50 p-4 py-8"
            onClick={() => setViewDetailsJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 sm:p-8 rounded-[8px] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-xl font-bold text-[#1e3143]">{viewDetailsJob.Title}</h3>
                  </div>
                  {viewDetailsJob.Company && (
                    <p className="text-sm text-[#64748B] mt-0.5">{viewDetailsJob.Company}</p>
                  )}
                  {/* Same "Requisition ID, then posted-X-ago, then status
                      last" line as the card — see the matching block in
                      the job list above. */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                    <p className="text-xs text-[#64748B]">
                      Requisition ID {getRequisitionId(viewDetailsJob.Id)}
                    </p>
                    {formatRelativeTime(viewDetailsJob.Posted) && (
                      <span className="text-xs text-[#64748B]">
                        · Posted {formatRelativeTime(viewDetailsJob.Posted)}
                      </span>
                    )}
                    <JobStatusBadge status={viewDetailsJob.Status} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewDetailsJob(null)}
                  aria-label="Close"
                  className="shrink-0 p-2 rounded-[4px] text-[#64748B] cursor-pointer hover:bg-[#f0f3f5] hover:text-[#1e3143] transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 mt-5 pt-5 border-t border-[#f0f3f5]">
                {getJobFields(viewDetailsJob).map((field) => (
                  <div key={field.label} className="min-w-0">
                    <FieldLabel field={field} />
                    <dd className={FIELD_VALUE_CLASS}>{field.value}</dd>
                  </div>
                ))}
              </dl>

              {viewDetailsJob.Description ? (
                <div className="mt-5 pt-5 border-t border-[#f0f3f5]">
                  <p className="text-lg font-bold text-[#1e3143] mb-2">
                    Full Description
                  </p>
                  <div
                    className={JOB_DESCRIPTION_CLASS}
                    dangerouslySetInnerHTML={{ __html: viewDetailsJob.Description }}
                  />
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8] mt-5 pt-5 border-t border-[#f0f3f5]">
                  No further description has been added for this role yet.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-6 pt-2">
                <NavButton
                  type="button"
                  variant="primary"
                  disabled={viewDetailsJob.Status === "closed"}
                  onClick={() => {
                    setAppliedJobInfo(viewDetailsJob);
                    setShowResumeForm(true);
                    setViewDetailsJob(null);
                  }}
                >
                  {viewDetailsJob.Status === "closed" ? "Closed" : "Apply Now"}
                </NavButton>
                <NavButton type="button" variant="secondary" onClick={() => setViewDetailsJob(null)}>
                  Close
                </NavButton>
                {mounted && <ShareMenu url={getJobUrl(viewDetailsJob.Id)} title={viewDetailsJob.Title} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Form */}
      <AnimatePresence>
        {showResumeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 sm:p-8 rounded-[8px] shadow-lg w-full max-w-sm sm:max-w-md overflow-auto max-h-[90vh]"
            >
              {resumeSubmitStatus === "success" ? (
                // Thank-you confirmation — replaces the form in place
                // instead of a browser alert() + immediate close, so the
                // applicant actually sees an acknowledgment of what they
                // just did before the modal goes away.
                <div className="text-center py-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4">
                    <FaCheck className="text-[#15803D] text-xl" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3143] mb-2">Thank you!</h3>
                  <p className="text-sm text-[#475569]">
                    {appliedJobInfo
                      ? `Your application for ${appliedJobInfo.Title} has been received. We'll be in touch if there's a match.`
                      : "Your resume has been received. We'll reach out if a role matches your profile."}
                  </p>
                  <button
                    type="button"
                    onClick={closeResumeForm}
                    className="mt-6 px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              ) : (
              <>
              <h3 className="text-xl font-bold mb-6 text-center text-[#1e3143]">
                {appliedJobInfo ? `Apply for ${appliedJobInfo.Title}` : "Submit Your Resume"}
              </h3>
              <form onSubmit={handleResumeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="resumeName" className="block text-sm font-medium text-[#1e3143] mb-1">
                    Your Name
                  </label>
                  <input
                    id="resumeName"
                    type="text"
                    className="w-full px-3 py-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="resumeEmail" className="block text-sm font-medium text-[#1e3143] mb-1">
                    Your Email
                  </label>
                  <input
                    id="resumeEmail"
                    type="email"
                    className="w-full px-3 py-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                    value={resumeEmail}
                    onChange={(e) => setResumeEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="resumeMobile" className="block text-sm font-medium text-[#1e3143] mb-1">
                    Your Mobile No.
                  </label>
                  <input
                    id="resumeMobile"
                    type="tel"
                    className="w-full px-3 py-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                    value={resumeMobile}
                    onChange={(e) => setResumeMobile(e.target.value)}
                    required
                    pattern="[\d\s+()-]{7,15}"
                    title="Enter a valid phone number"
                  />
                </div>

                {/* Honeypot: visually hidden, kept out of the tab order, never
                    labeled "leave blank" (a label would tip off smarter bots). */}
                <input
                  type="text"
                  name="website"
                  value={resumeHoneypot}
                  onChange={(e) => setResumeHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] w-px h-px overflow-hidden"
                />

                <div>
                  <label
                    htmlFor="resumeFileInput"
                    className="block text-sm font-medium text-[#1e3143] mb-1"
                  >
                    Resume
                  </label>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="resumeFileInput"
                      className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-2 border border-[#aec2cc] rounded-[4px] hover:bg-[#f0f3f5] text-[#64748B] transition-colors duration-200"
                    >
                      <FaPaperclip />
                      {resumeFile ? resumeFile.name : "Choose file (PDF, DOC, DOCX)"}
                    </label>
                    {resumeFile && (
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        aria-label="Remove chosen file"
                        title="Remove chosen file"
                        className="shrink-0 p-2 rounded-[4px] border border-[#aec2cc] text-[#64748B] cursor-pointer hover:bg-[#f0f3f5] hover:text-[#1e3143] transition-colors duration-200"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <input
                    id="resumeFileInput"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="submit"
                    disabled={resumeSubmitStatus === "submitting"}
                    className="px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resumeSubmitStatus === "submitting" ? "Sending…" : "Send"}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                    onClick={closeResumeForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Get job alerts — compact modal opened from the button next to
          "Submit resume without applying" (see the positions header
          above). Same shell pattern as the Resume Form / View Details
          modals so it doesn't introduce a new visual language. */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
            onClick={() => setShowAlertModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 sm:p-8 rounded-[8px] shadow-lg w-full max-w-sm overflow-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {alertStatus === "success" ? (
                <div className="text-center py-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4">
                    <FaCheck className="text-[#15803D] text-xl" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3143] mb-2">You&apos;re subscribed</h3>
                  <p className="text-sm text-[#475569]">{alertMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAlertModal(false);
                      setAlertStatus("idle");
                      setAlertMessage("");
                    }}
                    className="mt-6 px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <FaBell className="text-[#1484bc]" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-[#1e3143]">Get job alerts</h3>
                  </div>
                  <p className="text-sm text-[#475569] text-center mb-6">
                    We&apos;ll email you the moment a new role is posted.
                  </p>
                  <form onSubmit={handleAlertSubscribe} className="space-y-4">
                    <div>
                      <label htmlFor="alertEmail" className="block text-sm font-medium text-[#1e3143] mb-1">
                        Your Email
                      </label>
                      <input
                        id="alertEmail"
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={alertEmail}
                        onChange={(e) => {
                          setAlertEmail(e.target.value);
                          if (alertStatus !== "idle") setAlertStatus("idle");
                        }}
                        className="w-full px-3 py-2 border border-[#aec2cc] rounded-[4px] text-[#131720] text-sm focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                      />
                    </div>
                    {/* Honeypot: visually hidden, kept out of the tab order —
                        same pattern as the resume form's honeypot. */}
                    <input
                      type="text"
                      name="website"
                      value={alertHoneypot}
                      onChange={(e) => setAlertHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute -left-[9999px] w-px h-px overflow-hidden"
                    />
                    {alertStatus === "error" && (
                      <p className="text-sm text-red-600" role="alert">
                        {alertMessage}
                      </p>
                    )}
                    <div className="flex justify-between pt-2">
                      <button
                        type="submit"
                        disabled={alertStatus === "submitting"}
                        className="px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {alertStatus === "submitting" ? "Subscribing…" : "Notify me"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAlertModal(false)}
                        className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
