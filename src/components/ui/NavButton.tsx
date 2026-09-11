"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type NavButtonVariant = "primary" | "secondary" | "tertiary";

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NavButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<NavButtonVariant, string> = {
  primary: "bg-[#1e3143] text-[#fafbf9] hover:bg-[#1f4e7a] hover:shadow-inner hover:shadow-[inset_0_0_0_0.2px_#1e3143] active:bg-[#1484bc] active:shadow-inner active:shadow-[inset_0_0_0_0.2px_#1e3143]",
  // Reduced inner stroke to 0.5px and added standard shadow-inner on hover as requested
  secondary: "bg-white text-[#1E3143] border-[0.5px] border-[#1E3143] shadow-[inset_0_0_0_0.5px_#1E3143] hover:bg-neutral-100 hover:shadow-inner hover:shadow-[inset_0_0_0_0.5px_#1E3143] hover:border-[#1E3143] active:bg-[#1484bc] active:text-white active:shadow-inner active:border-[#1484bc] nav-btn-secondary",
  tertiary: "bg-[#1484BC] text-white hover:bg-[#1a9cd6] active:bg-[#0d6a9d] border-2 border-[#1484BC]",
};

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-6 py-2 rounded-[4px] font-medium text-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NavButton.displayName = "NavButton";
