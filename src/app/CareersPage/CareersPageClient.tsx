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
} from "react-icons/fa";
import { getAllJobs, JobInfo } from "@/app/api/job";
import { Dropdown } from "@/components/ui/Dropdown";
import { ShareMenu } from "@/components/ui/ShareMenu";
import { NavButton } from "@/components/ui/NavButton";

// Fade/slide-up used everywhere on this page — one small, consistent motion,
// not a different flourish per section.
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

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
// so a visitor knows exactly what each value means without guessing. No
// icons here on purpose — a decorative icon next to a label adds noise,
// not information; the label text itself (now bold and sized ABOVE its
// value, not below it) is what carries the meaning.
type JobField = { label: string; value: string };

function getJobFields(job: JobInfo): JobField[] {
  return [
    job.Department && { label: "Department", value: job.Department },
    job.Designation && { label: "Role", value: job.Designation },
    job.Type && { label: "Employment Type", value: job.Type },
    job.Education && { label: "Education", value: job.Education },
    job.CTC && { label: "CTC", value: job.CTC },
    job.Posted && { label: "Posted", value: job.Posted },
  ].filter(Boolean) as JobField[];
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
  const [allJobs, setAllJobs] = useState<JobInfo[]>([]);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return allJobs.filter((job) => {
      const matchesDept = department === "all" || job.Department === department;
      const matchesSearch =
        !q ||
        job.Title?.toLowerCase().includes(q) ||
        job.Designation?.toLowerCase().includes(q) ||
        job.Department?.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [allJobs, search, department]);

  const handleResumeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resumeFile) return;

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

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Resume submitted successfully!");
        setShowResumeForm(false);
        setResumeName("");
        setResumeEmail("");
        setResumeMobile("");
        setResumeFile(null);
        setResumeHoneypot("");
        setAppliedJobInfo(null);
      } else {
        alert("Failed to submit resume.");
      }
    } catch (error) {
      console.error("[RESUME_SUBMIT_UI_ERR]", error);
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
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
                        "relative bg-white rounded-[8px] p-5 shadow-sm border transition-all duration-500",
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
                          room on both sides. */}
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "absolute left-2.5 top-3 bottom-3 w-1 rounded-full transition-colors duration-500",
                          isHighlighted ? "bg-[#22C55E]" : "bg-[#1e3143]"
                        )}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="text-xl font-bold text-[#1e3143]">{job.Title}</h3>
                            {job.Company && (
                              <span className="text-sm text-[#64748B]">{job.Company}</span>
                            )}
                          </div>

                          {/* Labeled fields, SAP/LinkedIn-style — every value
                              carries its own label so a visitor never has to
                              guess what a bare string like "Freelance" or
                              "Graduate" refers to. */}
                          {fields.length > 0 && (
                            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-3 pt-3 border-t border-[#f0f3f5]">
                              {fields.map((field) => (
                                <div key={field.label} className="min-w-0">
                                  <dt className={FIELD_LABEL_CLASS}>{field.label}</dt>
                                  <dd className={clsx(FIELD_VALUE_CLASS, "truncate")} title={field.value}>
                                    {field.value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
                          <div className="flex items-stretch gap-2">
                            <NavButton
                              type="button"
                              variant="primary"
                              onClick={() => {
                                setAppliedJobInfo(job);
                                setShowResumeForm(true);
                              }}
                            >
                              Apply Now
                            </NavButton>
                            <NavButton
                              type="button"
                              variant="secondary"
                              onClick={() => setViewDetailsJob(job)}
                            >
                              View details
                            </NavButton>
                          </div>
                          {mounted && (
                            <div className="flex justify-end">
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
                  <h3 className="text-xl font-bold text-[#1e3143]">{viewDetailsJob.Title}</h3>
                  {viewDetailsJob.Company && (
                    <p className="text-sm text-[#64748B] mt-0.5">{viewDetailsJob.Company}</p>
                  )}
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
                    <dt className={FIELD_LABEL_CLASS}>{field.label}</dt>
                    <dd className={FIELD_VALUE_CLASS}>{field.value}</dd>
                  </div>
                ))}
              </dl>

              {viewDetailsJob.Description ? (
                <div className="mt-5 pt-5 border-t border-[#f0f3f5]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">
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
                  onClick={() => {
                    setAppliedJobInfo(viewDetailsJob);
                    setShowResumeForm(true);
                    setViewDetailsJob(null);
                  }}
                >
                  Apply Now
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
                    className="px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                    onClick={() => {
                      setShowResumeForm(false);
                      setAppliedJobInfo(null);
                      setResumeName("");
                      setResumeEmail("");
                      setResumeMobile("");
                      setResumeFile(null);
                      setResumeHoneypot("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
