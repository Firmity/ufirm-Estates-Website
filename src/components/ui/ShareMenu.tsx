"use client";

// Per-job share popover: Copy Link + LinkedIn/WhatsApp/X/Email. `url` is
// expected to already be an absolute URL (see CareersPageClient's
// getJobUrl) — these platforms all need a real absolute link, a relative
// path won't work once it leaves the page.

import { useEffect, useRef, useState } from "react";
import { FaShareAlt, FaLink, FaLinkedin, FaWhatsapp, FaEnvelope, FaCheck } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { cn } from "@/utils/cn";

type ShareMenuProps = { url: string; title: string };

export function ShareMenu({ url, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[SHARE_COPY_ERR]", err);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "LinkedIn",
      icon: FaLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      icon: FaWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "X",
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Email",
      icon: FaEnvelope,
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check out this opening: ${url}`)}`,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share this job"
        title="Share this job"
        className="flex items-center justify-center w-9 h-9 rounded-[4px] border border-[#aec2cc] text-[#1e3143] cursor-pointer hover:bg-[#f0f3f5] transition-colors duration-200"
      >
        <FaShareAlt className="text-sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-48 bg-white border border-[#aec2cc] rounded-[4px] shadow-lg py-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-150",
              copied ? "text-[#146995]" : "text-[#131720] hover:bg-[#f0f3f5]"
            )}
          >
            {copied ? <FaCheck /> : <FaLink className="text-[#64748B]" />}
            {copied ? "Link copied" : "Copy Link"}
          </button>
          <div className="h-px bg-[#f0f3f5] my-1" />
          {links.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#131720] cursor-pointer hover:bg-[#f0f3f5] transition-colors duration-150"
            >
              <Icon className="text-[#64748B]" />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
