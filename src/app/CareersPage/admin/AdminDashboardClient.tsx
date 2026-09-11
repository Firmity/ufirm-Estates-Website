"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  FaPlus,
  FaTrash,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaKey,
  FaTimes,
  FaPaperclip,
  FaPen,
  FaRedo,
  FaBell,
} from "react-icons/fa";
import { getAllJobs, JobInfo } from "@/app/api/job";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

type JobDraft = {
  Title: string;
  Type: string;
  Education: string;
  CTC: string;
  Department: string;
  Designation: string;
  Description: string;
  ImageUrl: string;
};

const EMPTY_DRAFT: JobDraft = {
  Title: "",
  Type: "",
  Education: "",
  CTC: "",
  Department: "",
  Designation: "",
  Description: "",
  ImageUrl: "",
};

const FORM_FIELDS: { key: keyof Omit<JobDraft, "ImageUrl" | "Description">; label: string; placeholder: string }[] = [
  { key: "Title", label: "Job Title", placeholder: "e.g. Facility Executive" },
  { key: "Type", label: "Job Type", placeholder: "e.g. Full-time" },
  { key: "Education", label: "Education", placeholder: "e.g. Graduate" },
  { key: "CTC", label: "CTC", placeholder: "e.g. 3.5 - 4.5 LPA" },
  { key: "Department", label: "Department", placeholder: "e.g. Facility Management" },
  { key: "Designation", label: "Designation", placeholder: "e.g. Technician" },
];

const EMPTY_CREDENTIALS_FORM = {
  currentPassword: "",
  newUsername: "",
  newPassword: "",
  confirmNewPassword: "",
};

// Shared "wide modal that never gets clipped off-screen" shell: the overlay
// scrolls (and starts panels at the top on short/mobile viewports) instead
// of centering them past the visible area, and the panel itself caps its
// own height and scrolls internally once its content is taller than that.
const MODAL_OVERLAY_CLASS =
  "fixed inset-0 bg-black/50 flex justify-center items-start sm:items-center overflow-y-auto z-50 p-4 py-8";
const MODAL_PANEL_CLASS =
  "bg-white p-6 sm:p-8 rounded-[8px] w-full shadow-lg max-h-[90vh] overflow-y-auto";

export function AdminDashboardClient() {
  const router = useRouter();

  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT);
  const [posterFileName, setPosterFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState(EMPTY_CREDENTIALS_FORM);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [credentialsSubmitting, setCredentialsSubmitting] = useState(false);

  // Description edit — separate from the create form: this writes only to
  // our own local description store (src/lib/jobDescriptions.ts), never to
  // the upstream API, so it works even for jobs that already lost their
  // description to that API silently dropping the field.
  const [editingDescriptionFor, setEditingDescriptionFor] = useState<JobInfo | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [descriptionSubmitting, setDescriptionSubmitting] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Open/Closed toggle — writes only to our own local status store (see
  // src/lib/jobStatus.ts), same independence-from-upstream pattern as the
  // description editor above.
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  // "Get job alerts" subscriber count — read-only here; people (un)subscribe
  // themselves from the public page (see src/app/api/job-alerts/*).
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
      setLoadError(null);
    } catch (err) {
      console.error("[ADMIN_JOBS_FETCH_ERR]", err);
      setLoadError("Couldn't load jobs right now — the job listings service may be temporarily unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    fetch("/api/admin/job-alerts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === "number") setSubscriberCount(data.count);
      })
      .catch((err) => console.error("[ADMIN_JOB_ALERTS_COUNT_ERR]", err));
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.Title?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateForm = () => {
    setDraft(EMPTY_DRAFT);
    setPosterFileName("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (res.status === 401) {
        alert("Your session expired. Please log in again.");
        router.push("/CareersPage/admin/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Request failed." }));
        alert(data.message || "Request failed.");
        return;
      }

      setShowForm(false);
      setDraft(EMPTY_DRAFT);
      setPosterFileName("");
      await loadJobs();
    } catch (err) {
      console.error("[ADMIN_JOB_SUBMIT_ERR]", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (job: JobInfo) => {
    if (!job.Id) return;
    if (!confirm(`Remove "${job.Title}"? This can't be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/jobs/${job.Id}`, { method: "DELETE" });

      if (res.status === 401) {
        alert("Your session expired. Please log in again.");
        router.push("/CareersPage/admin/login");
        return;
      }

      if (!res.ok) {
        alert("Failed to delete job.");
        return;
      }

      setJobs((prev) => prev.filter((j) => j.Id !== job.Id));
    } catch (err) {
      console.error("[ADMIN_JOB_DELETE_ERR]", err);
      alert("Failed to delete job.");
    }
  };

  const openDescriptionEditor = (job: JobInfo) => {
    setEditingDescriptionFor(job);
    setDescriptionDraft(job.Description || "");
    setDescriptionError(null);
  };

  const handleDescriptionSave = async () => {
    if (!editingDescriptionFor?.Id) return;
    setDescriptionSubmitting(true);
    setDescriptionError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${editingDescriptionFor.Id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionDraft }),
      });

      if (res.status === 401) {
        alert("Your session expired. Please log in again.");
        router.push("/CareersPage/admin/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Request failed." }));
        setDescriptionError(data.message || "Failed to save description.");
        return;
      }

      setJobs((prev) =>
        prev.map((j) => (j.Id === editingDescriptionFor.Id ? { ...j, Description: descriptionDraft } : j))
      );
      setEditingDescriptionFor(null);
    } catch (err) {
      console.error("[ADMIN_JOB_DESCRIPTION_SAVE_ERR]", err);
      setDescriptionError("Something went wrong. Please try again.");
    } finally {
      setDescriptionSubmitting(false);
    }
  };

  const handleStatusToggle = async (job: JobInfo) => {
    if (!job.Id) return;
    const nextStatus: "open" | "closed" = job.Status === "closed" ? "open" : "closed";
    setStatusUpdating(job.Id);
    try {
      const res = await fetch(`/api/admin/jobs/${job.Id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.status === 401) {
        alert("Your session expired. Please log in again.");
        router.push("/CareersPage/admin/login");
        return;
      }

      if (!res.ok) {
        alert("Failed to update status.");
        return;
      }

      setJobs((prev) => prev.map((j) => (j.Id === job.Id ? { ...j, Status: nextStatus } : j)));
    } catch (err) {
      console.error("[ADMIN_JOB_STATUS_TOGGLE_ERR]", err);
      alert("Failed to update status.");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("[ADMIN_LOGOUT_ERR]", err);
    } finally {
      router.push("/CareersPage/admin/login");
    }
  };

  const openCredentialsForm = () => {
    setCredentialsForm(EMPTY_CREDENTIALS_FORM);
    setCredentialsError(null);
    setShowCredentialsForm(true);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError(null);

    const { currentPassword, newUsername, newPassword, confirmNewPassword } = credentialsForm;

    if (!newUsername.trim() && !newPassword) {
      setCredentialsError("Enter a new username and/or a new password.");
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setCredentialsError("New password and confirmation don't match.");
      return;
    }

    setCredentialsSubmitting(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json().catch(() => ({ message: "Request failed." }));

      if (res.status === 401 && data.message !== "Current password is incorrect") {
        alert("Your session expired. Please log in again.");
        router.push("/CareersPage/admin/login");
        return;
      }

      if (!res.ok) {
        setCredentialsError(data.message || "Failed to update credentials.");
        return;
      }

      setShowCredentialsForm(false);
      alert("Credentials updated. Use the new username/password next time you log in.");
    } catch (err) {
      console.error("[ADMIN_CREDENTIALS_SUBMIT_ERR]", err);
      setCredentialsError("Something went wrong. Please try again.");
    } finally {
      setCredentialsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbf9] pt-[64px]">
      {/* Header — same navy used by the site's primary buttons and nav drawer.
          Full-width padding (no max-w), matching the navbar's own container,
          so this edge lines up exactly with the logo/buttons above it. */}
      <div className="bg-[#1e3143] text-white">
        <div className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Careers Admin</h1>
            <p className="text-sm text-white/60">Manage job listings shown on the Careers page</p>
            {subscriberCount !== null && (
              <p className="flex items-center gap-1.5 text-xs text-white/50 mt-1">
                <FaBell className="text-[10px]" />
                {subscriberCount} job alert subscriber{subscriberCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/CareersPage"
              target="_blank"
              className="flex items-center gap-2 text-sm px-4 sm:px-6 py-2 rounded-[4px] border border-white/30 cursor-pointer hover:bg-white/10 transition-colors duration-200"
            >
              <FaExternalLinkAlt className="text-xs" /> <span className="hidden sm:inline">View public page</span>
              <span className="sm:hidden">Public page</span>
            </Link>
            <button
              type="button"
              onClick={openCredentialsForm}
              className="flex items-center gap-2 text-sm px-4 sm:px-6 py-2 rounded-[4px] bg-white/10 cursor-pointer hover:bg-white/20 transition-colors duration-200"
            >
              <FaKey className="text-xs" /> <span className="hidden sm:inline">Change Credentials</span>
              <span className="sm:hidden">Credentials</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm px-4 sm:px-6 py-2 rounded-[4px] bg-white/10 cursor-pointer hover:bg-white/20 transition-colors duration-200"
            >
              <FaSignOutAlt /> Log out
            </button>
          </div>
        </div>
      </div>

      {/* Body — same full-width padding pattern as the header/navbar. */}
      <div className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search jobs by title..."
            className="w-full sm:w-80 px-4 py-2 rounded-[4px] border border-[#aec2cc] bg-white text-[#131720] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 px-6 py-2 bg-[#1e3143] text-[#fafbf9] font-medium rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200"
          >
            <FaPlus /> Add New Job
          </button>
        </div>

        {loading && <p className="text-[#64748B]">Loading jobs...</p>}

        {loadError && (
          <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 rounded-[4px] bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm flex-1 min-w-[200px]">{loadError}</p>
            <button
              type="button"
              onClick={loadJobs}
              className="flex items-center gap-2 px-4 py-1.5 text-sm rounded-[4px] border border-red-300 text-red-700 cursor-pointer hover:bg-red-100 transition-colors duration-150"
            >
              <FaRedo className="text-xs" /> Retry
            </button>
          </div>
        )}

        {!loading && !loadError && filteredJobs.length === 0 && (
          <p className="text-[#64748B]">No jobs match your search.</p>
        )}

        {!loading && !loadError && filteredJobs.length > 0 && (
          <>
            {/* Desktop/tablet: table. Hidden below md — nine columns don't
                fit a phone screen usefully even with horizontal scroll. */}
            <div className="hidden md:block bg-white rounded-[8px] shadow-sm border border-[#f0f3f5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f0f3f5] text-[#1e3143] uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Poster</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Designation</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">CTC</th>
                      <th className="px-4 py-3">Education</th>
                      <th className="px-4 py-3">Posted</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f3f5]">
                    {filteredJobs.map((job, idx) => (
                      <tr key={job.Id ?? idx} className="hover:bg-[#f0f3f5] transition-colors duration-150">
                        <td className="px-4 py-3">
                          {job.ImageUrl ? (
                            <Image
                              src={job.ImageUrl}
                              alt={`${job.Title} poster`}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-[4px] object-cover"
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1e3143]">{job.Title}</td>
                        <td className="px-4 py-3 text-[#131720]">{job.Department}</td>
                        <td className="px-4 py-3 text-[#131720]">{job.Designation}</td>
                        <td className="px-4 py-3 text-[#131720]">{job.Type}</td>
                        <td className="px-4 py-3 text-[#131720]">{job.CTC}</td>
                        <td className="px-4 py-3 text-[#131720]">{job.Education}</td>
                        <td className="px-4 py-3 text-[#131720]">{job.Posted}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(job)}
                            disabled={statusUpdating === job.Id}
                            title="Click to toggle open/closed"
                            className={clsx(
                              "px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
                              job.Status === "closed"
                                ? "bg-[#FEE2E2] text-[#B91C1C] hover:bg-red-200"
                                : "bg-[#DCFCE7] text-[#15803D] hover:bg-green-200"
                            )}
                          >
                            {statusUpdating === job.Id ? "…" : job.Status === "closed" ? "Closed" : "Open"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[#131720]">{job.LinkClicks ?? 0}</td>
                        <td className="px-4 py-3">
                          {job.Description ? (
                            <span className="text-[#146995] text-xs font-medium">Added</span>
                          ) : (
                            <span className="text-[#94A3B8] text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDescriptionEditor(job)}
                              className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-[#aec2cc] text-[#1e3143] cursor-pointer hover:bg-[#f0f3f5] transition-colors duration-150"
                              title="Edit description"
                              aria-label={`Edit description for ${job.Title}`}
                            >
                              <FaPen className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(job)}
                              className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-red-200 text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-150"
                              title="Delete job"
                              aria-label={`Delete ${job.Title}`}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: stacked cards instead of squeezing a 10-column table. */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredJobs.map((job, idx) => (
                <div
                  key={job.Id ?? idx}
                  className="bg-white rounded-[8px] shadow-sm border border-[#f0f3f5] p-4"
                >
                  <div className="flex items-start gap-3">
                    {job.ImageUrl ? (
                      <Image
                        src={job.ImageUrl}
                        alt={`${job.Title} poster`}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-[4px] object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-[4px] bg-[#f0f3f5] shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1e3143] truncate">{job.Title}</p>
                      <p className="text-xs text-[#64748B] truncate">
                        {job.Department} · {job.Designation}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs">
                    <div>
                      <dt className="text-[#94A3B8]">Type</dt>
                      <dd className="text-[#131720]">{job.Type || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[#94A3B8]">CTC</dt>
                      <dd className="text-[#131720]">{job.CTC || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[#94A3B8]">Education</dt>
                      <dd className="text-[#131720]">{job.Education || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[#94A3B8]">Posted</dt>
                      <dd className="text-[#131720]">{job.Posted || "—"}</dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(job)}
                      disabled={statusUpdating === job.Id}
                      className={clsx(
                        "px-2 py-1 rounded-full font-semibold cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
                        job.Status === "closed"
                          ? "bg-[#FEE2E2] text-[#B91C1C]"
                          : "bg-[#DCFCE7] text-[#15803D]"
                      )}
                    >
                      {statusUpdating === job.Id ? "…" : job.Status === "closed" ? "Closed" : "Open"}
                    </button>
                    <span className="text-[#64748B]">
                      {job.LinkClicks ?? 0} link click{job.LinkClicks === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f3f5]">
                    {job.Description ? (
                      <span className="text-[#146995] text-xs font-medium">Description added</span>
                    ) : (
                      <span className="text-[#94A3B8] text-xs">No description</span>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDescriptionEditor(job)}
                        className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-[#aec2cc] text-[#1e3143] cursor-pointer hover:bg-[#f0f3f5] transition-colors duration-150"
                        title="Edit description"
                        aria-label={`Edit description for ${job.Title}`}
                      >
                        <FaPen className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(job)}
                        className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-red-200 text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-150"
                        title="Delete job"
                        aria-label={`Delete ${job.Title}`}
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add New Job — wide/landscape so every field is visible without
          scrolling on normal screens; on short viewports the panel caps its
          own height and scrolls internally instead of spilling past the
          edge of the screen. */}
      {showForm && (
        <div className={MODAL_OVERLAY_CLASS}>
          <div className={`${MODAL_PANEL_CLASS} max-w-3xl`}>
            <h2 className="text-xl font-bold mb-5 text-center text-[#1e3143]">Post a New Job</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FORM_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label
                      htmlFor={`job-${key}`}
                      className="block text-sm font-medium text-[#1e3143] mb-1"
                    >
                      {label}
                    </label>
                    <input
                      id={`job-${key}`}
                      type="text"
                      placeholder={placeholder}
                      value={draft[key]}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      required
                      className="w-full p-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e3143] mb-1">
                  Job Description (optional)
                </label>
                <RichTextEditor
                  value={draft.Description}
                  onChange={(html) => setDraft((prev) => ({ ...prev, Description: html }))}
                  placeholder="Role responsibilities, requirements, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e3143] mb-1">
                  Poster image (optional)
                </label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="job-poster"
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-2 border border-[#aec2cc] rounded-[4px] hover:bg-[#f0f3f5] text-[#64748B] transition-colors duration-200"
                  >
                    <FaPaperclip />
                    {posterFileName || "Choose image"}
                  </label>
                  {draft.ImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, ImageUrl: "" }));
                        setPosterFileName("");
                      }}
                      aria-label="Remove chosen image"
                      title="Remove chosen image"
                      className="shrink-0 p-2 rounded-[4px] border border-[#aec2cc] text-[#64748B] cursor-pointer hover:bg-[#f0f3f5] hover:text-[#1e3143] transition-colors duration-200"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <input
                  id="job-poster"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPosterFileName(file.name);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setDraft((prev) => ({ ...prev, ImageUrl: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {draft.ImageUrl && (
                  <Image
                    src={draft.ImageUrl}
                    alt="Poster preview"
                    width={80}
                    height={80}
                    className="rounded-[4px] object-cover mt-2"
                  />
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Posting..." : "Post Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Description — writes only to our own local description store
          (see src/lib/jobDescriptions.ts), independent of the upstream API
          and of the create form. Lets an existing job (like one that lost
          its description to the upstream API dropping the field) get one
          without deleting and recreating it. */}
      {editingDescriptionFor && (
        <div className={MODAL_OVERLAY_CLASS}>
          <div className={`${MODAL_PANEL_CLASS} max-w-2xl`}>
            <h2 className="text-xl font-bold mb-1 text-center text-[#1e3143]">Edit Description</h2>
            <p className="text-sm text-[#64748B] text-center mb-5">{editingDescriptionFor.Title}</p>
            <RichTextEditor
              value={descriptionDraft}
              onChange={setDescriptionDraft}
              placeholder="Role responsibilities, requirements, etc."
            />
            {descriptionError && (
              <p className="text-sm text-red-600 mt-3" role="alert">
                {descriptionError}
              </p>
            )}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDescriptionSave}
                disabled={descriptionSubmitting}
                className="px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {descriptionSubmitting ? "Saving..." : "Save Description"}
              </button>
              <button
                type="button"
                onClick={() => setEditingDescriptionFor(null)}
                className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Credentials */}
      {showCredentialsForm && (
        <div className={MODAL_OVERLAY_CLASS}>
          <div className={`${MODAL_PANEL_CLASS} max-w-md`}>
            <h2 className="text-xl font-bold mb-4 text-center text-[#1e3143]">Change Credentials</h2>
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label htmlFor="cred-current" className="block text-sm font-medium text-[#1e3143] mb-1">
                  Current Password
                </label>
                <input
                  id="cred-current"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentialsForm.currentPassword}
                  onChange={(e) =>
                    setCredentialsForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="w-full p-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                />
              </div>
              <div>
                <label htmlFor="cred-username" className="block text-sm font-medium text-[#1e3143] mb-1">
                  New Username <span className="text-[#64748B] font-normal">(optional)</span>
                </label>
                <input
                  id="cred-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Leave blank to keep current username"
                  value={credentialsForm.newUsername}
                  onChange={(e) =>
                    setCredentialsForm((prev) => ({ ...prev, newUsername: e.target.value }))
                  }
                  className="w-full p-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                />
              </div>
              <div>
                <label htmlFor="cred-new-password" className="block text-sm font-medium text-[#1e3143] mb-1">
                  New Password <span className="text-[#64748B] font-normal">(optional, min 8 chars)</span>
                </label>
                <input
                  id="cred-new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current password"
                  value={credentialsForm.newPassword}
                  onChange={(e) =>
                    setCredentialsForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full p-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                />
              </div>
              <div>
                <label htmlFor="cred-confirm-password" className="block text-sm font-medium text-[#1e3143] mb-1">
                  Confirm New Password
                </label>
                <input
                  id="cred-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={credentialsForm.confirmNewPassword}
                  onChange={(e) =>
                    setCredentialsForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                  }
                  className="w-full p-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
                />
              </div>

              {credentialsError && (
                <p className="text-sm text-red-600" role="alert">
                  {credentialsError}
                </p>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="submit"
                  disabled={credentialsSubmitting}
                  className="px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {credentialsSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCredentialsForm(false)}
                  className="px-6 py-2 bg-white text-[#1e3143] border-[0.5px] border-[#1e3143] rounded-[4px] cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
