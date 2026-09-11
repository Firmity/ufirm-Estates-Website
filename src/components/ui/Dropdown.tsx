"use client";

// Themed replacement for the browser's native <select>. Native selects
// render with the OS/browser's own chrome (different on every platform)
// which is why item 8 asked for this instead. No animation library — just
// a plain absolutely-positioned panel, consistent with "no fancy animations"
// elsewhere on this page.

import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { cn } from "@/utils/cn";

export type DropdownOption = { value: string; label: string };

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function Dropdown({ value, options, onChange, className, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[4px] border border-[#aec2cc] bg-white text-[#131720] text-sm cursor-pointer hover:border-[#1484bc] focus:outline-none focus:ring-1 focus:ring-[#1484bc] transition-colors duration-200"
      >
        <span className={cn("truncate", !selected && "text-[#64748B]")}>
          {selected ? selected.label : placeholder}
        </span>
        <FaChevronDown
          className={cn(
            "text-xs text-[#64748B] shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto bg-white border border-[#aec2cc] rounded-[4px] shadow-lg py-1"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-150",
                opt.value === value
                  ? "bg-[#EAF4FA] text-[#146995] font-medium"
                  : "text-[#131720] hover:bg-[#f0f3f5]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
