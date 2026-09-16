"use client";

// Two related pickers for the admin job form: a single-select (Category)
// and a multi-select with removable chips (Skills), both drawing from a
// predefined-but-growable option list (see src/lib/jobTaxonomy.ts) with a
// "+" affordance to define a brand-new option inline. Built alongside
// src/components/ui/Dropdown.tsx rather than extending it — Dropdown is a
// plain single-value listbox with no concept of an "add new" row or
// multi-select chips, and bolting both onto it would have made it harder
// to reason about for its existing, simpler callers (CTC frequency,
// status filter, sort order).
//
// Persistence contract: `options` is owned by the CALLER (fetched from
// GET /api/admin/job-taxonomy once on mount — see AdminDashboardClient.tsx)
// and passed down; `onAddOption` fires when the admin confirms a genuinely
// new entry, so the caller can both update its local `options` state (so
// the new entry shows immediately) and POST it to the server so it's
// remembered for future job posts. This component never talks to the
// network itself.

import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaPlus, FaTimes } from "react-icons/fa";
import { cn } from "@/utils/cn";

const TRIGGER_CLASS =
  "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[4px] border border-[#aec2cc] bg-white text-[#131720] text-sm cursor-pointer hover:border-[#1484bc] focus:outline-none focus:ring-1 focus:ring-[#1484bc] transition-colors duration-200";

const PANEL_CLASS =
  "absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-auto bg-white border border-[#aec2cc] rounded-[4px] shadow-lg py-1";

const OPTION_CLASS_BASE =
  "w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-150";

function useClickOutside(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);
  return ref;
}

// The "+ Add new" row at the bottom of the panel — a button that morphs
// into a small text input + confirm button, shared by both pickers below.
function AddOptionRow({ onAdd, existing }: { onAdd: (name: string) => void; existing: string[] }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const commit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Case-insensitive duplicate check purely for the button's own
    // immediate feedback — src/lib/jobTaxonomy.ts does the authoritative
    // de-dupe server-side regardless.
    const isDuplicate = existing.some((v) => v.toLowerCase() === trimmed.toLowerCase());
    onAdd(isDuplicate ? existing.find((v) => v.toLowerCase() === trimmed.toLowerCase())! : trimmed);
    setText("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1484bc] font-medium cursor-pointer hover:bg-[#f0f3f5] transition-colors duration-150 border-t border-[#f0f3f5] mt-1 pt-2"
      >
        <FaPlus className="text-xs" /> Add new
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 border-t border-[#f0f3f5] mt-1 pt-2">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.stopPropagation();
            setAdding(false);
            setText("");
          }
        }}
        placeholder="Type a name..."
        className="flex-1 min-w-0 px-2 py-1 text-sm border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
      />
      <button
        type="button"
        onClick={commit}
        disabled={!text.trim()}
        className="shrink-0 px-2 py-1 text-xs font-medium rounded-[4px] bg-[#1e3143] text-white cursor-pointer hover:bg-[#1f4e7a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
      >
        Add
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single-select — Category
// ---------------------------------------------------------------------------

type PredefinedSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onAddOption: (name: string) => void;
  placeholder?: string;
  className?: string;
};

export function PredefinedSelect({
  options,
  value,
  onChange,
  onAddOption,
  placeholder = "Select...",
  className,
}: PredefinedSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={TRIGGER_CLASS}
      >
        <span className={cn("truncate", !value && "text-[#64748B]")}>{value || placeholder}</span>
        <FaChevronDown className={cn("text-xs text-[#64748B] shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox" className={PANEL_CLASS}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                OPTION_CLASS_BASE,
                opt === value ? "bg-[#EAF4FA] text-[#146995] font-medium" : "text-[#131720] hover:bg-[#f0f3f5]"
              )}
            >
              {opt}
            </button>
          ))}
          <AddOptionRow
            existing={options}
            onAdd={(name) => {
              onAddOption(name);
              onChange(name);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-select with chips — Skills
// ---------------------------------------------------------------------------

type PredefinedMultiSelectProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  onAddOption: (name: string) => void;
  placeholder?: string;
  className?: string;
};

export function PredefinedMultiSelect({
  options,
  value,
  onChange,
  onAddOption,
  placeholder = "Select skills...",
  className,
}: PredefinedMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));

  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  return (
    <div className={className}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#EAF4FA] text-[#146995] text-xs font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => toggle(skill)}
                aria-label={`Remove ${skill}`}
                className="cursor-pointer hover:text-[#0f4f70]"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} className={TRIGGER_CLASS}>
          <span className="truncate text-[#64748B]">
            {value.length > 0 ? `${value.length} skill${value.length === 1 ? "" : "s"} selected — add more` : placeholder}
          </span>
          <FaChevronDown className={cn("text-xs text-[#64748B] shrink-0 transition-transform duration-200", open && "rotate-180")} />
        </button>

        {open && (
          <div role="listbox" aria-multiselectable className={PANEL_CLASS}>
            {options.map((opt) => {
              const selected = value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggle(opt)}
                  className={cn(
                    OPTION_CLASS_BASE,
                    "flex items-center gap-2",
                    selected ? "bg-[#EAF4FA] text-[#146995] font-medium" : "text-[#131720] hover:bg-[#f0f3f5]"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-4 h-4 rounded-[3px] border shrink-0",
                      selected ? "bg-[#1484bc] border-[#1484bc]" : "border-[#aec2cc]"
                    )}
                  >
                    {selected && <span className="w-2 h-2 rounded-[1px] bg-white" />}
                  </span>
                  {opt}
                </button>
              );
            })}
            <AddOptionRow
              existing={options}
              onAdd={(name) => {
                onAddOption(name);
                if (!value.includes(name)) onChange([...value, name]);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
