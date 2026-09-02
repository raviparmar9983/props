"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "neutral" | "soft" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-accent-button hover:bg-accent-dark",
  neutral:
    "bg-slate-900 text-white hover:bg-slate-700",
  soft:
    "bg-accent-soft text-accent-dark hover:bg-accent-soft/70",
  outline:
    "border border-slate-200 bg-surface text-slate-900 hover:border-accent/40 hover:text-accent",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-danger text-white shadow-[0_4px_14px_rgba(226,55,68,0.3)] hover:bg-danger/90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function PillButton({
  variant = "primary",
  size = "md",
  full = false,
  className = "",
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
        full ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
