"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, KeyRound, FileSearch, Globe, ShieldCheck, Award } from "lucide-react";
import { cn } from "@/utils/cn";

/* ─── Config ─────────────────────────────────────────────────────── */
const portalConfig: Record<string, {
  label: string;
  externalHref: string;
  accent: string;
  accentBg: string;
}> = {
  client: {
    label: "Client Portal",
    externalHref: "https://account.ufirm.in/Account/Login",
    accent: "#1484bc",
    accentBg: "#eaf5fc",
  },
  employee: {
    label: "Employee Portal",
    externalHref: "https://admin.urest.in:8097/",
    accent: "#2e7d52",
    accentBg: "#e8f5ee",
  },
  facility: {
    label: "Facility Manager Portal",
    externalHref: "https://account.ufirm.in/Account/Login",
    accent: "#c2792a",
    accentBg: "#fdf0e0",
  },
};

const certifications = [
  { id: 1, image: "/Assets/Certification1.svg",  alt: "Certification" },
  { id: 2, image: "/Assets/Certification2.svg",  alt: "TÜV" },
  { id: 3, image: "/Assets/Certification3.svg",  alt: "ISO 9001" },
  { id: 4, image: "/Assets/Certification4.svg",  alt: "ISO 27001" },
  { id: 5, image: "/Assets/CERTIFICATION6.webp", alt: "ISO 14001" },
  { id: 6, image: "/Assets/CERTIFICATION7.webp", alt: "ISO 41001" },
];

const trustFeatures = [
  { icon: Lock,       text: "End-to-end 256-bit SSL/TLS encryption" },
  { icon: KeyRound,   text: "Multi-factor authentication ready" },
  { icon: FileSearch, text: "Regular third-party security audits" },
  { icon: Globe,      text: "GDPR & data privacy compliant" },
];

const legalLinks = [
  { label: "Privacy Policy",  href: "/PrivacyPolicypage" },
  { label: "Cookie Policy",   href: "/CookiePolicyPage" },
  { label: "Terms of Use",    href: "/TermsofUsePage" },
];

/* ─── FIX 6: background gradient tint per portal ─────────────────── */
function getLeftPanelStyle(portalKey: string): React.CSSProperties {
  const gradients: Record<string, string> = {
    // Client — original dark blue/navy (unchanged)
    client:
      "linear-gradient(135deg,rgba(13,26,42,0.94) 0%,rgba(18,35,54,0.97) 100%)",
    // Employee — deep green tint
    employee:
      "linear-gradient(135deg,rgba(8,28,16,0.93) 0%,rgba(12,42,22,0.97) 100%)",
    // Facility Manager — deep amber/orange tint
    facility:
      "linear-gradient(135deg,rgba(40,18,4,0.93) 0%,rgba(55,24,5,0.97) 100%)",
  };
  const gradient = gradients[portalKey] ?? gradients.client;
  return {
    backgroundImage: `${gradient}, url('/Assets/carousel_1.webp')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function PortalLoginPage() {
  const params    = useParams();
  const portalKey = (params?.portal as string) ?? "client";
  const portal    = portalConfig[portalKey] ?? portalConfig.client;

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [errors,       setErrors]       = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    // FIX 3: "User ID" everywhere
    if (!username.trim()) next.username = "User ID is required.";
    if (!password)        next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => { window.location.href = portal.externalHref; }, 800);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* ── Two-column body ──────────────────────────────────────── */}
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden">

        {/* ══════════════════════════════════════════════════════════
            LEFT — Trust panel
            FIX 1: UFirm Estates logo here (was Firmity)
            FIX 4: hide-scrollbar on overflow panel
            FIX 6: dynamic gradient tint per portal
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          /* FIX 4: hide scrollbar while keeping scroll functional */
          className="lg:w-[44%] flex flex-col px-8 sm:px-12 lg:px-14 pt-10 lg:pt-12 pb-8 overflow-y-auto hide-scrollbar"
          style={getLeftPanelStyle(portalKey)}
        >
          {/* Trusted Platform badge — mb-4 (matched to right panel spacing) */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-4 w-fit cursor-default">
            <Award size={11} className="text-[#1484bc]" />
            <span className="text-[9.5px] font-bold text-white/55 uppercase tracking-[0.15em]">
              Trusted Platform
            </span>
          </div>

          {/* FIX 1: UFirm Estates logo (was Firmity) — inverted to white on dark bg */}
          {/* mb-3 keeps spacing tight so h2 aligns with h1 on the right */}
          <div className="mb-3">
            <Image
              src="/Assets/ufirmlogo.svg"
              alt="UFirm Estates"
              width={96}
              height={28}
              className="object-contain brightness-0 invert opacity-75"
            />
          </div>

          {/* FIX 2: This h2 aligns with "Are you already registered?" on the right.
              Both panels share the same pt-10/pt-12 start, and the elements above
              each heading add up to roughly the same height. */}
          <h2 className="text-[1.3rem] font-bold text-white leading-snug tracking-tight mb-2">
            India;s Leading Real Estate Technology Platform
          </h2>
          <p className="text-[12.5px] text-white/50 leading-relaxed mb-7">
            UFirm powers operations for real estate businesses across India — from
            facility management to asset tracking.
          </p>

          {/* Trust features */}
          <div className="space-y-3.5 mb-7">
            {trustFeatures.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-[#1484bc]" />
                </div>
                <span className="text-[12px] text-white/65">{text}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mb-5" />

          {/* Certifications */}
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] mb-3">
            Certifications &amp; Compliance
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="relative w-[46px] h-[46px] flex-shrink-0 bg-white rounded-[6px] shadow-md"
              >
                <Image src={cert.image} alt={cert.alt} fill className="object-contain p-1.5" />
              </div>
            ))}
          </div>

          {/* SSL notice */}
          <div className="mt-auto pt-7 flex items-center gap-1.5 text-[10.5px] text-white/28">
            <ShieldCheck size={10} className="text-[#1484bc]" />
            <span>256-bit SSL/TLS · SOC 2 ready</span>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT — Login form
            FIX 1: Firmity logo here (was UFirm) — dark on white bg
            FIX 4: hide-scrollbar on overflow panel
            FIX 5: "Go back" moved to top-right of this panel
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          /* FIX 4: hide scrollbar */
          className="lg:w-[56%] flex flex-col px-8 sm:px-12 lg:px-16 pt-10 lg:pt-12 pb-8 bg-white overflow-y-auto hide-scrollbar border-b lg:border-b-0 lg:border-l border-gray-100"
        >
          {/* ── Top row: Firmity logo left | Go back right — FIX 1 + FIX 5 ── */}
          {/* mb-4 keeps the row compact so h1 aligns with h2 on the left */}
          <div className="flex items-center justify-between mb-4">
            {/* FIX 1: Firmity logo (was UFirm) — on white bg, dark/natural */}
            <Link href="/" className="cursor-pointer">
              <Image
                src="/Assets/firmitylogo.svg"
                alt="Firmity"
                width={82}
                height={28}
                className="object-contain"
                style={{ filter: "brightness(0.35)" }}   /* FIX 1: make Firmity darker so it's visible */
              />
            </Link>

            {/* FIX 5: "Go back" moved here from the bottom of the form */}
            <Link
              href="/login"
              className="text-[12.5px] font-semibold underline underline-offset-2 hover:text-[#1484bc] transition-colors cursor-pointer"
              style={{ color: "#1e3143" }}
            >
              Go back
            </Link>
          </div>

          <div className="max-w-[340px] w-full">

            {/* Portal colour badge — mb-4 for tighter alignment */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4 cursor-default"
              style={{ backgroundColor: portal.accentBg }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: portal.accent }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: portal.accent }}
              >
                {portal.label}
              </span>
            </div>

            {/* FIX 2: h1 aligned with h2 on the left panel */}
            <h1 className="text-[1.6rem] font-bold text-[#1e3143] leading-tight tracking-tight mb-1.5">
              Are you already registered?
            </h1>
            <p className="text-[13px] text-gray-500 mb-6">
              Sign in to continue to your account.
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* FIX 3: USER ID (was Username) */}
              <div className="mb-5">
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-[0.12em] mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                  }}
                  className={cn(
                    "w-full border-b-[1.5px] border-gray-300 bg-transparent py-2 text-[#1e3143] text-[14px] placeholder:text-gray-300 outline-none transition-colors duration-200 cursor-text",
                    "focus:border-[#1e3143]",
                    errors.username && "border-red-400"
                  )}
                  placeholder="Enter your user ID"
                />
                {errors.username && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.username}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-[0.12em] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={cn(
                      "w-full border-b-[1.5px] border-gray-300 bg-transparent py-2 pr-7 text-[#1e3143] text-[14px] placeholder:text-gray-300 outline-none transition-colors duration-200 cursor-text",
                      "focus:border-[#1e3143]",
                      errors.password && "border-red-400"
                    )}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="mb-6 flex justify-end">
                <a
                  href={portal.externalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#1e3143] underline underline-offset-2 hover:text-[#1484bc] transition-colors cursor-pointer font-medium"
                >
                  Forgot your password?
                </a>
              </div>

              {/* Log in button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white text-[13.5px] font-bold rounded-[4px] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: portal.accent }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : "Log in"}
              </button>
            </form>

            {/* SSL micro-notice */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
              <Lock size={10} />
              <span>Secured with 256-bit SSL/TLS encryption</span>
            </div>

            {/* FIX 5: "Go back" link REMOVED from here — it's now at the top right */}
          </div>
        </motion.div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-8 sm:px-12 py-3.5 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck size={10} className="text-[#1484bc]" />
            <span>Secured by 256-bit SSL</span>
            <span className="text-gray-300 mx-1">·</span>
            <span>© 2026 Firmity. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}